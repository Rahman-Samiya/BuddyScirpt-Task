<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Like\LikeResource;
use App\Models\Post\Post;
use App\Models\Comment\Comment;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    public function getLikes($type, $id)
    {
        $model = $type === 'post' ? Post::class : Comment::class;
        $likeable = $model::findOrFail($id);

        $likes = $likeable->likes()->with('user:id,first_name,last_name')->get();

        return response()->json([
            'count' => $likes->count(),
            'likes' => LikeResource::collection($likes)
        ]);
    }

    public function toggle(Request $request, $type, $id)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $model = $type === 'post' ? Post::class : Comment::class;
        $likeable = $model::findOrFail($id);

        // Check if user already liked this
        $like = $likeable->likes()
            ->where('user_id', $user->id)
            ->first();

        if ($like) {
            // Unlike
            $like->delete();
        } else {
            // Like
            $likeable->likes()->create([
                'user_id' => $user->id
            ]);
        }

        $likes = $likeable->likes()->with('user:id,first_name,last_name')->get();

        return response()->json([
            'liked' => $likeable->likes()->where('user_id', $user->id)->exists(),
            'count' => $likes->count(),
            'likes' => LikeResource::collection($likes)
        ]);
    }

}
