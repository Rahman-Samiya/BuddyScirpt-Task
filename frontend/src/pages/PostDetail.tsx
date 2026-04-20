"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FeedHeader,
  MobileMenu,
  MobileBottomNav,
  LeftSidebar,
  StoriesDesktop,
  StoriesMobile,
  TimelinePost,
  RightSidebar
} from '../components/feed';
import { postService } from '../services/postService';
import type { Post } from '../services/postService';

export default function PostDetail() {
  const [darkMode, setDarkMode] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params?.id?.[0] : undefined;
  const router = useRouter();

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Fetch single post
  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const fetchedPost = await postService.getPost(parseInt(id));
        setPost(fetchedPost);
      } catch (err) {
        console.error('Failed to fetch post:', err);
        setError('Post not found or you do not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // When post is updated
  const handlePostUpdate = (updatedPost: Post) => {
    setPost(updatedPost);
  };

  // When post is deleted
  const handlePostDelete = () => {
    router.replace('/feed'); // Redirect to feed when post is deleted
  };

  if (loading) {
    return (
      <div className={`_layout _layout_main_wrapper ${darkMode ? '_dark_wrapper' : ''}`}>
        <div className="_layout_mode_swithing_btn">
          <button type="button" className="_layout_swithing_btn_link" onClick={toggleDarkMode}>
            <div className="_layout_swithing_btn">
              <div className="_layout_swithing_btn_round"></div>
            </div>
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
                      <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
                        Loading post...
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

  if (error || !post) {
    return (
      <div className={`_layout _layout_main_wrapper ${darkMode ? '_dark_wrapper' : ''}`}>
        <div className="_layout_mode_swithing_btn">
          <button type="button" className="_layout_swithing_btn_link" onClick={toggleDarkMode}>
            <div className="_layout_swithing_btn">
              <div className="_layout_swithing_btn_round"></div>
            </div>
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
                      <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
                        <h3>Post Not Found</h3>
                        <p>{error || 'The post you are looking for does not exist or has been deleted.'}</p>
                        <button
                          onClick={() => router.replace('/feed')}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginTop: '20px'
                          }}
                        >
                          Back to Feed
                        </button>
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

  return (
    <div className={`_layout _layout_main_wrapper ${darkMode ? '_dark_wrapper' : ''}`}>
      <div className="_layout_mode_swithing_btn">
        <button type="button" className="_layout_swithing_btn_link" onClick={toggleDarkMode}>
          <div className="_layout_swithing_btn">
            <div className="_layout_swithing_btn_round"></div>
          </div>
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
                    <StoriesDesktop />
                    <StoriesMobile />

                    <TimelinePost
                      post={post}
                      onPostUpdate={handlePostUpdate}
                      onPostDelete={handlePostDelete}
                    />

                    {/* Back to feed link */}
                    <div style={{ textAlign: 'center', padding: '20px', marginTop: '20px' }}>
                      <button
                        onClick={() => router.replace('/feed')}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        ← Back to Feed
                      </button>
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
