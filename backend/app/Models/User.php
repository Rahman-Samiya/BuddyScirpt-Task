<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Comment\Comment;
use App\Models\Like\Like;
use App\Models\Post\Post;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Helper: check if user liked something
    public function hasLiked($likeable)
    {
        return $this->likes()->where('likeable_id', $likeable->id)
                           ->where('likeable_type', get_class($likeable))
                           ->exists();
    }

    // A user has many posts
    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    // A user has many comments
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    // A user has many likes (polymorphic)
    public function likes()
    {
        return $this->hasMany(Like::class);
    }
}
