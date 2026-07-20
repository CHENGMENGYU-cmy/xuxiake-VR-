'use client';

import { useState } from 'react';
import { TrendingUp, Flame, Clock, Home, Video, Image, Music, Map, Compass, BookOpen, MessageSquare } from 'lucide-react';
import { FeedList } from '@/components/feed/feed-list';
import type { PostSortType, PostType } from '@/types';

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
  { id: 'VIDEO', label: '旅行视频', icon: Video, postType: 'VR_MEDIA' },
  { id: 'IMAGE', label: '旅行图片', icon: Image, postType: 'VR_MEDIA' },
  { id: 'AUDIO', label: '音频记录', icon: Music, postType: 'VR_MEDIA' },
  { id: 'ROUTE', label: '路线', icon: Map, postType: 'ROUTE' },
  { id: 'JOURNEY', label: '旅程', icon: Compass, postType: 'JOURNEY' },
  { id: 'GUIDE', label: '攻略', icon: BookOpen, postType: 'GUIDE' },
  { id: 'MOMENT', label: '动态', icon: MessageSquare, postType: 'MOMENT' },
];

export default function ExplorePage() {
  const [activeSort, setActiveSort] = useState<SortTab>('trending');
  const [activeContent, setActiveContent] = useState('all');

  const currentContent = contentTabs.find((t) => t.id === activeContent);

  return (
    <div className="space-y-4">
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
        key={`${activeSort}-${activeContent}`}
        showComposer={false}
        sort={sortTabMap[activeSort]}
        postType={currentContent?.postType}
      />
    </div>
  );
}
