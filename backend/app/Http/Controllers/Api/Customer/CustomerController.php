<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CustomerController extends Controller
{
    public function history(Request $request)
    {
        $customer = $request->user()->id;

        $history = Transaction::where('customer_id', $customer)->get();

        return response()->json([
            'status' => 'success',
            'data' => $history
        ]);
    }

    public function latestHistory(){
        
        // mengambil 5 transaksi terakhir dari nasabah yang sedang login
        $customer = Auth::user();
        $latestTransactions = Transaction::where('customer_id', $customer->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $latestTransactions
        ]);
    }
}
