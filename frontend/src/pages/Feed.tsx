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
import { useTheme } from '../contexts/ThemeContext';

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
  const { isDark, toggleDark } = useTheme();

  // ── Scroll container ref (the _layout_middle_wrap div is the actual scroller) ─
  const [scrollParent, setScrollParent] = useState<HTMLElement | null>(null);

  // ── Scroll gate: prevent endReached from firing before any user scroll ────────
  const scrolledOnce = useRef(false);

  useEffect(() => {
    if (!scrollParent) return;
    const onScroll = () => { if (scrollParent.scrollTop > 0) scrolledOnce.current = true; };
    scrollParent.addEventListener('scroll', onScroll, { passive: true });
    return () => scrollParent.removeEventListener('scroll', onScroll);
  }, [scrollParent]);

  // ── Query key ──
  const queryKey = useMemo(
    () => ['posts', user?.id, { visibility: 'list' }] as const,
    [user?.id],
  );

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

  // Reset scroll gate whenever a new page arrives
  useEffect(() => {
    scrolledOnce.current = false;
  }, [data?.pages.length]);

  // Flatten pages → single array, deduplicating by id
  const posts = useMemo(() => {
    if (!data) return [];
    const seen = new Set<number>();
    return data.pages.flatMap((page) => page.data).filter((post) => {
      if (seen.has(post.id)) return false;
      seen.add(post.id);
      return true;
    });
  }, [data]);

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

              {/* Left sidebar */}
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <LeftSidebar />
              </div>

              {/* Main feed column */}
              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <div
                  className="_layout_middle_wrap _layout_middle_wrap--feed"
                  ref={setScrollParent}
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
