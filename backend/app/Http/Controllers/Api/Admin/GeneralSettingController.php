<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\General;
use App\Models\User;
use Illuminate\Http\Request;

class GeneralSettingController extends Controller
{
    public function index()
    {
        $settings = General::all();
        return response()->json([
            'status' => 'success',
            'data' => $settings
        ]);
    }

    public function getTotalUser()
    {
        $totalStaff = User::count();
        $totalCustomer = Customer::count();
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'total_staff' => $totalStaff,
                'total_customer' => $totalCustomer,
            ]
        ]);
        
    }

    public function update(Request $request, $id)
    {
        $setting = General::find($id);
        if (!$setting) {
            return response()->json([
                'status' => 'error',
                'message' => 'Setting not found'
            ], 404);
        }

        $request->validate([
            'value' => 'required|string',
        ]);

        $setting->value = $request->value;
        $setting->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Setting updated successfully',
            'data' => $setting
        ]);
    }
}
