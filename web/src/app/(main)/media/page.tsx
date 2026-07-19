'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Video, Image, Music, FileText, TrendingUp, Clock, Flame, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MediaCard } from '@/components/media/media-card';
import { usePostStore } from '@/stores/post-store';
import type { PostSortType } from '@/lib/post-api';
import type { MediaType } from '@/types';

type TabType = 'trending' | 'latest' | 'hot';

const mediaTabs: { value: MediaType | 'ALL'; label: string; icon: typeof Video; color: string }[] = [
  { value: 'ALL', label: '全部', icon: FileText, color: 'text-primary' },
  { value: 'VIDEO', label: 'AR视频', icon: Video, color: 'text-teal-500' },
  { value: 'IMAGE', label: 'AR图片', icon: Image, color: 'text-orange-500' },
  { value: 'AUDIO', label: '音频记录', icon: Music, color: 'text-teal-400' },
];

const sortTabs: { id: TabType; label: string; icon: typeof TrendingUp }[] = [
  { id: 'trending', label: '热门', icon: TrendingUp },
  { id: 'latest', label: '最新', icon: Clock },
  { id: 'hot', label: '推荐', icon: Flame },
];

const tabSortMap: Record<TabType, PostSortType> = {
  trending: 'trending',
  latest: 'latest',
  hot: 'hot',
};

export default function MediaPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-muted-foreground">加载中...</div>}>
      <MediaContent />
    </Suspense>
  );
}

function MediaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const typeParam = searchParams.get('type') as MediaType | null;

  const [mediaType, setMediaType] = useState<MediaType | 'ALL'>(
    typeParam && ['VIDEO', 'IMAGE', 'AUDIO'].includes(typeParam) ? typeParam : 'ALL'
  );
  const [activeSort, setActiveSort] = useState<TabType>('trending');

  const { posts, isLoading, isLoadingMore, hasMore, fetchPosts, loadMore } = usePostStore();

  // URL type 参数变化时同步
  useEffect(() => {
    if (typeParam && ['VIDEO', 'IMAGE', 'AUDIO'].includes(typeParam)) {
      setMediaType(typeParam);
    }
  }, [typeParam]);

  // 筛选/排序变化时获取数据
  useEffect(() => {
    fetchPosts(tabSortMap[activeSort], { postType: 'VR_MEDIA' });
  }, [activeSort, fetchPosts]);

  const handleTypeChange = (type: MediaType | 'ALL') => {
    setMediaType(type);
    if (type === 'ALL') {
      router.push('/media');
    } else {
      router.push(`/media?type=${type}`);
    }
  };

  // 按媒体类型过滤帖子
  const filteredPosts = posts.filter((post) => {
    if (mediaType === 'ALL') return true;
    return post.mediaItems?.some((m) => m.type === mediaType);
  });

  return (
    <div className="space-y-4">
      {/* 页面标题 */}
      <div className="flex items-center gap-2">
        <Video className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">媒体发现</h1>
      </div>

      {/* 媒体类型Tab */}
      <div className="flex border-b">
        {mediaTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = mediaType === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => handleTypeChange(tab.value)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 排序切换 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {sortTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSort === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSort(tab.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground"
          onClick={() => fetchPosts(tabSortMap[activeSort], { postType: 'VR_MEDIA' })}
          disabled={isLoading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {/* 媒体网格 */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg bg-muted animate-pulse aspect-[4/3]" />
          ))}
        </div>
      ) : filteredPosts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filteredPosts.map((post) => (
              <MediaCard key={post.id} post={post} mediaType={mediaType === 'ALL' ? 'VIDEO' : mediaType} />
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

          {!hasMore && filteredPosts.length > 0 && (
            <div className="flex justify-center py-4">
              <p className="text-sm text-muted-foreground">没有更多内容了</p>
            </div>
          )}
        </>
      ) : (
        <div className="py-16 text-center">
          <Video className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">
            暂无{mediaType === 'ALL' ? '' : mediaTabs.find((t) => t.value === mediaType)?.label}内容
          </p>
        </div>
      )}
    </div>
  );
}
