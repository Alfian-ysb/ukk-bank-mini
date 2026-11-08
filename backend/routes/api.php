<?php

use App\Http\Controllers\Api\Admin\CustomerManagement;
use App\Http\Controllers\Api\Admin\GeneralSettingController;
use App\Http\Controllers\Api\Admin\UserManagement;
use App\Http\Controllers\Api\Admin\VaultController;
use App\Http\Controllers\Api\AuthCustomersController;
use App\Http\Controllers\Api\AuthStaffController;
use App\Http\Controllers\Api\Customer\CustomerController;
use App\Http\Controllers\Api\CustomerPinResetController;
use App\Http\Controllers\Api\Supervisor\ShiftApprovalController;
use App\Http\Controllers\Api\Supervisor\SupervisorController;
use App\Http\Controllers\Api\Teller\ShiftController;
use App\Http\Controllers\Api\Teller\TransactionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/staff/login', [AuthStaffController::class, 'Login']);
Route::post('/customer/login', [AuthCustomersController::class, 'login']);
Route::post('/customer/forgot-password', [
    CustomerPinResetController::class,
    'requestPasswordReset',
])->middleware('throttle:5,1');
Route::post('/customer/verify-password-reset-otp', [
    CustomerPinResetController::class,
    'verifyPasswordResetOtp',
])->middleware('throttle:10,1');
Route::post('/customer/reset-password', [
    CustomerPinResetController::class,
    'resetPassword',
])->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/customer/logout', [AuthCustomersController::class, 'logout']);
    Route::post('/staff/logout', [AuthStaffController::class, 'logout']);
});
Route::get('/settings', [GeneralSettingController::class, 'index']);

Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/settings', [GeneralSettingController::class, 'index']);
    Route::patch('/settings/{id}', [GeneralSettingController::class, 'update']);
    Route::get('/settings/total-users', [GeneralSettingController::class, 'getTotalUser']);

    Route::get('/staff', [UserManagement::class, 'index']);
    Route::get('/staff/{id}', [UserManagement::class, 'view']);

    Route::post('/staff', [UserManagement::class, 'create']);
    Route::patch('/staff/{id}', [UserManagement::class, 'update']);
    Route::delete('/staff/{id}', [UserManagement::class, 'delete']);

    Route::get('/customers', [CustomerManagement::class, 'index']);
    Route::get('/customers/{id}', [CustomerManagement::class, 'view']);
    Route::post('/customers', [CustomerManagement::class, 'create']);
    Route::post('/customers/import', [CustomerManagement::class, 'import']);
    Route::patch('/customers/{id}', [CustomerManagement::class, 'update']);
    Route::delete('/customers/{id}', [CustomerManagement::class, 'delete']);

    Route::get('/vault/balance', [ShiftApprovalController::class, 'vaultBalance']);
    Route::get('/vault/opening-balance', [VaultController::class, 'getOpeningBalance']);
    Route::post('/vault/opening-balance', [VaultController::class, 'setupOpeningBalance']);

    Route::get('/transactions', [SupervisorController::class, 'getAllTransactions']);
    Route::get('/journals', [SupervisorController::class, 'accountingJournal']);
});

Route::prefix('teller')->middleware(['auth:sanctum', 'role:teller'])->group(function () {
    Route::get('/shifts/current', [ShiftController::class, 'getOpenedShift']);
    Route::post('/shifts/open', [ShiftController::class, 'open']);
    Route::post('/shifts/close', [ShiftController::class, 'close']);
    Route::post('/customer', [TransactionController::class, 'GetCustomer']);
    Route::get('/customer/{id}', [TransactionController::class, 'getCustomerById']);
    Route::post('/customer/{id}/transaction', [TransactionController::class, 'StoreTransaction']);
    Route::get('/transaction-requests/{transactionRequest}', [TransactionController::class, 'transactionRequestStatus']);
    Route::post('/daily-report', [TransactionController::class, 'initiateDailyReport']);
});

Route::prefix('supervisor')->middleware(['auth:sanctum', 'role:supervisor'])->group(function () {
    Route::patch('/shifts/{shift}/approve', [ShiftApprovalController::class, 'approve']);
    Route::get('/shifts', [ShiftApprovalController::class, 'getAllShifts']);
    Route::get('/shifts/{shift}', [ShiftApprovalController::class, 'ShiftDetails']);
    Route::get('/vault/balance', [ShiftApprovalController::class, 'vaultBalance']);
    Route::get('/customers', [CustomerManagement::class, 'index']);
    Route::post('/transactions', [SupervisorController::class, 'getAllTransactions']);
    Route::get('/journals', [SupervisorController::class, 'accountingJournal']);
    Route::get('/settings/total-users', [GeneralSettingController::class, 'getTotalUser']);
});

Route::prefix('customer')->middleware(['auth:sanctum'])->group(function () {
    Route::get('/profile', [AuthCustomersController::class, 'profile']);
    Route::post('/change-email/request-otp', [CustomerPinResetController::class, 'requestEmailChange'])->middleware('throttle:5,1');
    Route::post('/change-email/verify-otp', [CustomerPinResetController::class, 'verifyEmailChangeOtp'])->middleware('throttle:10,1');
    Route::post('/change-pin/request-otp', [CustomerPinResetController::class, 'requestReset'])->middleware('throttle:5,1');
    Route::post('/change-pin/verify-otp', [CustomerPinResetController::class, 'verifyOtp'])->middleware('throttle:10,1');
    Route::post('/change-pin/reset', [CustomerPinResetController::class, 'reset'])->middleware('throttle:10,1');
    Route::get('/history', [CustomerController::class, 'history']);
    Route::get('/history/latest', [CustomerController::class, 'latestHistory']);
    Route::post('/fcm-token', [CustomerController::class, 'updateFcmToken']);
    Route::get('/transaction-requests/{transactionRequest}', [CustomerController::class, 'transactionRequest']);
    Route::post('/transaction-requests/{transactionRequest}/approve', [CustomerController::class, 'approveTransactionRequest']);
    Route::post('/transaction-requests/{transactionRequest}/reject', [CustomerController::class, 'rejectTransactionRequest']);

    Route::post('/change-pin', [CustomerController::class, 'changePin']);
    Route::post('/change-password', [CustomerController::class, 'changePassword']);
});
