<?php

namespace App\Http\Controllers\Api\Admin;

use App\Actions\CreateCustomerAction;
use App\Actions\UpdateCustomerAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Imports\CustomersImport;
use App\Models\Customer;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Maatwebsite\Excel\Facades\Excel;

class CustomerManagement extends Controller
{
    public function index()
    {
// #[Fillable('user_id', 'account_number', 'nis', 'student_name', 'major', 'cohort_year', 'pin', 'password', 'status', 'balance')]
        $customers = Customer::select([
                'id',
                'account_number',
                'nis',
                'student_name',
                'major',
                'cohort_year',
                'password',
                'status',
                'balance'
            ])->get();
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

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
        ]);

        $import = new CustomersImport(app(CreateCustomerAction::class));

        try {
            DB::transaction(function () use ($request, $import): void {
                Excel::import($import, $request->file('file'));
            });
        } catch (ValidationException $exception) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data CSV tidak valid.',
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'status' => 'success',
            'message' => "{$import->importedCount()} nasabah berhasil ditambahkan.",
            'data' => [
                'imported' => $import->importedCount(),
            ],
        ]);
    }

    public function update(UpdateCustomerRequest $updateCustomerRequest, $id)
    {
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

    public function delete($id)
    {
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
