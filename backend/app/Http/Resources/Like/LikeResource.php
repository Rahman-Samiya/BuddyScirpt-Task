<?php

namespace App\Http\Resources\Like;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LikeResource extends JsonResource
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
            'user' => $this->whenLoaded('user', function () {
                return [
                    'first_name' => $this->user->first_name,
                    'last_name' => $this->user->last_name,
                ];
            }),
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
