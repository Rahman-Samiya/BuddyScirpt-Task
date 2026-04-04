<?php

use App\Http\Controllers\User\AuthController;
use Illuminate\Support\Facades\Route;


Route::controller(AuthController::class)->prefix('/auth/user')->group(function () {
    // Public routes
    Route::post('/register', 'register');
    Route::post('/login', 'login');
    
    // Protected routes (require authentication)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', 'logout');
    });
});
