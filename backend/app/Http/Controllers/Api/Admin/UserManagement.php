<?php

namespace App\Http\Controllers\Api\Admin;

use App\Actions\CreateStaffAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStaffRequest;
use App\Http\Resources\StaffResource;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class UserManagement extends Controller
{
    public function index()
    {
        $user = User::all();
        return response()->json([
            'status' => 'success',
            'data' => $user,
        ]);
    }

    public function create(StoreStaffRequest $request, CreateStaffAction $action): JsonResponse{
        $staff = $action->execute($request->validated());

        return response()->json([
            'status'  => 'success',
            'message' => 'Staff created successfully',
            'data'    => new StaffResource($staff),
        ], 201);
    }

    // public function create(Request $request)
    // {
    //     try {
    //         $request->validate([
    //             'username' => 'required|string|unique:users,username',
    //             'full_name' => 'required|string',
    //             'password' => 'required|string|min:6',
    //             'role' => 'required|string|in:admin,supervisor,teller',
    //         ]);

    //         $user = User::create([
    //             'username' => $request->username,
    //             'full_name' => $request->full_name,
    //             'password' => bcrypt($request->password),
    //             'role' => $request->role,
    //         ]);

    //         return response()->json([
    //             'status' => 'success',
    //             'message' => 'User created successfully',
    //             'data' => $user,
    //         ]);

    //     } catch (ValidationException $e) {
    //         return response()->json([
    //             'status' => 'error',
    //             'message' => 'Validation failed',
    //             'errors' => $e->errors(),
    //         ], 422);
    //     }
    // }

    public function view($id){
        try{
            $user = User::findOrFail($id);
            return response()->json([
                'status' => 'success',
                'data' => $user,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found',
            ], 404);
        }
    }

    public function update(Request $request, $id){
        try{
            $request->validate([
                'username' => 'sometimes|required|string|unique:users,username,'.$id,
                'full_name' => 'sometimes|required|string',
                'password' => 'sometimes|required|string|min:6',
                'role' => 'sometimes|required|string|in:admin,supervisor,teller',
            ]);

            $user = User::findOrFail($id);
            $user->update($request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'User updated successfully',
                'data' => $user,
            ]);
        }catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }
    }

    public function delete($id){
        try {
            $user = User::findOrFail($id);
            $user->delete();
            return response()->json([
                'status' => 'success',
                'message' => 'User deleted successfully',
            ]);
            
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found',
            ], 404);
        }
    }
}
