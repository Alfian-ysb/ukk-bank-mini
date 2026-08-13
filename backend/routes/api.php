<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/staff/login', [App\Http\Controllers\Api\AuthStaffController::class, 'Login']);
Route::post('/customer/login', [App\Http\Controllers\Api\Customer\AuthCustomersController::class, 'login']);
Route::post('/customer/logout', [App\Http\Controllers\Api\Customer\AuthCustomersController::class, 'logout']);
Route::post('/staff/logout', [App\Http\Controllers\Api\AuthStaffController::class, 'logout']);


Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/staff', [App\Http\Controllers\Api\UserManagement::class, 'index']);
    Route::get('/staff/{id}', [App\Http\Controllers\Api\UserManagement::class, 'view']);

    Route::post('/staff', [App\Http\Controllers\Api\UserManagement::class, 'create']);
    Route::patch('/staff/{id}', [App\Http\Controllers\Api\UserManagement::class, 'update']);
    Route::delete('/staff/{id}', [App\Http\Controllers\Api\UserManagement::class, 'delete']);

    Route::get('/customers', [App\Http\Controllers\Api\Customer\CustomerManagement::class, 'index']);
    Route::get('/customers/{id}', [App\Http\Controllers\Api\Customer\CustomerManagement::class, 'view']);
    Route::post('/customers', [App\Http\Controllers\Api\Customer\CustomerManagement::class, 'create']);
    Route::patch('/customers/{id}', [App\Http\Controllers\Api\Customer\CustomerManagement::class, 'update']);
    Route::delete('/customers/{id}', [App\Http\Controllers\Api\Customer\CustomerManagement::class, 'delete']);
});

Route::prefix('teller')->middleware(['auth:sanctum', 'role:teller'])->group(function () {
    Route::post('/customer', [App\Http\Controllers\Api\Teller\TransactionController::class, 'GetCustomer']);
    Route::post('/customer/{id}/transaction', [App\Http\Controllers\Api\Teller\TransactionController::class, 'StoreTransaction']);
});
