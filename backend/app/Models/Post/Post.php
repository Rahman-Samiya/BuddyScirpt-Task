<?php

namespace App\Models\Post;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Comment\Comment;
use App\Models\Like\Like;
use App\Models\User;

class Post extends Model
{
    use HasFactory, SoftDeletes;

    protected $casts = [];

    protected $fillable = [
        'user_id',
        'content',
        'image',
        'visibility'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Post has many comments
    public function comments()
    {
        return $this->hasMany(Comment::class)->whereNull('parent_id'); // only top-level
    }

    // All comments including replies (recursive)
    public function allComments()
    {
        return $this->hasMany(Comment::class);
    }

    // Post can be liked (polymorphic)
    public function likes()
    {
        return $this->morphMany(Like::class, 'likeable');
    }

    // Only Public Posts
    public function scopePublic($query)
    {
        return $query->where('visibility', 'public');
    }

    // Only posts of specific user
    public function scopeOwnedBy($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    // Logged-in user will see all public + own private
    public function scopeVisibleTo($query, $user)
    {
        if (!$user) {
            return $query->public();
        }

        return $query->where(function ($q) use ($user) {
            $q->public()
              ->orWhere('user_id', $user->id);
        });
    }

    // Common eager-load setup
    public function scopeWithPostRelations($query)
    {
        return $query
            ->with(['user', 'likes.user'])
            ->withCount('likes');
    }
}
