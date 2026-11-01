<?php

namespace App\Http\Controllers\Api\Supervisor;

use App\Http\Controllers\Controller;
use App\Models\AccountingJournal;
use App\Models\Transaction;
use Illuminate\Http\Request;

class SupervisorController extends Controller
{
    public function accountingJournal()
    {
        $journals = AccountingJournal::with(['transaction', 'transaction.customer', 'transaction.user'])->get();
        
        if (!$journals) {
            return response()->json([
                'status' => 'error',
                'message' => 'No accounting journals found',
            ], 404);
        }
        
        return response()->json([
            'status' => 'success',
            'data' => $journals,
        ]);
    }

    public function getAllTransactions(){
        $transactions = Transaction::with(['customer', 'user'])->get();

        if ($transactions->isEmpty()) {
            return response()->json([
                'status' => 'error',
                'message' => 'No transactions found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $transactions,
        ]);
    }
}
