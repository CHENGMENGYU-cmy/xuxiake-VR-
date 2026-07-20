'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, Heart } from 'lucide-react';
import { PostCard } from '@/components/post/post-card';
import { Skeleton } from '@/components/ui/skeleton';
import apiClient from '@/lib/api-client';
import type { Post } from '@/types';

interface LikesTabProps {
  username: string;
  isOwnProfile: boolean;
}

interface LikedPost {
  likeId: string;
  likedAt: string;
  post: Post;
}

export function LikesTab({ username, isOwnProfile }: LikesTabProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);

  const fetchLikes = useCallback(async (cursor?: string) => {
    const params: Record<string, string> = { limit: '20' };
    if (cursor) params.cursor = cursor;

    const res = await apiClient.get(`/users/${username}/likes`, { params });
    if (res.data.success) {
      return res.data;
    }
    return { data: [], nextCursor: null, hasMore: false, visible: true };
  }, [username]);

  // 首次加载
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPosts([]);
    setNextCursor(null);
    setHasMore(false);

    fetchLikes().then((res) => {
      if (!cancelled) {
        setVisible(res.visible !== false);
        const likedPosts = res.data
          .map((item: LikedPost) => item.post)
          .filter(Boolean);
        setPosts(likedPosts);
        setNextCursor(res.nextCursor);
        setHasMore(res.hasMore);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [fetchLikes]);

  // 无限滚动加载更多
  useEffect(() => {
    if (!hasMore || loadingMore || !visible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true);
          fetchLikes(nextCursor || undefined).then((res) => {
            const likedPosts = res.data
              .map((item: LikedPost) => item.post)
              .filter(Boolean);
            setPosts((prev) => [...prev, ...likedPosts]);
            setNextCursor(res.nextCursor);
            setHasMore(res.hasMore);
            setLoadingMore(false);
          }).catch(() => setLoadingMore(false));
        }
      },
      { threshold: 0.1 }
    );

    const el = observerRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [hasMore, loadingMore, nextCursor, fetchLikes, visible]);

  // 不可见状态（非本人查看）
  if (!loading && !visible) {
    return (
      <div className="py-12 text-center">
        <Heart className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
        <p className="text-muted-foreground">该用户赞过的内容不公开</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLikeChange={(isLiked) => {
                if (!isLiked) {
                  // 取消点赞时从列表中移除
                  setPosts((prev) => prev.filter((p) => p.id !== post.id));
                  setTotal((prev) => Math.max(0, prev - 1));
                }
              }}
            />
          ))}
          {loadingMore && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {hasMore && <div ref={observerRef} className="h-4" />}
        </div>
      ) : (
        <div className="py-12 text-center">
          <Heart className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-muted-foreground">
            {isOwnProfile ? '去发现更多精彩内容' : '还没有点赞记录'}
          </p>
        </div>
      )}
    </div>
  );
}
