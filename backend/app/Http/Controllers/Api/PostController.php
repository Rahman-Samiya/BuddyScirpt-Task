<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Post\PostCreateRequest;
use App\Http\Requests\Post\PostUpdateRequest;
use App\Http\Resources\Post\PostResource;
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
        return PostResource::collection($posts);
    }

    /**
     * Get the authenticated user's own posts (uses token — no user ID in URL)
     */
    public function getMyPosts(Request $request)
    {
        $perPage = $request->query('per_page', 10);
        $posts = $this->postService->getPostsByUser(auth()->id(), $perPage);

        return PostResource::collection($posts);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PostCreateRequest $request)
    {
        $post = $this->postService->createPost($request);

        return response()->json([
            'message' => 'Post created!',
            'post' => new PostResource(
                $post->loadCount(['likes', 'allComments as comments_count'])->load('user')
            )
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $post = $this->postService->getPostById($id);

        return new PostResource($post);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PostUpdateRequest $request, string $id)
    {
        $post = $this->postService->updatePost($id, auth()->id(), $request);

        return response()->json([
            'message' => 'Post updated!',
            'post' => new PostResource(
                $post->loadCount(['likes', 'allComments as comments_count'])->load('user')
            )
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
