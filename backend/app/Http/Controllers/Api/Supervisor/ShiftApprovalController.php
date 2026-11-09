<?php

namespace App\Http\Controllers\Api\Supervisor;

use App\Enums\ShiftStatus;
use App\Http\Controllers\Controller;
use App\Models\CashTransfer;
use App\Models\Shift;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Throwable;

class ShiftApprovalController extends Controller
{
    public function getAllShifts(Request $request)
    {
        $validated = $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'status' => ['sometimes', 'in:open,closed,approved'],
        ]);
        $query = Shift::with(['denominations', 'cashTransfers'])
            ->latest('shift_date')
            ->latest('id');

        if (isset($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        $shifts = $query->paginate($validated['per_page'] ?? 15);

        return response()->json([
            'status' => 'success',
            'data' => $shifts->items(),
            'pagination' => [
                'current_page' => $shifts->currentPage(),
                'per_page' => $shifts->perPage(),
                'total' => $shifts->total(),
                'last_page' => $shifts->lastPage(),
                'from' => $shifts->firstItem(),
                'to' => $shifts->lastItem(),
            ],
        ]);
    }

    public function ShiftDetails(Shift $shift)
    {
        return response()->json([
            'status' => 'success',
            'data' => $shift->load(['denominations', 'cashTransfers', 'transactions', 'transactions.customer']),
        ]);
    }

    public function vaultBalance()
    {
        $summary = CashTransfer::query()
            ->selectRaw("
                COALESCE(SUM(
                    CASE
                        WHEN to_location = ? THEN amount
                        ELSE 0
                    END
                ), 0) as total_in,
                COALESCE(SUM(
                    CASE
                        WHEN from_location = ? THEN amount
                        ELSE 0
                    END
                ), 0) as total_out
            ", ['Brankas Utama', 'Brankas Utama'])
            ->first();

        $totalIn = (int) $summary->total_in;
        $totalOut = (int) $summary->total_out;

        return response()->json([
            'status' => 'success',
            'data' => [
                'location' => 'Brankas Utama',
                'total_in' => $totalIn,
                'total_out' => $totalOut,
                'balance' => $totalIn - $totalOut,
            ],
        ]);
    }

    public function approve(Shift $shift)
    {
        try {
            $shift = DB::transaction(function () use ($shift) {
                $lockedShift = Shift::whereKey($shift->id)->lockForUpdate()->firstOrFail();

                if ($lockedShift->status !== ShiftStatus::CLOSED) {
                    throw ValidationException::withMessages([
                        'shift' => 'Hanya shift closed yang dapat di-approve.',
                    ]);
                }

                $lockedShift->update([
                    'status' => ShiftStatus::APPROVED,
                    'approved_by' => Auth::id(),
                    'approved_at' => now(),
                ]);

                if ($lockedShift->closing_physical_balance > 0) {
                    CashTransfer::create([
                        'shift_id' => $lockedShift->id,
                        'amount' => $lockedShift->closing_physical_balance,
                        'from_location' => 'Loket',
                        'to_location' => 'Brankas Utama',
                        'transferred_by' => Auth::id(),
                    ]);
                }

                return $lockedShift->load('cashTransfers');
            });
        } catch (ValidationException $exception) {
            return response()->json([
                'status' => 'error',
                'message' => 'Shift belum dapat di-approve.',
                'errors' => $exception->errors(),
            ], 422);
        } catch (ModelNotFoundException) {
            return response()->json([
                'status' => 'error',
                'message' => 'Shift tidak ditemukan.',
            ], 404);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'status' => 'error',
                'message' => 'Approval shift gagal diproses.',
            ], 500);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Shift berhasil di-approve.',
            'data' => $shift,
        ]);
    }
}
