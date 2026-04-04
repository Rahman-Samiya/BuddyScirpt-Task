<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Post\PostCreateRequest;
use App\Http\Requests\Post\PostUpdateRequest;
use App\Services\PostService;
use Illuminate\Http\Request;

class PostController extends Controller
{
    protected $postService;

    public function __construct(PostService $postService)
    {
        $this->postService = $postService;
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 10);
        $page = $request->query('page', 1);

        $posts = $this->postService->showAllPosts($request, $perPage);

        return response()->json($posts);
    }

    /**
     * Get all posts by a specific user (both private and public)
     */
    public function getPostsByUser(Request $request, $userId)
    {
        // Check if the authenticated user is requesting their own posts or is an admin
        // For now, allow authenticated users to see their own posts
        if (auth()->id() !== (int)$userId) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $perPage = $request->query('per_page', 10);
        $page = $request->query('page', 1);

        $posts = $this->postService->getPostsByUser($userId, $perPage);

        return response()->json($posts);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PostCreateRequest $request)
    {
        $post = $this->postService->createPost($request);

        return response()->json([
            'message' => 'Post created!',
            'post' => $post->load('user')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $post = $this->postService->getPostById($id);

        return response()->json($post);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PostUpdateRequest $request, string $id)
    {
        $post = $this->postService->updatePost($id, auth()->id(), $request);

        return response()->json([
            'message' => 'Post updated!',
            'post' => $post->load('user')
        ]);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $post = $this->postService->deletePost($id, auth()->id());
        return response()->json(['message' => 'Post deleted']);
    }
}
