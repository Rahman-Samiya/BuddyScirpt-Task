"use client";

import { useEffect, useMemo, useRef, useCallback, useState } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Virtuoso } from 'react-virtuoso';
import {
  FeedHeader,
  MobileMenu,
  MobileBottomNav,
  LeftSidebar,
  StoriesDesktop,
  StoriesMobile,
  Composer,
  TimelinePost,
  RightSidebar
} from '../components/feed';
import { postService } from '../services/postService';
import type { Post } from '../services/postService';
import { useAuth } from '../contexts/AuthContext';

// Small helper to update a post inside the paginated cache
function updatePostInPages(pages: any, predicate: (p: Post) => boolean, updater: (p: Post) => Post) {
  if (!pages) return pages;
  return pages.map((page: any) => ({
    ...page,
    data: page.data.map((post: Post) => predicate(post) ? updater(post) : post)
  }));
}

export default function Feed() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDark, setIsDark] = useState(false);
  const [scrollParent, setScrollParent] = useState<HTMLElement | null>(null);
  const middleWrapRef = useRef<HTMLDivElement | null>(null);

  const queryKey = ['posts', user?.id, { visibility: 'list' }];

  // Apply dark mode by toggling a class on documentElement to avoid re-rendering the whole tree
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add('theme--dark');
    else root.classList.remove('theme--dark');
  }, [isDark]);

  useEffect(() => {
    if (middleWrapRef.current) {
      setScrollParent(middleWrapRef.current);
    }
  }, []);

  // -------------------------
  // React Query: infinite fetch
  // -------------------------
  // fetch function expects the server page-based response shape returned by postService.getPostsPaginated
  // postService.getPostsPaginated(page, limit) -> { data: Post[], current_page, last_page, ... }
  const fetchPosts = useCallback(async ({ pageParam = 1 }) => {
    const res = await postService.getPostsPaginated(pageParam, 30);
    // NOTE: Prefer server-side visibility filtering. If backend still returns extra items,
    // we keep a small client-side fallback filter (non-destructive) to avoid showing private posts.
    const filtered = res.data.filter((p: Post) => {
      if (p.visibility === 'public') return true;
      if (p.visibility === 'private' && p.user_id === user?.id) return true;
      return false;
    });

    return {
      ...res,
      data: filtered,
      _page: pageParam,
    };
  }, [user?.id]);

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
    queryFn: fetchPosts,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // page-based API -> compute next page
      if (lastPage.current_page < lastPage.last_page) return lastPage.current_page + 1;
      return undefined;
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Flatten posts for rendering
  const posts = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((p: any) => p.data) as Post[];
  }, [data]);

  // -------------------------
  // IntersectionObserver sentinel
  // -------------------------
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!sentinelRef.current) return;
    if (!hasNextPage) return; // nothing to do

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });
    }, {
      root: scrollParent ?? null,
      rootMargin: '200px', // prefetch when sentinel is ~200px from viewport
      threshold: 0.1,
    });

    observerRef.current.observe(sentinelRef.current);

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, scrollParent]);

  // -------------------------
  // Cache helpers for optimistic updates
  // -------------------------
  const replacePostInCache = useCallback((newPost: Post) => {
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return old;
      return {
        ...old,
        pages: updatePostInPages(old.pages, (p: Post) => p.id === newPost.id, () => newPost),
      };
    });
  }, [queryClient]);

  const removePostFromCache = useCallback((postId: number) => {
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page: any) => ({
          ...page,
          data: page.data.filter((p: Post) => p.id !== postId),
        }))
      };
    });
  }, [queryClient]);

  // -------------------------
  // Handlers passed to Composer / TimelinePost
  // Keep these stable using useCallback
  // -------------------------
  const handlePostCreated = useCallback((newPost?: Post) => {
    if (!newPost) return;
    // Insert into first page in the cache
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) {
        // If cache empty, create initial structure
        return {
          pages: [{ data: [newPost], current_page: 1, last_page: 1 }],
        };
      }

      const newPages = [...old.pages];
      // prepend to first page data
      newPages[0] = { ...newPages[0], data: [newPost, ...newPages[0].data] };
      return { ...old, pages: newPages };
    });
  }, [queryClient]);

  const handlePostUpdate = useCallback((updatedPost: Post) => {
    replacePostInCache(updatedPost);
  }, [replacePostInCache]);

  const handlePostDelete = useCallback((postId: number) => {
    removePostFromCache(postId);
  }, [removePostFromCache]);


  // -------------------------
  // Rendering
  // -------------------------
  return (
    <div className={`_layout _layout_main_wrapper`}>
      <div className="_layout_mode_switching_btn">
        <button type="button" className="_layout_switching_btn_link" onClick={() => setIsDark(d => !d)}>
          <div className="_layout_switching_btn">
            <div className="_layout_switching_btn_round"></div>
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
                <div className="_layout_middle_wrap _layout_middle_wrap--feed" ref={middleWrapRef}>
                  <div className="_layout_middle_inner">
                    <StoriesDesktop />
                    <StoriesMobile />

                    <Composer onPostCreated={handlePostCreated} />

                    {/* Error / Empty / Loading states */}
                    {isError && (
                      <div style={{ textAlign: 'center', padding: 16 }}>
                        <div>Failed to load posts.</div>
                        <button onClick={() => refetch()}>Retry</button>
                      </div>
                    )}

                    {!isLoading && posts.length === 0 && (
                      <div style={{ textAlign: 'center', padding: 16 }}>
                        No posts yet — start the conversation!
                      </div>
                    )}

                    {/* Virtualized list via Virtuoso. It accepts the flattened items array. */}
                    <Virtuoso
                      key={scrollParent ? 'feed-scroll-parent' : 'feed-self-scroll'}
                      data={posts}
                      overscan={200}
                      customScrollParent={scrollParent ?? undefined}
                      style={{ height: 'auto' }}
                      itemContent={(_, post: Post) => (
                        <TimelinePost
                          key={post.id}
                          post={post}
                          onPostUpdate={handlePostUpdate}
                          onPostDelete={handlePostDelete}
                        />
                      )}
                    />

                    {/* Loading indicator for pagination */}
                    {isFetchingNextPage && posts.length > 0 && (
                      <div style={{ textAlign: 'center', padding: '12px 0' }}>Loading more posts...</div>
                    )}

                    {/* No more posts message */}
                    {!hasNextPage && posts.length > 0 && (
                      <div style={{ textAlign: 'center', padding: '12px 0', color: '#666' }}>No more posts to load</div>
                    )}

                    {/* Sentinel for IntersectionObserver (prefetch / fetch next page). It's placed after the list. */}
                    <div ref={sentinelRef} style={{ height: 1 }} aria-hidden="true" />

                    {/* Initial skeletons while loading first page */}
                    {isLoading && (
                      <div>
                        {/* simple skeletons */}
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} style={{ padding: 12 }}>
                            <div style={{ height: 12, background: '#eee', marginBottom: 8, width: '40%' }} />
                            <div style={{ height: 200, background: '#f6f6f6' }} />
                          </div>
                        ))}
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
