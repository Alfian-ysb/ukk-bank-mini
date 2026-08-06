<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/login', [App\Http\Controllers\Api\Auth::class, 'Login']);

Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/users', [App\Http\Controllers\Api\UserManagement::class, 'index']);
    Route::post('/users', [App\Http\Controllers\Api\UserManagement::class, 'create']);
});