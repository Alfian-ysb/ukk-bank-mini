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

    public function changePin(Request $request)
    {
        $request->validate([
            'old_pin' => 'required|string',
            'new_pin' => 'required|string|min:4|max:6',
        ]);

        $customer = $request->user();

        if (!password_verify($request->old_pin, $customer->pin)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Old PIN is incorrect'
            ], 400);
        }

        $customer->pin = bcrypt($request->new_pin);
        $customer->save();

        return response()->json([
            'status' => 'success',
            'message' => 'PIN changed successfully'
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'old_password' => 'required|string',
            'new_password' => 'required|string|min:6',
        ]);

        $customer = $request->user();

        if (!password_verify($request->old_password, $customer->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Old password is incorrect'
            ], 400);
        }

        $customer->password = bcrypt($request->new_password);
        $customer->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Password changed successfully'
        ]);
    }
}
