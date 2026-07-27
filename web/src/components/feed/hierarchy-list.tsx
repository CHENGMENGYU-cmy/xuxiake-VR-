'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/post/post-card';
import { FeedSkeleton } from './feed-skeleton';
import { getContentHierarchy } from '@/lib/post-api';
import type { Post } from '@/types';

interface HierarchyListProps {
  level?: string;
  userId?: string;
  location?: string;
  mediaType?: string;
  month?: string;
  parentId?: string;
  emptyText?: string;
  showRefresh?: boolean;
  /** 点击卡片跳转的详情路径前缀，如 /diaries 或 /journeys */
  detailBasePath?: string;
}

export function HierarchyList({
  level, userId, location, mediaType, month, parentId,
  emptyText = '暂无内容',
  showRefresh = true,
  detailBasePath,
}: HierarchyListProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const filterKey = `${level}-${userId}-${location}-${mediaType}-${month}-${parentId}`;

  const fetchData = useCallback(async (cursor?: string) => {
    const isLoadMore = !!cursor;
    if (isLoadMore) setIsLoadingMore(true);
    else setIsLoading(true);

    try {
      const result = await getContentHierarchy({
        level, userId, location, mediaType, month, parentId,
        cursor, limit: 12,
      });
      if (isLoadMore) {
        const existingIds = new Set(posts.map(p => p.id));
        const newPosts = (result.posts ?? []).filter(p => !existingIds.has(p.id));
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(result.posts ?? []);
      }
      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch {
      // 静默失败
    }

    if (isLoadMore) setIsLoadingMore(false);
    else setIsLoading(false);
  }, [level, userId, location, mediaType, month, parentId]);

  // 过滤条件变化时重新获取
  useEffect(() => {
    fetchData();
  }, [filterKey]);

  const handleRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-4">
      {/* 刷新按钮 */}
      {showRefresh && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-sm text-muted-foreground"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            刷新内容
          </Button>
        </div>
      )}

      {/* 内容列表 */}
      {isLoading ? (
        <FeedSkeleton count={3} />
      ) : posts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post) => (
              detailBasePath ? (
                <button
                  key={post.id}
                  onClick={() => router.push(`${detailBasePath}/${post.id}`)}
                  className="block w-full rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm">{post.content || '(无内容)'}</p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        {post.location?.name && (
                          <span>{post.location.name}</span>
                        )}
                        <span>{new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
                        {post.mediaItems && post.mediaItems.length > 0 && (
                          <span>{post.mediaItems.length} 个附件</span>
                        )}
                      </div>
                    </div>
                    {post.mediaItems?.[0]?.type === 'IMAGE' && (
                      <img
                        src={post.mediaItems[0].url}
                        alt=""
                        className="h-16 w-16 shrink-0 rounded-md object-cover"
                      />
                    )}
                  </div>
                </button>
              ) : (
                <PostCard key={post.id} post={post} />
              )
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center py-4">
              <Button
                variant="outline"
                className="text-sm text-muted-foreground"
                onClick={() => fetchData(nextCursor ?? undefined)}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? '加载中...' : '加载更多'}
              </Button>
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <div className="flex justify-center py-4">
              <p className="text-sm text-muted-foreground">没有更多内容了</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
