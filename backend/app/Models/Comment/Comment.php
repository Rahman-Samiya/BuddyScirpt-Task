<?php

namespace App\Models\Comment;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Like\Like;
use App\Models\Post\Post;
use App\Models\User;

class Comment extends Model
{
    use HasFactory, SoftDeletes;

    protected $casts = [];

    protected $fillable = [
        'post_id',
        'user_id',
        'parent_id',
        'content'
    ];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * A comment belongs to a user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Parent Comment (if this is a reply)
     */
    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /**
     * Replies under this comment
     */
    public function replies()
    {
        return $this->hasMany(self::class, 'parent_id')
            ->with([
                'replies',      // recursive infinite depth
                'user:id,first_name,last_name',
            ])
            ->withCount('likes');
    }

    // Comment can be liked
    public function likes()
    {
        return $this->morphMany(Like::class, 'likeable');
    }
}
