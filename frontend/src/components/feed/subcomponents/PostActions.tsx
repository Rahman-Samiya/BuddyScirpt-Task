"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { likeService } from '../../../services/likeService';
import type { Post } from '../../../services/postService';

interface PostActionsProps {
  post: Post;
  onPostUpdate?: (updatedPost: Post) => void;
  onCommentClick?: () => void;
  setCommentsVisible: (visible: boolean) => void;
}

export function PostActions({ post, onPostUpdate, onCommentClick, setCommentsVisible }: PostActionsProps) {
  const { user } = useAuth();

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLikesCount(post.likes_count || 0);
    setLiked(post.is_liked ?? false);
  }, [post.id, post.is_liked, post.likes_count]);

  const handleLike = async () => {
    if (!user || loading) return;

    // --- OPTIMISTIC UI UPDATE ---
    const optimisticLiked = !liked;
    setLiked(optimisticLiked);
    setLikesCount((prev) => (optimisticLiked ? prev + 1 : prev - 1));

    setLoading(true);

    try {
      const res = await likeService.toggleLike('post', post.id);
      
      // update states with backend true values
      setLiked(res.liked);
      setLikesCount(res.count);

      // Update parent post list
      onPostUpdate?.({
        ...post,
        likes_count: res.count,
        is_liked: res.liked,
        likes: res.likes || [],
      });

    } catch (error) {
      console.error('Like error:', error);

      // revert optimistic UI if failed
      setLiked(!optimisticLiked);
      setLikesCount((prev) => (optimisticLiked ? prev - 1 : prev + 1));
    }

    setLoading(false);
  };

  const handleCommentClick = () => {
    onCommentClick?.();
    // Dispatch custom event for PostComments to listen, with post ID
    window.dispatchEvent(new CustomEvent('focusCommentInput', { detail: { postId: post.id } }));
    setCommentsVisible(true);
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/feed/${post.id}`;
    const shareData = {
      title: `Check out this post by ${post.user?.first_name} ${post.user?.last_name}`,
      text: post.content ? post.content.substring(0, 100) + '...' : 'Check out this interesting post!',
      url: postUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Fallback to clipboard
        copyToClipboard(postUrl);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      copyToClipboard(postUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Post link copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Post link copied to clipboard!');
    });
  };

  return (
    <div className="_feed_inner_timeline_reaction">
      <button
        className={`_feed_inner_timeline_reaction_emoji _feed_reaction ${
          liked ? '_feed_reaction_active' : ''
        }`}
        onClick={handleLike}
        disabled={loading}
      >
        <span className="_feed_inner_timeline_reaction_link">
          <span>{liked ? 'Unlike' : 'Like'}</span>
          {likesCount > 0 && <span> ({likesCount})</span>}
        </span>
      </button>

      <button
        className="_feed_inner_timeline_reaction_comment _feed_reaction"
        onClick={handleCommentClick}
      >
        <span className="_feed_inner_timeline_reaction_link"><span>Comment</span></span>
      </button>

      <button
        className="_feed_inner_timeline_reaction_share _feed_reaction"
        onClick={handleShare}
      >
        <span className="_feed_inner_timeline_reaction_link"><span>Share</span></span>
      </button>
    </div>
  );
}
