<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\General;
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
