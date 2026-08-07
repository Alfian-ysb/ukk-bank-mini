<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/login', [App\Http\Controllers\Api\Auth::class, 'Login']);

Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/users', [App\Http\Controllers\Api\UserManagement::class, 'index']);
    Route::get('/users/{id}', [App\Http\Controllers\Api\UserManagement::class, 'view']);
    
    Route::post('/staff', [App\Http\Controllers\Api\UserManagement::class, 'create']);
    Route::patch('/staff/{id}', [App\Http\Controllers\Api\UserManagement::class, 'update']);

    Route::get('/customers', [App\Http\Controllers\Api\Customer\CustomerManagement::class, 'index']);
    Route::get('/customers/{id}', [App\Http\Controllers\Api\Customer\CustomerManagement::class, 'view']);
    Route::post('/customers', [App\Http\Controllers\Api\Customer\CustomerManagement::class, 'create']);
    Route::delete('/users/{id}', [App\Http\Controllers\Api\UserManagement::class, 'delete']);
});