<?php

namespace App\Http\Controllers\Api\Teller;

use App\Enums\DenominationType;
use App\Enums\ShiftStatus;
use App\Enums\TransactionTypes;
use App\Http\Controllers\Controller;
use App\Http\Requests\CloseShiftRequest;
use App\Http\Requests\OpenShiftRequest;
use App\Models\Shift;
use App\Models\ShiftDenomination;
use App\Models\Transaction;
use App\Models\CashTransfer;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Throwable;

class ShiftController extends Controller
{
    public function getCurrentShift()
    {
        $shift = Shift::where('status', ShiftStatus::OPEN)
            ->whereDate('shift_date', now()->toDateString())
            ->with(['denominations', 'cashTransfers'])
            ->first();

        if (!$shift) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tidak ada shift open untuk hari ini.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $shift,
        ]);
    }
    public function open(OpenShiftRequest $request)
    {
        // $date = $request->input('shift_date', now()->toDateString());

        $date = now()->toDateString();
        $alreadyExists = Shift::whereDate('shift_date', $date)->exists();
        if ($alreadyExists) {
            return response()->json([
                'status' => 'error',
                'message' => 'Shift untuk tanggal tersebut sudah pernah dibuat.',
            ], 409);
        }

        $shift = DB::transaction(function () use ($request, $date) {
            $denominations = $request->input('opening_denominations');
            $openingBalance = $this->calculateDenominations($denominations);

            $shift = Shift::create([
                'shift_date' => $date,
                'status' => ShiftStatus::OPEN,
                'opening_balance' => $openingBalance,
                'assigned_staff' => $request->input('assigned_staff'),
                'opened_by' => Auth::id(),
            ]);

            $this->storeDenominations($shift, DenominationType::OPENING, $denominations);
            CashTransfer::create([
                'shift_id' => $shift->id,
                'amount' => $openingBalance,
                'from_location' => 'Brankas Utama',
                'to_location' => 'Loket',
                'transferred_by' => Auth::id(),
            ]);

            return $shift->load(['denominations', 'cashTransfers']);
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Shift berhasil dibuka.',
            'data' => $shift,
        ], 201);
    }

    public function close(CloseShiftRequest $request)
    {
        try {
            $shift = DB::transaction(function () use ($request) {
                $shift = Shift::where('status', ShiftStatus::OPEN)
                    ->whereDate('shift_date', now()->toDateString())
                    ->lockForUpdate()
                    ->firstOrFail();

                $totals = Transaction::where('shift_id', $shift->id)
                    ->selectRaw(
                        'COALESCE(SUM(CASE WHEN transaction_type = ? THEN amount ELSE 0 END), 0) as total_deposits,
                         COALESCE(SUM(CASE WHEN transaction_type = ? THEN amount ELSE 0 END), 0) as total_withdrawals',
                        [TransactionTypes::DEPOSIT->value, TransactionTypes::WITHDRAWAL->value]
                    )
                    ->first();

                $digitalBalance = $shift->opening_balance + (int) $totals->total_deposits - (int) $totals->total_withdrawals;
                $physicalBalance = $this->calculateDenominations($request->input('closing_denominations'));
                $difference = $physicalBalance - $digitalBalance;

                if ($difference !== 0) {
                    throw ValidationException::withMessages([
                        'closing_denominations' => [
                            'Saldo fisik tidak sama dengan saldo digital.',
                            "Selisih: {$difference}. Laporan belum dikunci.",
                        ],
                    ]);
                }

                $shift->update([
                    'status' => ShiftStatus::CLOSED,
                    'total_deposits' => (int) $totals->total_deposits,
                    'total_withdrawals' => (int) $totals->total_withdrawals,
                    'closing_digital_balance' => $digitalBalance,
                    'closing_physical_balance' => $physicalBalance,
                    'difference' => $difference,
                    'closed_by' => Auth::id(),
                    'closed_at' => now(),
                ]);
                $this->storeDenominations(
                    $shift,
                    DenominationType::CLOSING,
                    $request->input('closing_denominations')
                );

                return $shift->load('denominations');
            });
        } catch (ValidationException $exception) {
            return response()->json([
                'status' => 'warning',
                'message' => 'Penutupan kas dibatalkan karena terdapat selisih.',
                'errors' => $exception->errors(),
            ], 422);
        } catch (ModelNotFoundException) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tidak ada shift open untuk hari ini.',
            ], 404);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'status' => 'error',
                'message' => 'Penutupan kas gagal diproses.',
            ], 500);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Shift berhasil ditutup dan laporan harian tersimpan pada shift.',
            'data' => $shift,
        ]);
    }

    private function calculateDenominations(array $denominations): int
    {
        return array_sum(array_map(
            fn (array $item): int => (int) $item['denomination'] * (int) $item['quantity'],
            $denominations
        ));
    }

    private function storeDenominations(Shift $shift, DenominationType $type, array $denominations): void
    {
        foreach ($denominations as $item) {
            ShiftDenomination::create([
                'shift_id' => $shift->id,
                'type' => $type,
                'denomination' => $item['denomination'],
                'quantity' => $item['quantity'],
                'amount' => $item['denomination'] * $item['quantity'],
            ]);
        }
    }
}
