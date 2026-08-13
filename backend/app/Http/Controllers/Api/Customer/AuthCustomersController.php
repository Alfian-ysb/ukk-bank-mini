<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthCustomersController extends Controller
{
    public function login(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'nis'          => 'required|string',
                'password' => 'required|string',
            ], [
                'nis.required'          => 'NIS wajib diisi.',
                'password.required' => 'password keamanan wajib diisi.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Validasi gagal',
                    'errors'  => $validator->errors()
                ], 422);
            }

            $nasabah = Customer::where('nis', $request->nis)->first();

            if (!$nasabah || !Hash::check($request->password, $nasabah->password)) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'NIS atau password Keamanan salah.'
                ], 401);
            }

            if (isset($nasabah->status) && $nasabah->status === 'blocked') {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Rekening Anda terblokir. Silakan hubungi petugas loket.'
                ], 403);
            }

            $nasabah->tokens()->delete();

            $token = $nasabah->createToken('nasabah-token', ['role:nasabah'])->plainTextToken;

            return response()->json([
                'status'  => 'success',
                'message' => 'Login nasabah berhasil',
                'token'   => $token,
                'data'    => $nasabah
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Login failed', 'error' => $e->getMessage()], 500);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Logout berhasil',
        ]);
    }
}
