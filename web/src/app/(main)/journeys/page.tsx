'use client';

import { useState } from 'react';
import { Map, TrendingUp, Flame, Clock } from 'lucide-react';
import { FeedList } from '@/components/feed/feed-list';
import type { PostSortType } from '@/lib/post-api';

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

export default function JourneysPage() {
  const [activeSort, setActiveSort] = useState<SortTab>('latest');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Map className="h-6 w-6 text-teal-500" />
        <h1 className="text-xl font-bold">旅程</h1>
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

      <FeedList
        key={activeSort}
        showComposer={false}
        sort={sortTabMap[activeSort]}
        postType="JOURNEY"
      />
    </div>
  );
}
