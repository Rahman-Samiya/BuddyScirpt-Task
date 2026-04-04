<?php

use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    include_once 'Post/post.php';

    include_once 'Like/like.php';
    
    include_once 'Comment/comment.php';
});