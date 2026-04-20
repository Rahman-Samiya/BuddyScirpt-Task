<?php

namespace App\Http\Resources\Comment;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
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
            'is_liked' => (bool) ($this->is_liked ?? false),
            'parent_id' => $this->parent_id,
            'content' => $this->content,
            'likes_count' => $this->likes_count ?? $this->whenCounted('likes'),
            'user' => $this->whenLoaded('user', function () {
                return [
                    'first_name' => $this->user->first_name,
                    'last_name' => $this->user->last_name,
                ];
            }),
            'replies' => CommentResource::collection($this->whenLoaded('replies')),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
