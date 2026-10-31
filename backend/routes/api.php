<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/staff/login', [App\Http\Controllers\Api\AuthStaffController::class, 'Login']);
Route::post('/customer/login', [App\Http\Controllers\Api\AuthCustomersController::class, 'login']);
Route::post('/customer/logout', [App\Http\Controllers\Api\AuthCustomersController::class, 'logout']);
Route::post('/staff/logout', [App\Http\Controllers\Api\AuthStaffController::class, 'logout']);



Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/staff', [App\Http\Controllers\Api\Admin\UserManagement::class, 'index']);
    Route::get('/staff/{id}', [App\Http\Controllers\Api\Admin\UserManagement::class, 'view']);

    Route::post('/staff', [App\Http\Controllers\Api\Admin\UserManagement::class, 'create']);
    Route::patch('/staff/{id}', [App\Http\Controllers\Api\Admin\UserManagement::class, 'update']);
    Route::delete('/staff/{id}', [App\Http\Controllers\Api\Admin\UserManagement::class, 'delete']);

    Route::get('/customers', [App\Http\Controllers\Api\Admin\CustomerManagement::class, 'index']);
    Route::get('/customers/{id}', [App\Http\Controllers\Api\Admin\CustomerManagement::class, 'view']);
    Route::post('/customers', [App\Http\Controllers\Api\Admin\CustomerManagement::class, 'create']);
    Route::patch('/customers/{id}', [App\Http\Controllers\Api\Admin\CustomerManagement::class, 'update']);
    Route::delete('/customers/{id}', [App\Http\Controllers\Api\Admin\CustomerManagement::class, 'delete']);
    Route::get('/vault/balance', [App\Http\Controllers\Api\Supervisor\ShiftApprovalController::class, 'vaultBalance']);
    Route::post('/vault/opening-balance', [App\Http\Controllers\Api\Admin\VaultController::class, 'setupOpeningBalance']);
});

Route::prefix('teller')->middleware(['auth:sanctum', 'role:teller'])->group(function () {
    Route::get('/shifts/current', [App\Http\Controllers\Api\Teller\ShiftController::class, 'getCurrentShift']);
    Route::post('/shifts/open', [App\Http\Controllers\Api\Teller\ShiftController::class, 'open']);
    Route::post('/shifts/close', [App\Http\Controllers\Api\Teller\ShiftController::class, 'close']);
    Route::post('/customer', [App\Http\Controllers\Api\Teller\TransactionController::class, 'GetCustomer']);
    Route::post('/customer/{id}/transaction', [App\Http\Controllers\Api\Teller\TransactionController::class, 'StoreTransaction']);
    Route::post('/daily-report', [App\Http\Controllers\Api\Teller\TransactionController::class, 'initiateDailyReport']);
});

Route::prefix('supervisor')->middleware(['auth:sanctum', 'role:supervisor'])->group(function () {
    Route::patch('/shifts/{shift}/approve', [App\Http\Controllers\Api\Supervisor\ShiftApprovalController::class, 'approve']);
    Route::get('/shifts', [App\Http\Controllers\Api\Supervisor\ShiftApprovalController::class, 'getAllShifts']);
    Route::get('/shifts/{shift}', [App\Http\Controllers\Api\Supervisor\ShiftApprovalController::class, 'ShiftDetails']);
    Route::get('/vault/balance', [App\Http\Controllers\Api\Supervisor\ShiftApprovalController::class, 'vaultBalance']);
    Route::get('/customers', [App\Http\Controllers\Api\Admin\CustomerManagement::class, 'index']);
    Route::get('/transactions', [App\Http\Controllers\Api\Supervisor\SupervisorController::class, 'getAllTransactions']);
    Route::get('/journals', [App\Http\Controllers\Api\Supervisor\SupervisorController::class, 'accountingJournal']);
});

Route::prefix('customer')->middleware(['auth:sanctum'])->group(function () {
    Route::get('/profile', [App\Http\Controllers\Api\AuthCustomersController::class, 'profile']);
    Route::get('/history', [App\Http\Controllers\Api\Customer\CustomerController::class, 'history']);
});
