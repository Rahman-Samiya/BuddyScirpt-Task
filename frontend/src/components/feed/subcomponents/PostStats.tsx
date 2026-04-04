"use client";

import { useState, useEffect } from "react";
import { likeService } from "../../../services/likeService";

interface LikeUser {
  id: number;
  first_name: string;
  last_name: string;
}

interface PostStatsProps {
  post: any;
  commentCount?: number;
  onCommentClick?: () => void;
  postId?: number;
}

export function PostStats({ post, commentCount: initialCommentCount = 0, onCommentClick, postId }: PostStatsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [likeUsers, setLikeUsers] = useState<LikeUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(initialCommentCount);

  // Get first character of user's first name for avatar
  const getAvatarChar = (firstName: string): string => {
    return firstName?.charAt(0).toUpperCase() || '?';
  };

  // Get avatar background color based on user id
  const getAvatarColor = (userId: number): string => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    return colors[userId % colors.length];
  };

  const openModal = async () => {
    if (modalOpen) return; // Already open, don't fetch again
    
    try {
      setLoading(true);
      const res = await likeService.getLikes("post", post.id);
      setLikeUsers(res.users || res || []);
      setModalOpen(true);
    } catch (error) {
      console.error("Error loading like users", error);
      setLikeUsers([]);
      setModalOpen(true); // Open modal anyway to show empty state
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  // Update likeUsers when post changes
  useEffect(() => {
    if (post.likes && Array.isArray(post.likes)) {
      // Handle both data structures
      const users = post.likes.map((l: any) => l.user || l);
      setLikeUsers(users);
    } else {
      setLikeUsers([]);
    }
  }, [post.likes, post.id]);

  // Listen for comment count updates
  useEffect(() => {
    const handleCommentCountUpdate = (event: CustomEvent) => {
      const { postId: eventPostId, count } = event.detail;
      if (eventPostId === postId || eventPostId === post.id) {
        setCommentCount(count);
      }
    };

    window.addEventListener('commentCountUpdate', handleCommentCountUpdate as EventListener);

    return () => {
      window.removeEventListener('commentCountUpdate', handleCommentCountUpdate as EventListener);
    };
  }, [postId, post.id]);

  return (
    <>
      {/* --- MAIN LIKE/COMMENT/SHARE --- */}
      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">

        {/* LIKE LIST CLICKABLE - Shows avatars and like count */}
        <div
          className="_feed_inner_timeline_total_reacts_image"
          onClick={openModal}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
        >
          {/* Display first few like user avatars */}
          <div style={{ display: "flex", marginRight: "8px" }}>
            {likeUsers.length > 0 ? (
              likeUsers.slice(0, 5).map((user, idx) => (
                <div
                  key={user.id}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: getAvatarColor(user.id),
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "12px",
                    border: "2px solid #fff",
                    marginLeft: idx > 0 ? "-10px" : "0",
                    zIndex: likeUsers.length - idx,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}
                  title={`${user.first_name} ${user.last_name}`}
                >
                  {getAvatarChar(user.first_name)}
                </div>
              ))
            ) : ''}
          </div>

          {/* Like count */}
          <p className="_feed_inner_timeline_total_reacts_para" style={{ marginLeft: likeUsers.length > 0 ? "12px" : "0" }}>
            {post.likes_count || 0}
          </p>
        </div>

        {/* COMMENT & SHARE */}
        <div className="_feed_inner_timeline_total_reacts_txt">
          <p className="_feed_inner_timeline_total_reacts_para1">
            <button
              onClick={() => {
                onCommentClick?.();
                // Dispatch custom event for PostComments to listen
                window.dispatchEvent(new CustomEvent('focusCommentInput'));
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                textDecoration: 'none',
                fontSize: 'inherit',
                padding: 0
              }}
            >
              <span>{commentCount}</span> Comment{commentCount !== 1 ? 's' : ''}
            </button>
          </p>
          <p className="_feed_inner_timeline_total_reacts_para2">
            <span>0</span> Share
          </p>
        </div>
      </div>

      {/* --- LIKE USERS MODAL --- */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              width: "400px",
              maxHeight: "500px",
              background: "#fff",
              borderRadius: "12px",
              padding: "20px",
              overflowY: "auto",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
                People who reacted
              </h3>
              <button
                onClick={closeModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666"
                }}
              >
                ×
              </button>
            </div>

            {loading ? (
              <p style={{ textAlign: "center", color: "#666", padding: "20px 0" }}>Loading...</p>
            ) : likeUsers.length === 0 ? (
              <p style={{ textAlign: "center", color: "#999", padding: "20px 0" }}>No reactions yet</p>
            ) : (
              <div>
                {likeUsers.map((user) => (
                  <div
                    key={user.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "12px 0",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: getAvatarColor(user.id),
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "14px",
                        marginRight: "12px",
                        flexShrink: 0
                      }}
                    >
                      {getAvatarChar(user.first_name)}
                    </div>

                    {/* User info */}
                    <div>
                      <p style={{ margin: 0, fontSize: "14px", fontWeight: "500", color: "#333" }}>
                        {user.first_name} {user.last_name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Close button */}
            {!loading && likeUsers.length > 0 && (
              <button
                style={{
                  marginTop: "15px",
                  width: "100%",
                  padding: "10px",
                  background: "#1877f2",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "14px"
                }}
                onClick={closeModal}
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
