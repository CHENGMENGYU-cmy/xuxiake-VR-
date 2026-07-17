'use client';

import { useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/post/post-card';
import { PostComposer } from '@/components/post/post-composer';
import { FeedSkeleton } from './feed-skeleton';
import { usePostStore } from '@/stores/post-store';

interface FeedListProps {
  showComposer?: boolean;
}

export function FeedList({ showComposer = true }: FeedListProps) {
  const { posts = [], isLoading, isLoadingMore, hasMore, fetchPosts, loadMore } = usePostStore();

  // 组件挂载时从API加载数据（仅当store为空时）
  useEffect(() => {
    const currentPosts = usePostStore.getState().posts ?? [];
    if (currentPosts.length === 0) {
      fetchPosts();
    }
  }, [fetchPosts]);

  const handleRefresh = useCallback(() => {
    fetchPosts();
  }, [fetchPosts]);

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
      ) : (
        <div className="space-y-4">
          {(posts ?? []).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

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
    </div>
  );
}
