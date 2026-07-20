'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Video, Image, Music, FileText, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MediaCard } from '@/components/media/media-card';
import { usePostStore } from '@/stores/post-store';
import { getHotTopics } from '@/lib/post-api';
import { getRecommendedUsers } from '@/lib/social-api';
import type { MediaType, Topic, RecommendedUser } from '@/types';

const mediaTabs: { value: MediaType | 'ALL'; label: string; icon: typeof Video; color: string }[] = [
  { value: 'ALL', label: '全部', icon: FileText, color: 'text-primary' },
  { value: 'VIDEO', label: '旅行视频', icon: Video, color: 'text-teal-500' },
  { value: 'IMAGE', label: '旅行图片', icon: Image, color: 'text-orange-500' },
  { value: 'AUDIO', label: '音频记录', icon: Music, color: 'text-teal-400' },
];

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
  const vrParam = searchParams.get('vr');

  const [mediaType, setMediaType] = useState<MediaType | 'ALL'>(
    typeParam && ['VIDEO', 'IMAGE', 'AUDIO'].includes(typeParam) ? typeParam : 'ALL'
  );
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [hotTopics, setHotTopics] = useState<Topic[]>([]);
  const [featuredCreators, setFeaturedCreators] = useState<RecommendedUser[]>([]);

  const { posts, isLoading, isLoadingMore, hasMore, fetchPosts, loadMore } = usePostStore();

  // 加载热门话题标签
  useEffect(() => {
    getHotTopics(12).then(setHotTopics).catch(() => {});
    getRecommendedUsers(1, 20).then((res) => {
      const all = res.data || [];
      const picked = [...all].sort(() => Math.random() - 0.5).slice(0, 8);
      setFeaturedCreators(picked);
    }).catch(() => {});
  }, []);

  // URL type 参数变化时同步
  useEffect(() => {
    if (typeParam && ['VIDEO', 'IMAGE', 'AUDIO'].includes(typeParam)) {
      setMediaType(typeParam);
    }
  }, [typeParam]);

  // 获取媒体数据
  useEffect(() => {
    fetchPosts('latest', { postType: 'VR_MEDIA' });
  }, [fetchPosts]);

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

  // VR筛选
  const vrFilteredPosts = vrParam === 'true'
    ? filteredPosts.filter((post) => post.mediaItems?.some((m) => m.vrFormat && m.vrFormat !== 'STANDARD'))
    : filteredPosts;

  return (
    <div className="space-y-5">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">媒体广场</h1>
          {vrParam === 'true' && (
            <Badge className="bg-violet-500/90 text-white text-xs">VR全景</Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground"
          onClick={() => fetchPosts('latest', { postType: 'VR_MEDIA' })}
          disabled={isLoading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {/* 精选创作者推荐 */}
      {featuredCreators.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">热门创作者</p>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {featuredCreators.map((creator) => (
              <Link
                key={creator.id}
                href={`/profile/${creator.username}`}
                className="flex flex-col items-center gap-1.5 shrink-0 group"
              >
                <Avatar className="h-14 w-14 border-2 border-transparent group-hover:border-primary transition-colors">
                  <AvatarImage src={creator.avatarUrl} alt={creator.displayName} />
                  <AvatarFallback>{creator.displayName[0]}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-center max-w-[60px] truncate">
                  {creator.displayName}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

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

      {/* 热门标签筛选 */}
      {hotTopics.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedTag(null)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedTag === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            全部标签
          </button>
          {hotTopics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTag(selectedTag === topic.id ? null : topic.id)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedTag === topic.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              # {topic.name}
            </button>
          ))}
        </div>
      )}

      {/* 媒体网格 */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg bg-muted animate-pulse aspect-[4/3]" />
          ))}
        </div>
      ) : vrFilteredPosts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {vrFilteredPosts.map((post) => (
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

          {!hasMore && vrFilteredPosts.length > 0 && (
            <div className="flex justify-center py-4">
              <p className="text-sm text-muted-foreground">没有更多内容了</p>
            </div>
          )}
        </>
      ) : (
        <div className="py-16 text-center">
          <Video className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">
            {vrParam === 'true'
              ? '暂无VR全景内容'
              : `暂无${mediaType === 'ALL' ? '' : mediaTabs.find((t) => t.value === mediaType)?.label}内容`}
          </p>
        </div>
      )}
    </div>
  );
}
