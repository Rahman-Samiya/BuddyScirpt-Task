"use client";

import { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Virtuoso } from 'react-virtuoso';
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
import { useTheme } from '../contexts/ThemeContext';

// ─── Constants ────────────────────────────────────────────────────────────────

const POSTS_PER_PAGE = 10;

// ─── Types ────────────────────────────────────────────────────────────────────

type PostsPage = Awaited<ReturnType<typeof postService.getMyPosts>>;
type PostsInfiniteData = { pages: PostsPage[]; pageParams: number[] };

// ─── Component ───────────────────────────────────────────────────────────────

export default function MyProfile() {
  const { user }    = useAuth();
  const queryClient = useQueryClient();
  const { isDark, toggleDark } = useTheme();

  // ── Scroll container ref (_layout_middle_wrap is the actual scroller) ─────────
  const [scrollParent, setScrollParent] = useState<HTMLElement | null>(null);

  // ── Scroll gate: prevent endReached from firing before any user scroll ────────
  const scrolledOnce = useRef(false);

  useEffect(() => {
    if (!scrollParent) return;
    const onScroll = () => { if (scrollParent.scrollTop > 0) scrolledOnce.current = true; };
    scrollParent.addEventListener('scroll', onScroll, { passive: true });
    return () => scrollParent.removeEventListener('scroll', onScroll);
  }, [scrollParent]);

  // ── Query ────────────────────────────────────────────────────────────────────
  const queryKey = useMemo(() => ['user-posts'] as const, []);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }: { pageParam?: number }) => {
      const res = await postService.getMyPosts(pageParam, POSTS_PER_PAGE);
      return { ...res, _page: pageParam };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.current_page < lastPage.last_page
        ? lastPage.current_page + 1
        : undefined,
    enabled: !!user,
    staleTime: 30_000,
    gcTime:    5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 30_000),
  });

  // Reset scroll gate whenever a new page arrives
  useEffect(() => {
    scrolledOnce.current = false;
  }, [data?.pages.length]);

  // Flatten + deduplicate by id
  const posts = useMemo(() => {
    if (!data) return [];
    const seen = new Set<number>();
    return data.pages.flatMap((page) => page.data).filter((post) => {
      if (seen.has(post.id)) return false;
      seen.add(post.id);
      return true;
    });
  }, [data]);

  // ── Cache helpers ────────────────────────────────────────────────────────────

  const handlePostUpdate = useCallback((updatedPost: Post) => {
    queryClient.setQueryData<PostsInfiniteData>(queryKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data.map((p) => (p.id === updatedPost.id ? updatedPost : p)),
        })),
      };
    });
  }, [queryClient, queryKey]);

  const handlePostDelete = useCallback((postId: number) => {
    queryClient.setQueryData<PostsInfiniteData>(queryKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data.filter((p) => p.id !== postId),
        })),
      };
    });
  }, [queryClient, queryKey]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className={`_layout _layout_main_wrapper${isDark ? ' _dark_wrapper' : ''}`}>

      {/* Dark mode toggle */}
      <div className="_layout_mode_swithing_btn">
        <button
          type="button"
          className="_layout_swithing_btn_link"
          onClick={toggleDark}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <div className="_layout_swithing_btn">
            <div className="_layout_swithing_btn_round" />
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
                {/* --feed modifier sets _layout_middle_inner height to auto so posts aren't clipped */}
                <div
                  className="_layout_middle_wrap _layout_middle_wrap--feed"
                  ref={setScrollParent}
                >
                  <div className="_layout_middle_inner">

                    {/* Profile header */}
                    {user && (
                      <div style={{
                        background: '#fff',
                        borderRadius: '8px',
                        padding: '24px',
                        marginBottom: '20px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: '#e0e0e0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            fontWeight: 'bold',
                            color: '#999',
                            flexShrink: 0,
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
                            <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>
                              My Profile
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Posts count heading */}
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#333' }}>
                      My Posts ({posts.length}{hasNextPage ? '+' : ''})
                    </h3>

                    {/* Error state */}
                    {isError && (
                      <div style={{ textAlign: 'center', padding: 16 }}>
                        <div>Failed to load posts.</div>
                        <button onClick={() => refetch()}>Retry</button>
                      </div>
                    )}

                    {/* Initial loading */}
                    {isLoading && (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        Loading posts...
                      </div>
                    )}

                    {/* Empty state */}
                    {!isLoading && !isError && posts.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
                        You haven't posted anything yet.
                      </div>
                    )}

                    {/* Virtualized post list */}
                    {!isLoading && posts.length > 0 && (
                      <Virtuoso
                        customScrollParent={scrollParent ?? undefined}
                        data={posts}
                        computeItemKey={(_index, post) => post.id}
                        increaseViewportBy={400}
                        style={{ width: '100%' }}
                        itemContent={(_index, post: Post) => (
                          <TimelinePost
                            post={post}
                            onPostUpdate={handlePostUpdate}
                            onPostDelete={handlePostDelete}
                          />
                        )}
                        endReached={() => {
                          if (hasNextPage && !isFetchingNextPage && scrolledOnce.current) {
                            fetchNextPage();
                          }
                        }}
                      />
                    )}

                    {/* Pagination loading indicator */}
                    {isFetchingNextPage && (
                      <div style={{ textAlign: 'center', padding: '12px 0', color: '#666' }}>
                        Loading more posts...
                      </div>
                    )}

                    {/* End-of-feed message */}
                    {!hasNextPage && posts.length > 0 && (
                      <div style={{ textAlign: 'center', padding: '12px 0', color: '#666' }}>
                        No more posts to load
                      </div>
                    )}

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
