<?php

namespace App\Services;

use App\Models\Post\Post;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Storage;

class PostService
{
    public function showAllPosts($request, $perPage = 10)
    {
        $query = Post::select('id', 'user_id', 'content', 'image', 'visibility', 'created_at')
        ->when(!$request->user(), 
            fn($q) => $q->where('visibility', 'public'),
            fn($q) => $q->where(fn($sub) => 
                $sub->where('visibility', 'public')->orWhere('user_id', $request->user()->id)
            )
        );

        $data = $query
            ->with(['user' => function ($q) {
                $q->select('id','first_name', 'last_name');
            }])
            ->withCount(['likes', 'allComments as comments_count'])
            ->when($request->user(), fn($q) => $q->withExists([
                'likes as is_liked' => fn($sub) => $sub->where('user_id', $request->user()->id)
            ]))
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->paginate($perPage);
        return $data;
    }

    public function createPost($request)
    {
        $data = [
            'user_id' => $request->user()->id,
            'content' => $request->content,
            'visibility' => $request->visibility,
        ];

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('posts', 'public');
        }

        return Post::create($data);
    }

    public function getPostById($id)
    {
        $post = Post::query()
            ->with(['user' => function ($q) {
                $q->select('id', 'first_name', 'last_name');
            }, 'likes.user'])
            ->withCount(['likes', 'allComments as comments_count'])
            ->findOrFail($id);

        if ($post->visibility === 'private' && auth()->id() !== $post->user_id) {
            throw new AuthorizationException('Unauthorized');
        }

        return $post;
    }

    public function getPostsByUser($userId, $perPage = 10)
    {
        return Post::where('user_id', $userId)
            ->with(['user' => function ($q) {
                $q->select('id', 'first_name', 'last_name');
            }])
            ->withCount(['likes', 'allComments as comments_count'])
            ->withExists([
                'likes as is_liked' => fn($sub) => $sub->where('user_id', auth()->id())
            ])
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->paginate($perPage);
    }

    public function getSinglePostForUser($id, $userId)
    {
        return Post::where('user_id', $userId)->findOrFail($id);
    }

    public function updatePost($id, $userId, $request)
    {
        $post = $this->getSinglePostForUser($id, $userId);

        // Update content if provided
        if ($request->has('content')) {
            $post->content = $request->input('content');
        }

        // Update visibility if provided
        if ($request->has('visibility')) {
            $post->visibility = $request->input('visibility');
        }

        // Update image if uploaded
        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            $oldImage = $post->image;
            $post->image = $request->file('image')->store('posts', 'public');

            if ($oldImage) {
                Storage::disk('public')->delete($oldImage);
            }
        }

        $post->save();
        return $post;
    }
    public function deletePost($id, $userId)
    {
        $post = $this->getSinglePostForUser($id, $userId);

        if ($post->image) {
            Storage::disk('public')->delete($post->image);
        }

        $post->delete();
        return $post;
    }
}
