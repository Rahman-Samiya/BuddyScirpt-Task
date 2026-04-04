<?php

use App\Http\Controllers\Api\CommentController;
use Illuminate\Support\Facades\Route;

Route::controller(CommentController::class)->group(function () {
    Route::get('/post/{postId}/comments', 'index')->name('index');
    Route::post('/post/comments/{postId}', 'store')->name('store');
    Route::put('/post/comments/{comment}', 'update')->name('update'); 
    Route::delete('/post/comments/{comment}', 'destroy')->name('destroy');
});