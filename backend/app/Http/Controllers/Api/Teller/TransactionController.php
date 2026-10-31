<?php

namespace App\Http\Controllers\Api\Teller;

use App\Http\Controllers\Controller;
use App\Enums\ShiftStatus;
use App\Models\AccountingJournal;
use App\Models\Customer;
use App\Models\Shift;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function GetCustomer(Request $request)
    {
        $accountNumber = $request->input('account_number');
        $customer = Customer::where('account_number', $accountNumber)->first();

        if (!$customer) {
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
    public function StoreTransaction(Request $request, $id)
    {
        $request->validate([
            'transaction_type' => 'required|in:deposit,withdrawal',
            'amount' => 'required|numeric|min:10000',
            // "pin" => "required|digits:6",
        ]);

        $customer = Customer::find($id);

        if (!$customer) {
            return response()->json([
                'status' => 'error',
                'message' => 'Customer not found',
            ], 404);
        }

        // if (!password_verify($request->input('pin'), $customer->pin)) {
        //     return response()->json([
        //         'status' => 'error',
        //         'message' => 'Invalid PIN',
        //     ], 401);
        // }
        $shift = Shift::where('status', ShiftStatus::OPEN)
            ->whereDate('shift_date', now()->toDateString())
            ->first();

        if (!$shift) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tidak ada shift open untuk hari ini.',
            ], 409);
        }

        if (
            $request->input('transaction_type') === 'withdrawal'
            && $customer->balance - $request->input('amount') <= 10000
        ) {
            return response()->json([
                'status' => 'error',
                'message' => 'balance is insufficient to make a withdrawal',
            ], 400);
        }

        DB::transaction(function () use ($customer, $request, $shift) {
            $shift = Shift::whereKey($shift->id)
                ->where('status', ShiftStatus::OPEN)
                ->lockForUpdate()
                ->firstOrFail();

            if ($request->input('transaction_type') === 'deposit') {
                $customer->balance += $request->input('amount');
                $customer->save();

                $transaction = Transaction::create([
                    'customer_id' => $customer->id,
                    'user_id' => Auth::id(),
                    'shift_id' => $shift->id,
                    'transaction_type' => $request->input('transaction_type'),
                    'date' => now(),
                    'amount' => $request->input('amount'),
                ]);

                AccountingJournal::create([
                    'transaction_id' => $transaction->id,
                    'account_code' => '101',
                    'position' => 'debit',
                    'amount' => $request->input('amount'),
                ]);

                AccountingJournal::create([
                    'transaction_id' => $transaction->id,
                    'account_code' => '201',
                    'position' => 'credit',
                    'amount' => $request->input('amount'),
                ]);
                
            } else {
                $customer->balance -= $request->input('amount');
                $customer->save();

                $transaction = Transaction::create([
                    'customer_id' => $customer->id,
                    'user_id' => Auth::id(),
                    'shift_id' => $shift->id,
                    'transaction_type' => $request->input('transaction_type'),
                    'date' => now(),
                    'amount' => $request->input('amount'),
                ]);

                AccountingJournal::create([
                    'transaction_id' => $transaction->id,
                    'account_code' => '201',
                    'position' => 'debit',
                    'amount' => $request->input('amount'),
                ]);
                AccountingJournal::create([
                    'transaction_id' => $transaction->id,
                    'account_code' => '101',
                    'position' => 'credit',
                    'amount' => $request->input('amount'),
                ]);
            }
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Transaction successful',
            'data' => [
                'transaction_type' => $request->input('transaction_type'),
                'amount' => $request->input('amount'),
                'customer_balance' => $customer->balance,
                'transaction_date' => now(),
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
            'transactions' => fn ($query) => $query->with(['customer', 'user'])->latest('date'),
        ])->whereDate('shift_date', $date)->first();

        if (!$shift) {
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
