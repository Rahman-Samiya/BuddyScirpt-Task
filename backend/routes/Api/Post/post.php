<?php

use App\Http\Controllers\Api\PostController;
use Illuminate\Support\Facades\Route;

Route::controller(PostController::class)->prefix('/posts')->name('posts')->group(function () {
    Route::get('/', 'index')->name('index');
    Route::get('/user/{userId}', 'getPostsByUser')->name('user.posts');
    Route::post('/', 'store')->name('store');
    Route::get('/{post}', 'show')->name('show');
    Route::put('/{post}', 'update')->name('update');
    Route::post('/{post}', 'update')->name('update.post'); // For file uploads
    Route::delete('/{post}', 'destroy')->name('destroy');
});