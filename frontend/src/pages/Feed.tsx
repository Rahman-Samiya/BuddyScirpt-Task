"use client";

import { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Virtuoso } from "react-virtuoso";
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

// ─── Types ────────────────────────────────────────────────────────────────────

type PostsPage = Awaited<ReturnType<typeof postService.getPostsPaginated>>;

type PostsInfiniteData = {
  pages: PostsPage[];
  pageParams: number[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const POSTS_PER_PAGE = 10;
const STALE_TIME_MS  = 30_000;
const GC_TIME_MS     = 5 * 60_000;

// ─── Pure helpers (outside component — never re-created) ─────────────────────

/**
 * Immutably update a matching post across all paginated pages.
 */
function updatePostInPages(
  pages: PostsPage[],
  predicate: (p: Post) => boolean,
  updater: (p: Post) => Post,
): PostsPage[] {
  return pages.map((page) => ({
    ...page,
    data: page.data.map((post: Post) => (predicate(post) ? updater(post) : post)),
  }));
}

/**
 * Client-side visibility fallback.
 * Prefer server-side filtering; this is a non-destructive safety net only.
 */
function isPostVisible(post: Post): boolean {
  if (post.visibility === 'public') return true;
  if (post.visibility === 'private' && post.is_owner) return true;
  return false;
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function PostSkeleton() {
  return (
    <div style={{ padding: 12 }}>
      <div style={{ height: 12, background: '#eee', marginBottom: 8, width: '40%', borderRadius: 4 }} />
      <div style={{ height: 200, background: '#f6f6f6', borderRadius: 4 }} />
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Feed() {
  const { user }    = useAuth();
  const queryClient = useQueryClient();

  // ── UI state ──
  const [isDark, setIsDark] = useState(false);

  // ── Scroll container ──
  const [scrollParent, setScrollParent]       = useState<HTMLElement | null>(null);
  const [hasUserScrolled, setHasUserScrolled] = useState(false);

  // ── Pagination gate ──────────────────────────────────────────────────────────
  // hasReachedEnd is set to true ONLY when Virtuoso's atBottomStateChange fires.
  // The sentinel <div> that triggers fetchNextPage is NOT in the DOM until then,
  // so the IntersectionObserver cannot fire prematurely on page load.
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  // ── Refs ──
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // ── Scroll container ref callback ──
  const middleWrapRef = useCallback((node: HTMLDivElement | null) => {
    setScrollParent(node);
  }, []);

  // ── Query key ──
  const queryKey = useMemo(
    () => ['posts', user?.id, { visibility: 'list' }] as const,
    [user?.id],
  );

  // ─── Dark mode ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add('theme--dark');
    else root.classList.remove('theme--dark');
  }, [isDark]);

  // ─── Data fetching ──────────────────────────────────────────────────────────

  const fetchPosts = useCallback(async ({ pageParam = 1 }: { pageParam?: number }) => {
    const res = await postService.getPostsPaginated(pageParam, POSTS_PER_PAGE);
    return {
      ...res,
      data: res.data.filter((p: Post) => isPostVisible(p)),
      _page: pageParam,
    };
  }, []);

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
    getNextPageParam: (lastPage) =>
      lastPage.current_page < lastPage.last_page
        ? lastPage.current_page + 1
        : undefined,
    staleTime: STALE_TIME_MS,
    gcTime:    GC_TIME_MS,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 30_000),
  });

  // Flatten pages → single array for Virtuoso
  const posts = useMemo(
    () => (data ? data.pages.flatMap((page) => page.data) : []),
    [data],
  );

  // ─── Reset gate whenever a new page arrives ─────────────────────────────────
  // After page 2 loads, hasReachedEnd resets to false. This removes the sentinel
  // from the DOM and forces the user to scroll to the new bottom before page 3
  // is fetched. The cycle repeats for every subsequent page.

  useEffect(() => {
    setHasReachedEnd(false);
  }, [data?.pages.length]);

  // ─── Scroll listener ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!scrollParent) return;
    const onScroll = () => {
      if (scrollParent.scrollTop > 0) setHasUserScrolled(true);
    };
    scrollParent.addEventListener('scroll', onScroll, { passive: true });
    return () => scrollParent.removeEventListener('scroll', onScroll);
  }, [scrollParent]);

  // ─── IntersectionObserver on sentinel ──────────────────────────────────────
  // Runs only after hasReachedEnd flips to true (sentinel is in the DOM).

  useEffect(() => {
    observerRef.current?.disconnect();

    const sentinel = sentinelRef.current;
    if (!sentinel || !scrollParent || !hasNextPage || !hasReachedEnd) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: scrollParent,
        rootMargin: '0px',
        threshold: 1.0,
      },
    );

    observerRef.current.observe(sentinel);
    return () => observerRef.current?.disconnect();
  }, [scrollParent, hasNextPage, hasReachedEnd, isFetchingNextPage, fetchNextPage]);

  // ─── Cache helpers ──────────────────────────────────────────────────────────

  const replacePostInCache = useCallback((newPost: Post) => {
    queryClient.setQueryData<PostsInfiniteData>(queryKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: updatePostInPages(old.pages, (p) => p.id === newPost.id, () => newPost),
      };
    });
  }, [queryClient, queryKey]);

  const removePostFromCache = useCallback((postId: number) => {
    queryClient.setQueryData<PostsInfiniteData>(queryKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data.filter((p: Post) => p.id !== postId),
        })),
      };
    });
  }, [queryClient, queryKey]);

  // ─── Post event handlers ────────────────────────────────────────────────────

  const handlePostCreated = useCallback((newPost?: Post) => {
    if (!newPost) return;
    queryClient.setQueryData<PostsInfiniteData>(queryKey, (old) => {
      if (!old) {
        return {
          pages: [{ data: [newPost], current_page: 1, last_page: 1 }],
          pageParams: [1],
        };
      }
      const newPages = [...old.pages];
      newPages[0] = { ...newPages[0], data: [newPost, ...newPages[0].data] };
      return { ...old, pages: newPages };
    });
  }, [queryClient, queryKey]);

  const handlePostUpdate = useCallback((updatedPost: Post) => {
    replacePostInCache(updatedPost);
  }, [replacePostInCache]);

  const handlePostDelete = useCallback((postId: number) => {
    removePostFromCache(postId);
  }, [removePostFromCache]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="_layout _layout_main_wrapper">

      {/* Dark mode toggle */}
      <div className="_layout_mode_switching_btn">
        <button
          type="button"
          className="_layout_switching_btn_link"
          onClick={() => setIsDark((d) => !d)}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <div className="_layout_switching_btn">
            <div className="_layout_switching_btn_round" />
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

              {/* Left sidebar */}
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <LeftSidebar />
              </div>

              {/* Main feed column */}
              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <div
                  className="_layout_middle_wrap _layout_middle_wrap--feed"
                  ref={middleWrapRef}
                >
                  <div className="_layout_middle_inner">
                    <StoriesDesktop />
                    <StoriesMobile />

                    <Composer onPostCreated={handlePostCreated} />

                    {/* Error state */}
                    {isError && (
                      <div style={{ textAlign: 'center', padding: 16 }}>
                        <div>Failed to load posts.</div>
                        <button onClick={() => refetch()}>Retry</button>
                      </div>
                    )}

                    {/* Empty state */}
                    {!isLoading && !isError && posts.length === 0 && (
                      <div style={{ textAlign: 'center', padding: 16 }}>
                        No posts yet — start the conversation!
                      </div>
                    )}

                    {/* Initial skeleton loaders */}
                    {isLoading && (
                      <div>
                        {Array.from({ length: 4 }).map((_, i) => (
                          <PostSkeleton key={i} />
                        ))}
                      </div>
                    )}

                    {/* ── Virtualized post list ─────────────────────────────
                        atBottomStateChange fires `true` only when the user has
                        scrolled to the very last item in the current list.
                        That is the moment we flip hasReachedEnd → true, which
                        mounts the sentinel and unlocks the next-page fetch.
                    ──────────────────────────────────────────────────────── */}
                    {!isLoading && posts.length > 0 && (
                      <Virtuoso
                        key={scrollParent ? 'feed-scroll-parent' : 'feed-self-scroll'}
                        data={posts}
                        computeItemKey={(_index, post) => post.id}
                        overscan={200}
                        customScrollParent={scrollParent ?? undefined}
                        style={{ height: 'auto' }}
                        itemContent={(_index, post: Post) => (
                          <TimelinePost
                            post={post}
                            onPostUpdate={handlePostUpdate}
                            onPostDelete={handlePostDelete}
                          />
                        )}
                        atBottomStateChange={(atBottom) => {
                          // Gate: user must have scrolled AND be at the bottom
                          if (atBottom && hasUserScrolled && hasNextPage) {
                            setHasReachedEnd(true);
                          }
                        }}
                      />
                    )}

                    {/* ── Sentinel ─────────────────────────────────────────
                        Only mounted once the user has scrolled to the bottom
                        of the current page (hasReachedEnd === true).
                        IntersectionObserver watches it → calls fetchNextPage.
                        After each new page loads, hasReachedEnd resets to false,
                        removing this element until the user scrolls down again.
                    ──────────────────────────────────────────────────────── */}
                    {hasNextPage && hasReachedEnd && (
                      <div
                        ref={sentinelRef}
                        style={{ height: 1, width: '100%' }}
                        aria-hidden="true"
                      />
                    )}

                    {/* Pagination loading indicator */}
                    {isFetchingNextPage && posts.length > 0 && (
                      <div style={{ textAlign: 'center', padding: '12px 0' }}>
                        Loading more posts…
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

              {/* Right sidebar */}
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