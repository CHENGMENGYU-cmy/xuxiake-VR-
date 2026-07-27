'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Flame, Clock, Home, Video, Image, Music, Compass, MessageSquare, FileText } from 'lucide-react';
import { FeedList } from '@/components/feed/feed-list';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth-store';
import { getHotTopics } from '@/lib/post-api';
import { getRecommendedUsers } from '@/lib/social-api';
import type { PostSortType } from '@/lib/post-api';
import type { PostType, Topic, RecommendedUser } from '@/types';

type SortTab = 'trending' | 'latest' | 'hot';

const sortTabMap: Record<SortTab, PostSortType> = {
  trending: 'trending',
  latest: 'latest',
  hot: 'hot',
};

const sortTabs = [
  { id: 'trending' as SortTab, label: '热门', icon: TrendingUp },
  { id: 'latest' as SortTab, label: '最新', icon: Clock },
  { id: 'hot' as SortTab, label: '精选', icon: Flame },
];

const contentTabs: { id: string; label: string; icon: typeof Home; postType?: PostType }[] = [
  { id: 'all', label: '全部', icon: Home },
  { id: 'VIDEO', label: '第一视角', icon: Video, postType: 'VR_MEDIA' },
  { id: 'IMAGE', label: '影像', icon: Image, postType: 'VR_MEDIA' },
  { id: 'AUDIO', label: '语音', icon: Music, postType: 'VR_MEDIA' },
  { id: 'JOURNEY', label: '游记', icon: Compass, postType: 'JOURNEY' },
  { id: 'NOTE', label: '随记', icon: FileText, postType: 'NOTE' },
  { id: 'MOMENT', label: '瞬间', icon: MessageSquare, postType: 'MOMENT' },
];

export default function ExplorePage() {
  const [activeSort, setActiveSort] = useState<SortTab>('trending');
  const [activeContent, setActiveContent] = useState('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [hotTopics, setHotTopics] = useState<Topic[]>([]);
  const [featuredCreators, setFeaturedCreators] = useState<RecommendedUser[]>([]);
  const { user } = useAuthStore();

  useEffect(() => {
    getHotTopics(12).then(setHotTopics).catch(() => {});
    if (user) {
      getRecommendedUsers(1, 20).then((res) => {
        const all = res.data || [];
        const picked = [...all].sort(() => Math.random() - 0.5).slice(0, 8);
        setFeaturedCreators(picked);
      }).catch(() => {});
    }
  }, [user]);

  const currentContent = contentTabs.find((t) => t.id === activeContent);

  return (
    <div className="space-y-4">
      {/* 热门创作者 */}
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
                <Avatar className="h-12 w-12 border-2 border-transparent group-hover:border-primary transition-colors">
                  <AvatarImage src={creator.avatarUrl} alt={creator.displayName} />
                  <AvatarFallback>{creator.displayName[0]}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-center max-w-[56px] truncate">
                  {creator.displayName}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 内容类型筛选 */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
        {contentTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeContent === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveContent(tab.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
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

      {/* 热门话题标签 */}
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
            全部话题
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

      {/* 排序切换 */}
      <div className="flex gap-1">
        {sortTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSort(tab.id)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeSort === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 内容列表 */}
      <FeedList
        key={`${activeSort}-${activeContent}-${selectedTag}`}
        showComposer={false}
        sort={sortTabMap[activeSort]}
        postType={currentContent?.postType}
        tagId={selectedTag ?? undefined}
      />
    </div>
  );
}
