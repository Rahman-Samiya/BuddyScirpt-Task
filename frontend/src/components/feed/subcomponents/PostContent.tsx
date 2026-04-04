"use client";

import type { Post } from "../../../services/postService";

interface PostContentProps {
  post: Post;
}

export function PostContent({ post }: PostContentProps) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const storageBase = apiBase.replace(/\/api\/?$/, "");

  return (
    <>
      <h4 className="_feed_inner_timeline_post_title">{post.content}</h4>
      {post.image && (
        <div className="_feed_inner_timeline_image">
          <img
            src={post.image.startsWith('http') ? post.image : `${storageBase}/storage/${post.image}`}
            alt="Post"
            className="_time_img"
            onError={(e) => {
              console.error('Image failed to load:', post.image);
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
    </>
  );
}
