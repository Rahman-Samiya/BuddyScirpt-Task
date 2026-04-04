<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CommentService;
use App\Models\Comment\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CommentController extends Controller
{

    protected $commentsService;

    public function __construct(CommentService $commentService)
    {
        $this->commentsService = $commentService;
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, $postId)
    {
        try {
            $commentsPayload = $this->commentsService->getCommentsByPost($postId);
            return response()->json($commentsPayload);
        } catch (\Exception $e) {
            Log::error('Error fetching comments: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch comments'], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, $postId)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:comments,id'
        ]);

        try {
            $comment = $this->commentsService->createComment(
                $postId,
                $request->user()->id,
                $request->content,
                $request->parent_id
            );

            return response()->json([
                'message' => 'Comment added',
                'comment' => $comment
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating comment: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create comment'], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Comment $comment)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        // Check if authenticated user owns this comment
        if ($request->user()->id !== $comment->user_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        try {
            $updatedComment = $this->commentsService->updateComment($comment, $request->content);

            return response()->json([
                'message' => 'Comment updated successfully',
                'comment' => $updatedComment
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating comment: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update comment'], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Comment $comment)
    {
        // Check if authenticated user owns this comment
        if ($request->user()->id !== $comment->user_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        try {
            $this->commentsService->deleteComment($comment);
            return response()->json(['message' => 'Comment thread deleted']);
        } catch (\Exception $e) {
            Log::error('Error deleting comment: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete comment'], 500);
        }
    }
}
 
