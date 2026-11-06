<?php

namespace App\Services;

use App\Enums\ShiftStatus;
use App\Enums\TransactionRequestStatus;
use App\Models\AccountingJournal;
use App\Models\Customer;
use App\Models\General;
use App\Models\Transaction;
use App\Models\TransactionRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class TransactionApprovalService
{
    private const MAX_VERIFICATION_ATTEMPTS = 3;

    public function __construct(
        private readonly FirebaseMessagingService $messaging,
    ) {
    }

    public function expireIfNeeded(TransactionRequest $request): TransactionRequest
    {
        if (
            $request->status === TransactionRequestStatus::PENDING
            && $request->expires_at->isPast()
        ) {
            $request->update(['status' => TransactionRequestStatus::EXPIRED]);
            $request->refresh();
        }

        return $request;
    }

    public function approve(TransactionRequest $request, ?string $pin = null): TransactionRequest
    {
        $verificationFailure = null;

        $completed = DB::transaction(function () use ($request, $pin, &$verificationFailure) {
            $request = TransactionRequest::query()
                ->whereKey($request->id)
                ->lockForUpdate()
                ->firstOrFail();

            $this->expireIfNeeded($request);

            if ($request->status !== TransactionRequestStatus::PENDING) {
                throw ValidationException::withMessages([
                    'request' => 'Permintaan transaksi sudah diproses atau tidak lagi tersedia.',
                ]);
            }

            $customer = Customer::query()
                ->whereKey($request->customer_id)
                ->lockForUpdate()
                ->firstOrFail();

            if (
                $request->transaction_type === 'withdrawal'
                && ($pin === null || ! Hash::check($pin, $customer->pin))
            ) {
                $attempts = $request->verification_attempts + 1;
                $request->update([
                    'verification_attempts' => $attempts,
                    ...($attempts >= self::MAX_VERIFICATION_ATTEMPTS
                        ? [
                            'status' => TransactionRequestStatus::REJECTED,
                            'rejected_at' => now(),
                        ]
                        : []),
                ]);

                if ($attempts >= self::MAX_VERIFICATION_ATTEMPTS) {
                    $verificationFailure = ValidationException::withMessages([
                        'request' => 'Transaksi dibatalkan karena PIN salah 3 kali.',
                    ]);
                } else {
                    $verificationFailure = ValidationException::withMessages([
                        'pin' => "PIN tidak valid. Sisa percobaan: ".(self::MAX_VERIFICATION_ATTEMPTS - $attempts).".",
                    ]);
                }

                return null;
            }

            $shift = $request->shift()->lockForUpdate()->firstOrFail();
            $minimumBalance = (int) (General::where('name', 'minimum_balance')->value('value') ?? 10000);

            if ($shift->status !== ShiftStatus::OPEN) {
                throw ValidationException::withMessages([
                    'request' => 'Shift transaksi sudah tidak terbuka.',
                ]);
            }

            if (
                $request->transaction_type === 'withdrawal'
                && $customer->balance - $request->amount <= $minimumBalance
            ) {
                throw ValidationException::withMessages([
                    'amount' => 'Saldo tidak mencukupi untuk melakukan penarikan.',
                ]);
            }

            $request->update(['status' => TransactionRequestStatus::APPROVED, 'approved_at' => now()]);

            if ($request->transaction_type === 'deposit') {
                $customer->increment('balance', $request->amount);
            } else {
                $customer->decrement('balance', $request->amount);
            }

            $transaction = Transaction::create([
                'customer_id' => $request->customer_id,
                'user_id' => $request->user_id,
                'shift_id' => $request->shift_id,
                'transaction_type' => $request->transaction_type,
                'date' => now(),
                'amount' => $request->amount,
            ]);

            $this->createJournals($transaction);

            $request->update([
                'status' => TransactionRequestStatus::COMPLETED,
                'completed_at' => now(),
            ]);

            return $request->fresh(['customer']);
        });

        if ($verificationFailure instanceof ValidationException) {
            throw $verificationFailure;
        }

        return $completed;
    }

    public function reject(TransactionRequest $request): TransactionRequest
    {
        return DB::transaction(function () use ($request) {
            $locked = TransactionRequest::query()
                ->whereKey($request->id)
                ->lockForUpdate()
                ->firstOrFail();

            $this->expireIfNeeded($locked);

            if ($locked->status !== TransactionRequestStatus::PENDING) {
                throw ValidationException::withMessages([
                    'request' => 'Permintaan transaksi sudah diproses atau tidak lagi tersedia.',
                ]);
            }

            $locked->update([
                'status' => TransactionRequestStatus::REJECTED,
                'rejected_at' => now(),
            ]);

            return $locked->fresh();
        });
    }

    private function createJournals(Transaction $transaction): void
    {
        $amount = $transaction->amount;
        $entries = $transaction->transaction_type === 'deposit'
            ? [['account_code' => '101', 'position' => 'debit'], ['account_code' => '201', 'position' => 'credit']]
            : [['account_code' => '201', 'position' => 'debit'], ['account_code' => '101', 'position' => 'credit']];

        foreach ($entries as $entry) {
            AccountingJournal::create($entry + [
                'transaction_id' => $transaction->id,
                'amount' => $amount,
            ]);
        }
    }

    public function sendApprovalNotification(TransactionRequest $request): void
    {
        $token = $request->customer->fcm_token;

        if (! $token) {
            return;
        }

        try {
            $this->messaging->sendToToken(
                $token,
                'Persetujuan transaksi',
                'Ada transaksi yang memerlukan persetujuan Anda.',
                [
                    'type' => 'transaction_approval',
                    'request_id' => (string) $request->id,
                    'transaction_type' => (string) $request->transaction_type,
                    'amount' => (string) $request->amount,
                ],
            );
        } catch (\Throwable $exception) {
            report($exception);
            throw new RuntimeException('Notifikasi persetujuan transaksi gagal dikirim.', 0, $exception);
        }
    }
}
