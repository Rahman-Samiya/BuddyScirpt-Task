"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  FeedHeader,
  MobileMenu,
  MobileBottomNav,
  LeftSidebar,
  TimelinePost,
  RightSidebar
} from '../components/feed';
import { postService } from '../services/postService';
import type { Post } from '../services/postService';
import { useAuth } from '../contexts/AuthContext';

export default function MyProfile() {
  const [darkMode, setDarkMode] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  console.log(user)
  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Fetch current user's posts with pagination
  const fetchUserPosts = useCallback(
    async (append: boolean = false) => {
      if (!user || loading || !hasMore) return;

      setLoading(true);
      try {
        const res = await postService.getPostsByUser(user.id, page, 30);

        // Handle both paginated and array responses
        const postsData = res.data || res;
        const currentPage = res.current_page || 1;
        const lastPage = res.last_page || 1;

        if (append) {
          setPosts(prev => [...prev, ...(Array.isArray(postsData) ? postsData : [])]);
        } else {
          setPosts(Array.isArray(postsData) ? postsData : []);
        }

        // Check if more pages exist
        setHasMore(currentPage < lastPage);
      } catch (error) {
        console.error('Failed to fetch user posts:', error);
        // Set empty posts on error
        if (!append) {
          setPosts([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [user, loading, page, hasMore]
  );

  // Scroll handler for infinite scroll
  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= documentHeight - 100) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  // Fetch posts on page change
  useEffect(() => {
    fetchUserPosts(page > 1);
  }, [page, fetchUserPosts]);

  // Initial fetch
  useEffect(() => {
    fetchUserPosts(false);
  }, [user?.id]);

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // When post is updated
  const handlePostUpdate = useCallback((updatedPost: Post) => {
    setPosts(prev => prev.map(post =>
      post.id === updatedPost.id ? updatedPost : post
    ));
  }, []);

  // When post is deleted
  const handlePostDelete = useCallback((postId: number) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  }, []);

  return (
    <div className={`_layout _layout_main_wrapper ${darkMode ? '_dark_wrapper' : ''}`}>
      <div className="_layout_mode_swithing_btn">
        <button type="button" className="_layout_swithing_btn_link" onClick={toggleDarkMode}>
          <div className="_layout_swithing_btn">
            <div className="_layout_swithing_btn_round"></div>
          </div>
          {/* Your dark/light mode SVGs */}
        </button>
      </div>

      <div className="_main_layout">
        <FeedHeader />
        <MobileMenu />
        <MobileBottomNav />

        <div className="container _custom_container">
          <div className="_layout_inner_wrap">
            <div className="row">
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <LeftSidebar />
              </div>

              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <div className="_layout_middle_wrap">
                  <div className="_layout_middle_inner">
                    {/* User Profile Header */}
                    {user && (
                      <div style={{
                        background: '#fff',
                        borderRadius: '8px',
                        padding: '24px',
                        marginBottom: '20px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                          <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: '#e0e0e0',
                            overflow: 'hidden',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            fontWeight: 'bold',
                            color: '#999'
                          }}>
                            {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                          </div>
                          <div>
                            <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '600' }}>
                              {user.first_name} {user.last_name}
                            </h2>
                            <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
                              {user.email}
                            </p>
                            <p style={{ margin: '0', color: '#999', fontSize: '12px' }}>
                              My Profile
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Posts Section */}
                    <div>
                      <h3 style={{ margin: '24px 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#333' }}>
                        My Posts ({posts?.length || 0})
                      </h3>

                      {!posts || posts.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
                          You haven`t posted anything yet
                        </div>
                      )}

                      {posts.map(post => (
                        <TimelinePost
                          key={post.id}
                          post={post}
                          onPostUpdate={handlePostUpdate}
                          onPostDelete={handlePostDelete}
                        />
                      ))}

                      {/* Loader */}
                      {loading && posts.length > 0 && (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                          Loading more posts...
                        </div>
                      )}

                      {/* No more posts message */}
                      {!hasMore && posts.length > 0 && (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                          No more posts to load
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <RightSidebar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
