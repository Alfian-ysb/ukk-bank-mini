<?php

namespace App\Http\Controllers\Api\Admin;

use App\Actions\CreateCustomerAction;
use App\Actions\UpdateCustomerAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class CustomerManagement extends Controller
{
    public function index()
    {
        $customers = Customer::all();
        return response()->json([
            'status' => 'success',
            'data' => [
                'account_number' => $customers->account_number,
                'nis' => $customers->nis,
                'student_name' => $customers->student_name,
                'status' => $customers->status,
                'balance' => $customers->balance,
            ],
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
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
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

    public function update(UpdateCustomerRequest $updateCustomerRequest, $id){
        try {
            $customer = Customer::findOrFail($id);
            $updateCustomerAction = new UpdateCustomerAction();
            $updateCustomerAction->execute($customer, $updateCustomerRequest->validated());

            return response()->json([
                'status'  => 'success',
                'message' => 'Customer updated successfully',
                'data'    => new CustomerResource($customer),
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    public function delete($id){
        try {
            $customer = Customer::findOrFail($id);
            $customer->delete();

            return response()->json([
                'status'  => 'success',
                'message' => 'Customer deleted successfully',
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 404);
        }
    }
}
