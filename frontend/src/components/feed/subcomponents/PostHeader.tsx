"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Swal from 'sweetalert2';
import type { Post } from "../../../services/postService";
import { postService } from "../../../services/postService";

interface PostHeaderProps {
  post: Post;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function PostHeader({ post, isOwner, onEdit, onDelete }: PostHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getAvatarInitial = (firstName: string) => {
    return firstName.charAt(0).toUpperCase();
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      setIsDeleting(true);
      try {
        await postService.deletePost(post.id);
        onDelete();
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Post deleted successfully!',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: 'swal2-toast'
          }
        });
      } catch (error: any) {
        console.error('Failed to delete post:', error);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: error.response?.data?.message || 'Failed to delete post',
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
          customClass: {
            popup: 'swal2-toast'
          }
        });
      } finally {
        setIsDeleting(false);
        setShowDropdown(false);
      }
    }
  };

  return (
    <div className="_feed_inner_timeline_post_top">
      <div className="_feed_inner_timeline_post_box">
        <div className="_feed_inner_timeline_post_box_image">
          <div
            className="_post_img"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#007bff',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            {post.user ? getAvatarInitial(post.user.first_name) : 'U'}
          </div>
        </div>
        <div className="_feed_inner_timeline_post_box_txt">
          <h4 className="_feed_inner_timeline_post_box_title">
            {post.user ? `${post.user.first_name} ${post.user.last_name}` : 'Unknown User'}
          </h4>
          <p className="_feed_inner_timeline_post_box_para">
            <span suppressHydrationWarning>{getTimeAgo(post.created_at)}</span> .
            <Link href="/profile">{post.visibility === 'public' ? 'Public' : 'Private'}</Link>
          </p>
        </div>
      </div>
      {isOwner && (
        <div
          className="_feed_inner_timeline_post_box_dropdown"
          style={{ position: "relative" }}
          ref={dropdownRef}
        >
          <button
            type="button"
            className="_feed_timeline_post_dropdown_link"
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(prev => !prev);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
              <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
              <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
              <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
            </svg>
          </button>

          {showDropdown && (
            <div
              className="_feed_timeline_dropdown"
              style={{
                position: "absolute",
                top: "110%",
                right: 0,
                zIndex: 9999,
                background: "#fff",
                borderRadius: "6px",
                border: "1px solid #ddd",
                boxShadow: "0 4px 10px rgba(0,0,0,0.14)",
                minWidth: "180px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <ul className="_feed_timeline_dropdown_item">
                <li><button className="_feed_timeline_dropdown_link" onClick={onEdit}>Edit Post</button></li>
                <li>
                  <button
                    className="_feed_timeline_dropdown_link"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete Post"}
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
