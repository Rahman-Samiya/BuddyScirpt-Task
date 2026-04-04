<?php

use App\Http\Controllers\User\UserController;
use Illuminate\Support\Facades\Route;

// Protected user routes (require authentication)
Route::middleware('auth:sanctum')->prefix('/user')->controller(UserController::class)->group(function () {
    Route::put('/update-profile', 'updateProfile');
    Route::put('/update-password', 'updatePassword');
});
