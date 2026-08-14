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
}
