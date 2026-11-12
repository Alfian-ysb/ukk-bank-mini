<?php

namespace App\Http\Controllers\Api\Teller;

use App\Enums\ShiftStatus;
use App\Enums\TransactionRequestStatus;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\General;
use App\Models\Shift;
use App\Models\TransactionRequest;
use App\Services\TransactionApprovalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class TransactionController extends Controller
{
    public function __construct(
        private readonly TransactionApprovalService $approvalService,
    ) {}

    public function GetCustomer(Request $request)
    {
        $accountNumber = $request->input('account_number');
        $customer = Customer::where('account_number', $accountNumber)->first();

        if (! $customer) {
            return response()->json([
                'status' => 'error',
                'message' => 'Customer not found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $customer,
        ]);
    }

    public function getCustomerById(int $id)
    {
        $customer = Customer::find($id);

        if (! $customer) {
            return response()->json([
                'status' => 'error',
                'message' => 'Customer not found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $customer,
        ]);
    }


    public function StoreTransaction(Request $request, int $id)
    {
        $currentOpeningBalance = Shift::where('status', ShiftStatus::OPEN)
            ->whereDate('shift_date', now()->toDateString())
            ->value('opening_balance');
        $minimumWithdrawal = (int) (General::where('name', 'minimum_withdrawal')->value('value') ?? 10000);
        $maximumWithdrawal = (int) (General::where('name', 'max_withdrawal')->value('value') ?? 1000000);
        $validated = $request->validate([
            'transaction_type' => ['required', 'in:deposit,withdrawal'],
            'amount' => [
                'required',
                'decimal:0,2',
                Rule::when($request->transaction_type === 'withdrawal', ['min:' . $minimumWithdrawal]),
                Rule::when($request->transaction_type === 'withdrawal', ['max:' . $maximumWithdrawal]),
            ],
        ], [
            'amount.min' => 'Jumlah penarikan minimal adalah Rp' . $minimumWithdrawal . '.',
            'amount.max' => 'Jumlah penarikan maksimal adalah Rp' . $maximumWithdrawal . '.',
        ]);

        $shift = Shift::where('status', ShiftStatus::OPEN)
            ->whereDate('shift_date', now()->toDateString())
            ->first();

        if (! $shift) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tidak ada shift open untuk hari ini. Silakan buka shift terlebih dahulu sebelum melakukan transaksi.',
            ], 409);
        }

        $checkStatus = Customer::where('id', $id)->value('status');

        if ($checkStatus !== 'active') {
            return response()->json([
                'status' => 'error',
                'message' => 'Rekening nasabah tidak aktif. Transaksi tidak dapat diproses.',
            ], 403);
        }

        if ($validated['transaction_type'] === 'withdrawal' && $currentOpeningBalance < $validated['amount']) {
            return response()->json([
                'status' => 'error',
                'message' => 'Saldo kas teller tidak mencukupi untuk melakukan penarikan.',
            ], 409);
        }

        $customer = Customer::find($id);

        if (! $customer) {
            return response()->json([
                'status' => 'error',
                'message' => 'Customer not found',
            ], 404);
        }




        if (
            $validated['transaction_type'] === 'withdrawal'
            && $customer->balance - $validated['amount'] <= (int) (General::where('name', 'minimum_balance')->value('value') ?? 10000)
        ) {
            return response()->json([
                'status' => 'error',
                'message' => 'Saldo tidak mencukupi untuk melakukan penarikan. Saldo minimum harus tetap terjaga.',
            ], 409);
        }

        $transactionRequest = TransactionRequest::create([
            'customer_id' => $customer->id,
            'user_id' => Auth::id(),
            'shift_id' => $shift->id,
            'transaction_type' => $validated['transaction_type'],
            'amount' => $validated['amount'],
            'status' => TransactionRequestStatus::PENDING,
            'expires_at' => now()->addMinutes(2),
        ])->load('customer');

        if ($transactionRequest->transaction_type === 'deposit') {
            try {
                $completed = $this->approvalService->approve($transactionRequest);
            } catch (ValidationException $exception) {
                return response()->json([
                    'status' => 'error',
                    'message' => $exception->errors()['request'][0]
                        ?? 'Setoran tidak dapat diproses.',
                    'errors' => $exception->errors(),
                ], 409);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Setoran berhasil diproses.',
                'data' => [
                    'request_id' => $completed->id,
                    'transaction_type' => $completed->transaction_type,
                    'amount' => $completed->amount,
                    'status' => $completed->status->value,
                    'customer_balance' => $completed->customer->balance,
                    'completed_at' => $completed->completed_at,
                ],
            ]);
        }

        try {
            $this->approvalService->sendApprovalNotification($transactionRequest);
        } catch (RuntimeException $exception) {
            $transactionRequest->delete();

            return response()->json([
                'status' => 'error',
                'message' => $exception->getMessage(),
            ], 503);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Permintaan transaksi menunggu persetujuan nasabah.',
            'data' => [
                'request_id' => $transactionRequest->id,
                'transaction_type' => $transactionRequest->transaction_type,
                'amount' => $transactionRequest->amount,
                'status' => $transactionRequest->status->value,
                'status_url' => "/api/teller/transaction-requests/{$transactionRequest->id}",
                'expires_at' => $transactionRequest->expires_at,
            ],
        ], 202);
    }

    public function transactionRequestStatus(Request $request, TransactionRequest $transactionRequest)
    {
        if ($transactionRequest->user_id !== Auth::id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Permintaan transaksi tidak ditemukan.',
            ], 404);
        }

        $this->approvalService->expireIfNeeded($transactionRequest);

        // Muat relasi customer untuk mengambil saldo terbaru
        $transactionRequest->load('customer');

        return response()->json([
            'status' => 'success',
            'data' => [
                'request_id' => $transactionRequest->id,
                'transaction_type' => $transactionRequest->transaction_type,
                'amount' => $transactionRequest->amount,
                'status' => $transactionRequest->status->value,
                'customer_balance' => $transactionRequest->customer->balance,
                'expires_at' => $transactionRequest->expires_at,
                'approved_at' => $transactionRequest->approved_at,
                'rejected_at' => $transactionRequest->rejected_at,
                'completed_at' => $transactionRequest->completed_at,
            ],
        ]);
    }

    public function initiateDailyReport(Request $request)
    {
        $validated = $request->validate([
            'date' => ['nullable', 'date'],
        ]);
        $date = $validated['date'] ?? now()->toDateString();

        $shift = Shift::with([
            'denominations',
            'transactions' => fn($query) => $query->with(['customer', 'user'])->latest('date'),
        ])->whereDate('shift_date', $date)->first();

        if (! $shift) {
            return response()->json([
                'status' => 'error',
                'message' => 'Report shift tidak ditemukan untuk tanggal tersebut.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'shift_date' => $shift->shift_date,
                'status' => $shift->status,
                'opening_balance' => $shift->opening_balance,
                'total_deposits' => $shift->total_deposits,
                'total_withdrawals' => $shift->total_withdrawals,
                'closing_digital_balance' => $shift->closing_digital_balance,
                'closing_physical_balance' => $shift->closing_physical_balance,
                'difference' => $shift->difference,
                'assigned_staff' => $shift->assigned_staff,
                'opened_by' => $shift->opened_by,
                'closed_by' => $shift->closed_by,
                'approved_by' => $shift->approved_by,
                'closed_at' => $shift->closed_at,
                'approved_at' => $shift->approved_at,
                'denominations' => $shift->denominations,
                'transactions' => $shift->transactions,
            ],
        ]);
    }
}
