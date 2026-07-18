'use client';

import { useState } from 'react';
import { Compass, TrendingUp, Flame, Clock, FileText, Video, Map, BookOpen } from 'lucide-react';
import { FeedList } from '@/components/feed/feed-list';
import type { PostSortType } from '@/lib/post-api';

type TabType = 'trending' | 'latest' | 'hot';

const tabSortMap: Record<TabType, PostSortType> = {
  trending: 'trending',
  latest: 'latest',
  hot: 'hot',
};

const contentTypeFilters = [
  { id: 'all', label: '全部', icon: FileText },
  { id: 'VR_MEDIA', label: 'VR内容', icon: Video },
  { id: 'ROUTE', label: '路线', icon: Map },
  { id: 'GUIDE', label: '攻略', icon: BookOpen },
];

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<TabType>('trending');
  const [contentType, setContentType] = useState('all');

  const tabs = [
    { id: 'trending' as TabType, label: '热门内容', icon: TrendingUp },
    { id: 'latest' as TabType, label: '最新发布', icon: Clock },
    { id: 'hot' as TabType, label: '精选推荐', icon: Flame },
  ];

  return (
    <div className="space-y-4">
      {/* 页面标题 */}
      <div className="flex items-center gap-2">
        <Compass className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">探索发现</h1>
      </div>

      {/* 排序切换 */}
      <div className="flex border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
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

      {/* 内容类型筛选 */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none">
        {contentTypeFilters.map((filter) => {
          const Icon = filter.icon;
          const isActive = contentType === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setContentType(filter.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* 内容区域 */}
      <div>
        <FeedList
          key={`${activeTab}-${contentType}`}
          showComposer={false}
          sort={tabSortMap[activeTab]}
          postType={contentType !== 'all' ? contentType : undefined}
        />
      </div>
    </div>
  );
}
