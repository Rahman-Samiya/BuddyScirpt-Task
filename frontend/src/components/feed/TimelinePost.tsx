"use client";

import type { Post } from "../../services/postService";
import { PostHeader } from "./subcomponents/PostHeader";
import { PostContent } from "./subcomponents/PostContent";
import { PostStats } from "./subcomponents/PostStats";
import { PostActions } from "./subcomponents/PostActions";
import { PostComments } from "./subcomponents/PostComments";
import { showEditPostModal } from "./subcomponents/EditPostModal";
import { useState } from "react";

interface TimelinePostProps {
  post: Post;
  onPostUpdate?: (updatedPost: Post) => void;
  onPostDelete?: (postId: number) => void;
}

export default function TimelinePost({ post, onPostUpdate, onPostDelete }: TimelinePostProps) {
  const isOwner = post.is_owner;
  const [isCommentsVisible, setCommentsVisible] = useState(false);

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
      <PostActions post={post} onPostUpdate={onPostUpdate} setCommentsVisible={setCommentsVisible} />

      {/* Post Comments */}
      { isCommentsVisible && (
        <PostComments postId={post.id} />
      ) }
    </div>
  );
}
