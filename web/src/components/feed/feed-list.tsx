'use client';

import { useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/post/post-card';
import { PostComposer } from '@/components/post/post-composer';
import { FeedSkeleton } from './feed-skeleton';
import { usePostStore } from '@/stores/post-store';
import { Post } from '@/types';

interface FeedListProps {
  initialPosts: Post[];
  showComposer?: boolean;
}

export function FeedList({ initialPosts, showComposer = true }: FeedListProps) {
  const { posts, isLoading, fetchPosts } = usePostStore();

  // 组件挂载时加载数据，如果store为空则使用initialPosts
  useEffect(() => {
    if (posts.length === 0 && initialPosts.length > 0) {
      // 如果store为空但有initialPosts，直接使用initialPosts
      usePostStore.setState({ posts: initialPosts });
    } else if (posts.length === 0) {
      // 如果都没有数据，从API获取
      fetchPosts();
    }
  }, []);

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
          className="gap-1.5 text-sm text-gray-500"
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
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* 加载更多 */}
      <div className="flex justify-center py-4">
        <Button variant="outline" className="text-sm text-gray-500">
          加载更多...
        </Button>
      </div>
    </div>
  );
}
