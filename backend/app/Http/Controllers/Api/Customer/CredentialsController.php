<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CredentialsController extends Controller
{
    public function requestUpdatePin(Request $request)
    {
        $request->validate([
            'new_pin' => 'required|string|min:6|max:6',
        ]);

        $customer = $request->user();

        if (! $customer) {
            return response()->json([
                'status' => 'error',
                'message' => 'Customer not found.',
            ], 404);
        }

        $changePinRequest = $customer->changePinRequests()->create([
            'user_id' => $customer->id,
            'new_pin' => $request->input('new_pin'),
            'status' => 'pending',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Change PIN request submitted successfully.',
            'data' => [
                'request_id' => $changePinRequest->id,
                'status' => $changePinRequest->status,
            ],
        ]);
    }
}
