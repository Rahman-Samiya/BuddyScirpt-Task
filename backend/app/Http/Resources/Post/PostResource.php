<?php

namespace App\Http\Resources\Post;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'is_owner' => $request->user()?->id === $this->user_id,
            'is_liked' => $request->user()
                ? (bool) ($this->is_liked ?? $this->likes()->where('user_id', $request->user()->id)->exists())
                : false,
            'user' => [
                'first_name' => $this->user->first_name,
                'last_name' => $this->user->last_name,
            ],
            'content' => $this->content,
            'image' => $this->image ? asset('storage/' . $this->image) : null,
            'visibility' => $this->visibility,
            'likes_count' => $this->likes_count,
            'comments_count' => $this->comments_count,
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
