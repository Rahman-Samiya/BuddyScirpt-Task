<?php

namespace App\Models\Like;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\User;

class Like extends Model
{
    use HasFactory;

    protected $casts = [];

    protected $fillable = [
        'user_id',
        'likeable_id',
        'likeable_type'
    ];

    // polymorphic relation
    public function likeable()
    {
        return $this->morphTo();
    }

    // user relation
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
