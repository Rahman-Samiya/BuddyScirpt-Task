"use client";

import { useAuth } from "../../contexts/AuthContext";
import type { Post } from "../../services/postService";
import { PostHeader } from "./subcomponents/PostHeader";
import { PostContent } from "./subcomponents/PostContent";
import { PostStats } from "./subcomponents/PostStats";
import { PostActions } from "./subcomponents/PostActions";
import { PostComments } from "./subcomponents/PostComments";
import { showEditPostModal } from "./subcomponents/EditPostModal";

interface TimelinePostProps {
  post: Post;
  onPostUpdate?: (updatedPost: Post) => void;
  onPostDelete?: (postId: number) => void;
}

export default function TimelinePost({ post, onPostUpdate, onPostDelete }: TimelinePostProps) {
  const { user } = useAuth();

  const isOwner = user?.id === post.user_id;

  const handleEdit = async () => {
    await showEditPostModal({
      post,
      onPostUpdate: (updatedPost) => {
        onPostUpdate?.(updatedPost);
      }
    });
  };

  const handleDelete = () => {
    onPostDelete?.(post.id);
  };

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        {/* Post Header */}
        <PostHeader
          post={post}
          isOwner={isOwner}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Post Content */}
        <PostContent post={post} />
      </div>

      {/* Post Stats */}
      <PostStats post={post} />

      {/* Post Actions */}
      <PostActions post={post} onPostUpdate={onPostUpdate} />

      {/* Post Comments */}
      <PostComments postId={post.id} />
    </div>
  );
}
