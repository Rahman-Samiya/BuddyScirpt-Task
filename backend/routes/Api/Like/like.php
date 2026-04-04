<?php

use App\Http\Controllers\Api\LikeController;
use Illuminate\Support\Facades\Route;

Route::post('/like/{type}/{id}', [LikeController::class, 'toggle']);
Route::get('/like/{type}/{id}', [LikeController::class, 'getLikes']);