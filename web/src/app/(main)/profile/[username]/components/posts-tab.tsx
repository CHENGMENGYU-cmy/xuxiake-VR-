'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FileText, Play, Map, Compass, BookOpen, MessageSquare, Loader2 } from 'lucide-react';
import { PostCard } from '@/components/post/post-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import apiClient from '@/lib/api-client';
import type { Post } from '@/types';

const postTypeFilters = [
  { value: '', label: '全部', icon: null },
  { value: 'NOTE', label: '笔记', icon: <FileText className="h-3.5 w-3.5" /> },
  { value: 'VR_MEDIA', label: 'VR', icon: <Play className="h-3.5 w-3.5" /> },
  { value: 'ROUTE', label: '路线', icon: <Map className="h-3.5 w-3.5" /> },
  { value: 'GUIDE', label: '攻略', icon: <BookOpen className="h-3.5 w-3.5" /> },
  { value: 'JOURNEY', label: '旅程', icon: <Compass className="h-3.5 w-3.5" /> },
  { value: 'MOMENT', label: '动态', icon: <MessageSquare className="h-3.5 w-3.5" /> },
];

interface PostsTabProps {
  username: string;
  isOwnProfile: boolean;
}

export function PostsTab({ username, isOwnProfile }: PostsTabProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [activeType, setActiveType] = useState('');
  const observerRef = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(async (type: string, cursor?: string) => {
    const params: Record<string, string> = { limit: '20' };
    if (type) params.type = type;
    if (cursor) params.cursor = cursor;

    const res = await apiClient.get(`/users/${username}/posts`, { params });
    if (res.data.success) {
      return res.data;
    }
    return { data: [], nextCursor: null, hasMore: false };
  }, [username]);

  // 首次加载或类型切换
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPosts([]);
    setNextCursor(null);
    setHasMore(false);

    fetchPosts(activeType).then((res) => {
      if (!cancelled) {
        setPosts(res.data);
        setNextCursor(res.nextCursor);
        setHasMore(res.hasMore);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [activeType, fetchPosts]);

  // 无限滚动加载更多
  useEffect(() => {
    if (!hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true);
          fetchPosts(activeType, nextCursor || undefined).then((res) => {
            setPosts((prev) => [...prev, ...res.data]);
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
  }, [hasMore, loadingMore, activeType, nextCursor, fetchPosts]);

  return (
    <div className="space-y-4">
      {/* 类型筛选栏 */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
        {postTypeFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={activeType === filter.value ? 'default' : 'outline'}
            size="sm"
            className="flex-shrink-0 gap-1 rounded-full text-xs"
            onClick={() => setActiveType(filter.value)}
          >
            {filter.icon}
            {filter.label}
          </Button>
        ))}
      </div>

      {/* 帖子列表 */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {loadingMore && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {hasMore && <div ref={observerRef} className="h-4" />}
        </div>
      ) : (
        <div className="py-12 text-center text-muted-foreground">
          {isOwnProfile ? '还没有发布任何内容' : '还没有发布内容'}
        </div>
      )}
    </div>
  );
}
