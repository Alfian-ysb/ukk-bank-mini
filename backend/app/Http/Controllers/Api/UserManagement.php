<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class UserManagement extends Controller
{
    public function index(Request $request)
    {
        $user = User::all();
        return response()->json([
            'status' => 'success',
            'data' => $user,
        ]);
    }

    public function create(Request $request)
    {
        try {
            $request->validate([
                'username' => 'required|string|unique:users,username',
                'full_name' => 'required|string',
                'password' => 'required|string|min:6',
                'role' => 'required|string|in:admin,supervisor,teller',
            ]);

            $user = User::create([
                'username' => $request->username,
                'full_name' => $request->full_name,
                'password' => bcrypt($request->password),
                'role' => $request->role,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'User created successfully',
                'data' => $user,
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }
    }
}
