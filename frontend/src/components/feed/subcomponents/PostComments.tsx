"use client";

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import commentService, { type Comment } from '../../../services/commentService';
import { CommentItem } from './CommentItem';

interface PostCommentsProps {
  postId: number;
  onCommentCountChange?: (count: number) => void;
}

export interface PostCommentsRef {
  focusCommentInput: () => void;
}

export const PostComments = forwardRef<PostCommentsRef, PostCommentsProps>(({ postId, onCommentCountChange }, ref) => {
  const { user } = useAuth();
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: number; author: string; content: string } | null>(null);
  const [showAllComments, setShowAllComments] = useState(false);

  const commentsCache = useRef<{ [key: number]: Comment[] }>({});
  
  useImperativeHandle(ref, () => ({
    focusCommentInput: () => {
      commentInputRef.current?.focus();
    }
  }));

  // Fetch comments on mount
  useEffect(() => {
    fetchComments();
  }, [postId]);

  // Listen for focus event from PostStats
  useEffect(() => {
    const handleFocusEvent = (event: CustomEvent) => {
      const { postId: eventPostId } = event.detail;
      if (eventPostId === postId) {
        commentInputRef.current?.focus();
      }
    };

    window.addEventListener('focusCommentInput', handleFocusEvent as EventListener);

    return () => {
      window.removeEventListener('focusCommentInput', handleFocusEvent as EventListener);
    };
  }, [postId]);

  // Update comment count when comments change
  useEffect(() => {
    const totalComments = getTotalCommentCount(comments);
    onCommentCountChange?.(totalComments);
    // Dispatch custom event for PostStats to listen
    window.dispatchEvent(new CustomEvent('commentCountUpdate', { detail: { postId, count: totalComments } }));
  }, [comments, onCommentCountChange, postId]);

  const getTotalCommentCount = (comments: Comment[]): number => {
    let count = comments.length;
    for (const comment of comments) {
      if (comment.replies) {
        count += getTotalCommentCount(comment.replies);
      }
    }
    return count;
  };

  const fetchComments = async () => {
    if (commentsCache.current[postId]) {
      setComments(commentsCache.current[postId]);
      return;
    }
    
    setLoading(true);
    try {
      const res = await commentService.getCommentsByPost(postId);
      const data = res.comments || [];
      commentsCache.current[postId] = data;   // ✅ cache
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
    setLoading(false);
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !user || loading) return;

    const newContent = commentContent;
    const parentId = replyingTo?.id || null;

    setCommentContent('');
    setReplyingTo(null);
    setLoading(true);

    try {
      const res = await commentService.createComment(postId, newContent, parentId);

      if (parentId) {
        // Add reply under the parent comment (recursively)
        setComments((prev) => addReplyToTree(prev, parentId, res.comment));
      } else {
        // Add as top-level comment
        setComments((prev) => [res.comment, ...prev]);
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      setCommentContent(newContent);
      setReplyingTo(replyingTo);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentUpdate = (updatedComment: Comment) => {
    setComments((prev) =>
      prev.map((c) => (c.id === updatedComment.id ? updatedComment : c))
    );
  };

  const handleCommentDelete = (deletedComment: Comment) => {
    setComments((prev) => removeCommentFromTree(prev, deletedComment.id));
  };

  const addReplyToTree = (comments: Comment[], parentId: number, newReply: Comment): Comment[] => {
    return comments.map((c) => {
      if (c.id === parentId) {
        // Found the parent, add the reply
        return {
          ...c,
          replies: [...(c.replies || []), newReply]
        };
      } else if (c.replies) {
        // Recursively search in replies
        return {
          ...c,
          replies: addReplyToTree(c.replies, parentId, newReply)
        };
      }
      return c;
    });
  };

  const removeCommentFromTree = (comments: Comment[], commentId: number): Comment[] => {
    return comments
      .filter((c) => c.id !== commentId) // Remove if it's a top-level comment
      .map((c) => ({
        ...c,
        replies: c.replies ? removeCommentFromTree(c.replies, commentId) : []
      })); // Recursively remove from replies
  };

  const handleReplyClick = (parentId: number, author: string, content: string) => {
    setReplyingTo({ id: parentId, author, content });
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 0);
  };

  const displayedComments = showAllComments ? comments : comments.slice(0, 3);
  const hiddenCommentCount = Math.max(0, comments.length - 3);

  return (
    <div className="_feed_inner_timeline_cooment_area">
      {/* Comment Input Box */}
      <div className="_feed_inner_comment_box">
        <form className="_feed_inner_comment_box_form" onSubmit={handleCreateComment}>
          <div className="_feed_inner_comment_box_content">
            <div className="_feed_inner_comment_box_content_image">
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#4ECDC4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                {user?.first_name?.charAt(0).toUpperCase() || '?'}
              </div>
            </div>
            <div className="_feed_inner_comment_box_content_txt">
              {replyingTo && (
                <div style={{
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  marginBottom: '8px',
                  position: 'relative'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      color: '#6c757d',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                        <path d="M21 3v5h-5"/>
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                        <path d="M8 16H3v5"/>
                      </svg>
                      Replying to <strong style={{ color: '#495057' }}>{replyingTo.author}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setReplyingTo(null)}
                      style={{
                        border: 'none',
                        background: 'none',
                        color: '#dc3545',
                        cursor: 'pointer',
                        fontSize: '12px',
                        textDecoration: 'underline',
                        padding: '2px 4px',
                        borderRadius: '4px'
                      }}
                      onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f5c6cb'}
                      onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
                    >
                      ✕ Cancel
                    </button>
                  </div>
                  <blockquote style={{
                    fontSize: '14px',
                    color: '#495057',
                    margin: '0',
                    paddingLeft: '12px',
                    borderLeft: '3px solid #dee2e6',
                    fontStyle: 'italic'
                  }}>
                    {replyingTo.content}
                  </blockquote>
                </div>
              )}
              <textarea
                ref={commentInputRef}
                className="form-control _comment_textarea"
                placeholder={replyingTo ? `Reply to ${replyingTo.author}...` : 'Write a comment...'}
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
              />
            </div>
          </div>

          {/* Send Icon Button */}
          <div className="_feed_inner_comment_box_icon">
            <button
              className="_feed_inner_comment_box_icon_btn"
              type="submit"
              disabled={!commentContent.trim() || loading}
              title="Send comment"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="_timline_comment_main">
        {hiddenCommentCount > 0 && !showAllComments && (
          <div className="_previous_comment">
            <button
              type="button"
              className="_previous_comment_txt"
              onClick={() => setShowAllComments(true)}
            >
              View {hiddenCommentCount} previous {hiddenCommentCount === 1 ? 'comment' : 'comments'}
            </button>
          </div>
        )}

        {loading && comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            No comments yet. Be the first to comment!
          </div>
        ) : (
          displayedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onCommentUpdate={handleCommentUpdate}
              onCommentDelete={handleCommentDelete}
              onReplyClick={handleReplyClick}
            />
          ))
        )}
      </div>
    </div>
  );
});
