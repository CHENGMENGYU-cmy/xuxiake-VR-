'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Compass, TrendingUp, Flame, Clock, Video, Map, BookOpen, Hash } from 'lucide-react';
import { FeedList } from '@/components/feed/feed-list';
import { getHotTopics } from '@/lib/post-api';
import type { PostSortType } from '@/lib/post-api';
import type { Topic } from '@/types';

type TabType = 'trending' | 'latest' | 'hot';

const tabSortMap: Record<TabType, PostSortType> = {
  trending: 'trending',
  latest: 'latest',
  hot: 'hot',
};

const contentTypeFilters = [
  { id: 'all', label: '全部', icon: Compass },
  { id: 'VR_MEDIA', label: 'VR内容', icon: Video },
  { id: 'ROUTE', label: '路线', icon: Map },
  { id: 'GUIDE', label: '攻略', icon: BookOpen },
];

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<TabType>('trending');
  const [contentType, setContentType] = useState('all');
  const [hotTopics, setHotTopics] = useState<Topic[]>([]);

  useEffect(() => {
    getHotTopics(8).then(setHotTopics).catch(() => {});
  }, []);

  const tabs = [
    { id: 'trending' as TabType, label: '热门', icon: TrendingUp },
    { id: 'latest' as TabType, label: '最新', icon: Clock },
    { id: 'hot' as TabType, label: '精选', icon: Flame },
  ];

  return (
    <div className="space-y-4">
      {/* 热门话题横向滚动 */}
      {hotTopics.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {hotTopics.map((topic) => (
            <Link
              key={topic.id}
              href={`/topics/${topic.id}`}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
            >
              <Hash className="h-3 w-3" />
              {topic.name}
              {topic.postCount > 0 && (
                <span className="text-[10px] opacity-60">{topic.postCount}</span>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* 排序切换 */}
      <div className="flex gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
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
                  ? 'bg-foreground text-background'
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
      <FeedList
        key={`${activeTab}-${contentType}`}
        showComposer={false}
        sort={tabSortMap[activeTab]}
        postType={contentType !== 'all' ? contentType : undefined}
      />
    </div>
  );
}
