<?php

namespace App\Http\Controllers\Api\Teller;

use App\Http\Controllers\Controller;
use App\Models\AccountingJournal;
use App\Models\Customer;
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
            "pin" => "required|digits:6",
        ]);

        $customer = Customer::find($id);

        if (!$customer) {
            return response()->json([
                'status' => 'error',
                'message' => 'Customer not found',
            ], 404);
        }

        if (!password_verify($request->input('pin'), $customer->pin)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid PIN',
            ], 401);
        }
        DB::transaction(function () use ($customer, $request) {
            if ($request->input('transaction_type') === 'deposit') {
                $customer->balance += $request->input('amount');
                $customer->save();

                Transaction::create([
                    'customer_id' => $customer->id,
                    'user_id' => Auth::id(),
                    'transaction_type' => $request->input('transaction_type'),
                    'date' => now(),
                    'amount' => $request->input('amount'),
                ]);

                AccountingJournal::create([
                    'transaction_id' => Transaction::latest()->first()->id,
                    'account_code' => '101',
                    'position' => 'debit',
                    'amount' => $request->input('amount'),
                ]);

                AccountingJournal::create([
                    'transaction_id' => Transaction::latest()->first()->id,
                    'account_code' => '201',
                    'position' => 'credit',
                    'amount' => $request->input('amount'),
                ]);
                
            } else {
                if ($customer->balance - $request->input('amount') <= 10000) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'balance is insufficient to make a withdrawal',
                    ], 400);
                }
                $customer->balance -= $request->input('amount');
                $customer->save();

                Transaction::create([
                    'customer_id' => $customer->id,
                    'user_id' => Auth::id(),
                    'transaction_type' => $request->input('transaction_type'),
                    'date' => now(),
                    'amount' => $request->input('amount'),
                ]);

                AccountingJournal::create([
                    'transaction_id' => Transaction::latest()->first()->id,
                    'account_code' => '201',
                    'position' => 'debit',
                    'amount' => $request->input('amount'),
                ]);
                AccountingJournal::create([
                    'transaction_id' => Transaction::latest()->first()->id,
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
}
