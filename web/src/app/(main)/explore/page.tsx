'use client';

import { useState } from 'react';
import { TrendingUp, Flame, Clock } from 'lucide-react';
import { FeedList } from '@/components/feed/feed-list';
import type { PostSortType } from '@/lib/post-api';

type TabType = 'trending' | 'latest' | 'hot';

const tabSortMap: Record<TabType, PostSortType> = {
  trending: 'trending',
  latest: 'latest',
  hot: 'hot',
};

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<TabType>('trending');

  const tabs = [
    { id: 'trending' as TabType, label: '热门', icon: TrendingUp },
    { id: 'latest' as TabType, label: '最新', icon: Clock },
    { id: 'hot' as TabType, label: '精选', icon: Flame },
  ];

  return (
    <div className="space-y-4">
      {/* 排序切换 */}
      <div className="flex gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
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
        key={activeTab}
        showComposer={false}
        sort={tabSortMap[activeTab]}
      />
    </div>
  );
}
