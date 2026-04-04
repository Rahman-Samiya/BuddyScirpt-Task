"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import commentService, { type Comment, type CommentUser } from '../../../services/commentService';
import Swal from 'sweetalert2';

interface CommentItemProps {
  comment: Comment;
  postId: number;
  onCommentUpdate?: (updatedComment: Comment) => void;
  onCommentDelete?: (comment: Comment) => void;
  onReplyClick?: (parentId: number, parentAuthor: string, content: string) => void;
}

export function CommentItem({
  comment,
  postId,
  onCommentUpdate,
  onCommentDelete,
  onReplyClick,
}: CommentItemProps) {
  const { user } = useAuth();

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeUsers, setLikeUsers] = useState<CommentUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showLikeModal, setShowLikeModal] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  // Initialize likes
  useEffect(() => {
    setLikesCount(comment.likes_count || comment.likes?.length || 0);

    if (comment.likes && Array.isArray(comment.likes)) {
      const users = comment.likes.map((l) => l.user || l);
      setLikeUsers(users);
      const userLiked = comment.likes.some((l) => (l.user_id || l.id) === user?.id);
      setLiked(userLiked);
    } else {
      setLiked(false);
      setLikeUsers([]);
    }
  }, [comment.id, comment.likes, comment.likes_count, user?.id]);

  // Avatar utilities
  const getAvatarChar = (firstName: string) => firstName?.charAt(0).toUpperCase() || '?';

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
  const getAvatarColor = (userId: number) => colors[userId % colors.length];

  const handleLike = async () => {
    if (!user || loading) return;

    const optimisticLiked = !liked;
    setLiked(optimisticLiked);
    setLikesCount((prev) => (optimisticLiked ? prev + 1 : prev - 1));

    setLoading(true);

    try {
      const res = await commentService.toggleCommentLike(comment.id);

      setLiked(res.liked);
      setLikesCount(res.count);
      setLikeUsers(res.users || []);

      onCommentUpdate?.({
        ...comment,
        likes_count: res.count,
        likes: res.users?.map((u: any) => ({
          id: u.id,
          user_id: u.id,
          comment_id: comment.id,
          created_at: new Date().toISOString(),
          user: u,
        })) || [],
      });
    } catch (error) {
      console.error('Like error:', error);
      setLiked(!optimisticLiked);
      setLikesCount((prev) => (optimisticLiked ? prev - 1 : prev + 1));
    }

    setLoading(false);
  };

  const handleEdit = async () => {
    if (!editContent.trim() || loading) return;

    setLoading(true);

    try {
      const res = await commentService.updateComment(comment.id, editContent);
      onCommentUpdate?.(res.comment);
      setIsEditing(false);
    } catch (error) {
      console.error('Edit error:', error);
      setEditContent(comment.content);
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    if (loading) return;

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    setLoading(true);

    try {
      await commentService.deleteComment(comment.id);
      onCommentDelete?.(comment);
    } catch (error) {
      console.error('Delete error:', error);
    }

    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  };

  const isCommentAuthor = user?.id === comment.user_id;

  return (
    <div className="_comment_main">
      <div className="_comment_image">
        <Link href={`/profile/${comment.user_id}`} className="_comment_image_link">
          <div
            className="_avatar_circle"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: getAvatarColor(comment.user_id),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            {getAvatarChar(comment.user.first_name)}
          </div>
        </Link>
      </div>

      <div className="_comment_area">
        <div className="_comment_details">
          <div className="_comment_details_top">
            <div className="_comment_name">
              <Link href={`/profile/${comment.user_id}`}>
                <h4 className="_comment_name_title">
                  {comment.user.first_name} {comment.user.last_name}
                </h4>
              </Link>
            </div>
          </div>

          <div className="_comment_status">
            {isEditing ? (
              <div style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                padding: '12px',
                marginTop: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: '#495057',
                  fontWeight: 500
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit Comment
                </div>
                <textarea
                  className="form-control"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  style={{
                    minHeight: '80px',
                    border: '1px solid #ced4da',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    resize: 'vertical'
                  }}
                  placeholder="Edit your comment..."
                />
                <div style={{
                  marginTop: '12px',
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                    disabled={loading}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #6c757d',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      color: '#6c757d',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#f8f9fa';
                    }}
                    onMouseOut={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = 'white';
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    Cancel
                  </button>
                  <button
                    onClick={handleEdit}
                    disabled={loading || !editContent.trim()}
                    style={{
                      padding: '6px 12px',
                      border: 'none',
                      borderRadius: '6px',
                      backgroundColor: editContent.trim() ? '#007bff' : '#6c757d',
                      color: 'white',
                      cursor: editContent.trim() ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      if (editContent.trim()) {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#0056b3';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (editContent.trim()) {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#007bff';
                      }
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="_comment_status_text">
                <span>{comment.content}</span>
              </p>
            )}
          </div>

          <div className="_total_reactions">
            <div className="_total_react">
              {likesCount > 0 && (
                <button
                  onClick={() => setShowLikeModal(true)}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: '#666',
                    fontSize: '12px',
                    padding: 0,
                  }}
                >
                  <span className="_reaction_like">👍</span>
                </button>
              )}
            </div>
            {likesCount > 0 && <span className="_total">{likesCount}</span>}
          </div>

          <div className="_comment_reply">
            <div className="_comment_reply_num">
              <ul className="_comment_reply_list">
                <li>
                  <button
                    onClick={handleLike}
                    disabled={loading}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: liked ? '#0066cc' : '#666',
                      cursor: 'pointer',
                      fontWeight: liked ? 'bold' : 'normal',
                    }}
                  >
                    <span>{liked ? 'Unlike' : 'Like'}</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      onReplyClick?.(comment.id, `${comment.user.first_name} ${comment.user.last_name}`, comment.content)
                    }
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#666',
                      cursor: 'pointer',
                    }}
                  >
                    <span>Reply</span>
                  </button>
                </li>
                {isCommentAuthor && (
                  <>
                    <li>
                      <button
                        onClick={() => setIsEditing(true)}
                        disabled={loading}
                        style={{
                          border: 'none',
                          background: 'none',
                          color: '#666',
                          cursor: 'pointer',
                        }}
                      >
                        <span>Edit</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={handleDelete}
                        disabled={loading}
                        style={{
                          border: 'none',
                          background: 'none',
                          color: '#dc3545',
                          cursor: 'pointer',
                        }}
                      >
                        <span>Delete</span>
                      </button>
                    </li>
                  </>
                )}
                <li>
                  <span className="_time_link" suppressHydrationWarning>
                    {formatDate(comment.created_at)}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div style={{ marginLeft: '32px', marginTop: '12px' }}>
            {showReplies ? (
              comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  onCommentUpdate={onCommentUpdate}
                  onCommentDelete={onCommentDelete}
                  onReplyClick={onReplyClick}
                />
              ))
            ) : (
              <button
                onClick={() => setShowReplies(true)}
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#0066cc',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                View {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Like Modal */}
      {showLikeModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowLikeModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              maxWidth: '400px',
              maxHeight: '80vh',
              overflowY: 'auto',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h5 style={{ marginBottom: '16px' }}>People who liked this</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {likeUsers.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                  onClick={() => setShowLikeModal(false)}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: getAvatarColor(user.id),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      flexShrink: 0,
                    }}
                  >
                    {getAvatarChar(user.first_name)}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 500 }}>
                      {user.first_name} {user.last_name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <button
              onClick={() => setShowLikeModal(false)}
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: '#f5f5f5',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
