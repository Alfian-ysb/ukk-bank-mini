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
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UserManagement extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);
        $users = User::withTrashed()
            ->orderBy('id')
            ->paginate($validated['per_page'] ?? 15);

        return response()->json([
            'status' => 'success',
            'data' => StaffResource::collection($users->items())->resolve(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'last_page' => $users->lastPage(),
                'from' => $users->firstItem(),
                'to' => $users->lastItem(),
            ],
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
            $user = User::withTrashed()->findOrFail($id);
            return response()->json([
                'status' => 'success',
                'data' => (new StaffResource($user))->resolve(),
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
            $validated = $request->validate([
                'username' => 'sometimes|required|string|unique:users,username,'.$id,
                'full_name' => 'sometimes|required|string',
                'password' => 'sometimes|required|string|min:6',
                'role' => 'sometimes|required|string|in:admin,supervisor,teller',
            ]);

            $user = User::findOrFail($id);
            if (
                ($validated['role'] ?? null) !== null
                && $validated['role'] !== 'admin'
                && $user->role === 'admin'
            ) {
                if ((int) $user->id === (int) $request->user()->id) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Admin tidak dapat mengubah role akunnya sendiri.',
                    ], 403);
                }

                if (User::where('role', 'admin')->count() <= 1) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Minimal harus ada satu admin aktif.',
                    ], 409);
                }
            }

            $user->update($validated);

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

    public function deactivate(Request $request, $id): JsonResponse
    {
        if ((int) $request->user()->id === (int) $id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak dapat menonaktifkan akun sendiri.',
            ], 403);
        }

        return DB::transaction(function () use ($id) {
            $activeAdmins = User::where('role', 'admin')
                ->orderBy('id')
                ->lockForUpdate()
                ->get(['id']);
            $user = User::lockForUpdate()->find($id);

            if (! $user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not found',
                ], 404);
            }

            if ($user->role === 'admin' && $activeAdmins->count() <= 1) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Admin terakhir tidak dapat dinonaktifkan.',
                ], 409);
            }

            $user->delete();
            $user->tokens()->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Staff berhasil dinonaktifkan.',
            ]);
        });
    }

    public function activate($id): JsonResponse
    {
        $user = User::withTrashed()->find($id);

        if (! $user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found',
            ], 404);
        }

        if (! $user->trashed()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Staff sudah aktif.',
            ], 409);
        }

        $user->restore();

        return response()->json([
            'status' => 'success',
            'message' => 'Staff berhasil diaktifkan kembali.',
            'data' => (new StaffResource($user->refresh()))->resolve(),
        ]);
    }
}
