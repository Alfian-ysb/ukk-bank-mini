<?php

namespace App\Http\Controllers\Api\Customer;

use App\Actions\CreateCustomerAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerManagement extends Controller
{
    public function index()
    {
        $customers = Customer::with('user')->get();
        return response()->json([
            'status' => 'success',
            'data' => $customers,
        ]);
    }

    public function view($id)
    {
        try {
            $customer = Customer::findOrFail($id);
            return response()->json([
                'status' => 'success',
                'data' => $customer,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Customer not found',
            ], 404);
        }
    }



    public function create(StoreCustomerRequest $request, CreateCustomerAction $action): JsonResponse
    {
        $customer = $action->execute($request->validated());

        return response()->json([
            'status'  => 'success',
            'message' => 'Customer created successfully',
            'data'    => new CustomerResource($customer),
        ], 201);
    }

    // public function create(Request $request){
    //     $request->validate([
    //         'username' => 'required|string|unique:users,username',
    //         'full_name' => 'required|string',
    //         'account_number' => 'required|string|unique:customers,account_number',
    //         'nis' => 'required|string|unique:customers,nis',
    //         'student_name' => 'required|string',
    //         'class' => 'required|string',
    //         'pin' => 'required|string|min:4|max:6',
    //     ]);

    //     DB::transaction(function () use ($request) {
    //         $user = User::create([
    //             'username' => $request->username,
    //             'full_name' => $request->full_name,
    //             'password' => bcrypt($request->pin),
    //             'role' => 'customer',
    //         ]);

    //         Customer::create([
    //             'user_id' => $user->id,
    //             'account_number' => $request->account_number,
    //             'nis' => $request->nis,
    //             'student_name' => $request->student_name,
    //             'class' => $request->class,
    //             'status' => 'active',
    //             'pin' => bcrypt($request->pin),
    //         ]);
    //     });

    //     return response()->json([
    //         'status' => 'success',
    //         'message' => 'Customer created successfully',
    //         'data' => [
    //             'username' => $request->username,
    //             'full_name' => $request->full_name,
    //             'account_number' => $request->account_number,
    //             'nis' => $request->nis,
    //             'student_name' => $request->student_name,
    //             'class' => $request->class,
    //             'status' => 'active',
    //         ],
    //     ]);
    // }
}
