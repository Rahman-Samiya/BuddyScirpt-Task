<?php

namespace App\Services;

use App\Models\Comment\Comment;
use App\Models\Post\Post;

class CommentService
{
    /**
     * Get all comments for a post
     */
    public function getCommentsByPost($postId)
    {
        $post = Post::findOrFail($postId);

        $userId = auth()->id();

        $comments = $post->comments()
            ->whereNull('parent_id')
            ->with([
                'replies' => function ($q) use ($userId) {
                    $q->with('user:id,first_name,last_name')
                      ->withCount('likes')
                      ->when($userId, fn($r) => $r->withExists([
                          'likes as is_liked' => fn($sub) => $sub->where('user_id', $userId)
                      ]));
                },
                'user:id,first_name,last_name',
            ])
            ->withCount('likes')
            ->when($userId, fn($q) => $q->withExists([
                'likes as is_liked' => fn($sub) => $sub->where('user_id', $userId)
            ]))
            ->orderBy('created_at', 'desc')
            ->get();

        return [
            'post_id' => $post->id,
            'comments' => $comments
        ];
    }


    /**
     * Create a new comment
     */
    public function createComment($postId, $userId, $content, $parentId = null)
    {
        $post = Post::findOrFail($postId);

        $comment = $post->allComments()->create([
            'user_id' => $userId,
            'content' => $content,
            'parent_id' => $parentId,
        ]);

        $comment = $comment
            ->load(['user:id,first_name,last_name', 'replies'])
            ->loadCount('likes');

        return $comment;
    }

    /**
     * Update a comment
     */
    public function updateComment(Comment $comment, $content)
    {
        $comment->content = $content;
        $comment->save();

        $comment = $comment
            ->load(['user:id,first_name,last_name', 'replies'])
            ->loadCount('likes');

        return $comment;
    }

    /**
     * Delete a comment and handle based on whether it's root or reply
     */
    public function deleteComment(Comment $comment)
    {
        if ($comment->parent_id === null) {
            // It's a root comment, delete the entire thread
            $this->deleteCommentAndReplies($comment);
        } else {
            // It's a reply, only delete this comment and its replies
            $this->deleteCommentAndReplies($comment);
        }
    }


    /**
     * Recursively delete a comment and all its replies
     */
    private function deleteCommentAndReplies(Comment $comment)
    {
        // Get all direct replies
        $replies = $comment->replies;

        // Recursively delete each reply and its sub-replies
        foreach ($replies as $reply) {
            $this->deleteCommentAndReplies($reply);
        }

        // Delete all likes associated with this comment
        $comment->likes()->delete();

        // Delete the comment itself
        $comment->delete();
    }
}
