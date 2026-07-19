'use client';

import { useEffect, useCallback } from 'react';
import { RefreshCw, UserPlus, Compass } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/post/post-card';
import { PostComposer } from '@/components/post/post-composer';
import { FeedSkeleton } from './feed-skeleton';
import { usePostStore } from '@/stores/post-store';
import type { PostSortType } from '@/lib/post-api';

interface FeedListProps {
  showComposer?: boolean;
  sort?: PostSortType;
  postType?: string;
  tagId?: string;
  followingOnly?: boolean;
}

export function FeedList({ showComposer = true, sort = 'latest', postType, tagId, followingOnly }: FeedListProps) {
  const { posts = [], isLoading, isLoadingMore, hasMore, fetchPosts, loadMore } = usePostStore();

  // sort 或 filter 变化时重新获取数据
  useEffect(() => {
    fetchPosts(sort, { postType, tagId, followingOnly });
  }, [sort, postType, tagId, followingOnly, fetchPosts]);

  const handleRefresh = useCallback(() => {
    fetchPosts(sort);
  }, [fetchPosts, sort]);

  return (
    <div className="space-y-4">
      {/* 发布框 */}
      {showComposer && <PostComposer />}

      {/* 刷新按钮 */}
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

      {/* 内容列表 */}
      {isLoading ? (
        <FeedSkeleton count={3} />
      ) : posts.length === 0 && followingOnly ? (
        /* 关注动态为空时的引导 */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <UserPlus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">还没有关注动态</h3>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            关注感兴趣的旅行者，他们的最新动态将出现在这里
          </p>
          <div className="flex gap-3">
            <Link href="/discover">
              <Button size="sm" className="gap-1.5">
                <UserPlus className="h-4 w-4" />
                发现旅伴
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="sm" variant="outline" className="gap-1.5">
                <Compass className="h-4 w-4" />
                探索发现
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {(posts ?? []).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* 加载更多 */}
          {hasMore && (
            <div className="flex justify-center py-4">
              <Button
                variant="outline"
                className="text-sm text-muted-foreground"
                onClick={loadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? '加载中...' : '加载更多'}
              </Button>
            </div>
          )}

          {/* 没有更多内容 */}
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
