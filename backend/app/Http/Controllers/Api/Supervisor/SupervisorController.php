<?php

namespace App\Http\Controllers\Api\Supervisor;

use App\Http\Controllers\Controller;
use App\Models\AccountingJournal;
use Illuminate\Http\Request;

class SupervisorController extends Controller
{
    public function accountingJournal(Request $request)
    {
        $journals = AccountingJournal::all();
        
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
        $transactions = AccountingJournal::all();

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
