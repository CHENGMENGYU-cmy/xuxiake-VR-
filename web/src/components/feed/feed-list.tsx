'use client';

import { useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/post/post-card';
import { PostComposer } from '@/components/post/post-composer';
import { FeedSkeleton } from './feed-skeleton';
import { Post } from '@/types';

interface FeedListProps {
  initialPosts: Post[];
  showComposer?: boolean;
}

export function FeedList({ initialPosts, showComposer = true }: FeedListProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(false);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

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
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          刷新内容
        </Button>
      </div>

      {/* 内容列表 */}
      {loading ? (
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
