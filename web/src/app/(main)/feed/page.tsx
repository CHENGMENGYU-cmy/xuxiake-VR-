'use client';

import { useState } from 'react';
import { Home, FileText, Video, Map, Compass, BookOpen, MessageSquare } from 'lucide-react';
import { FeedList } from '@/components/feed/feed-list';
import type { PostType } from '@/types';

type FilterTab = { id: string; label: string; icon: typeof FileText; postType?: PostType };

const filterTabs: FilterTab[] = [
  { id: 'all', label: '全部', icon: Home },
  { id: 'NOTE', label: '笔记', icon: FileText, postType: 'NOTE' },
  { id: 'VR_MEDIA', label: 'VR内容', icon: Video, postType: 'VR_MEDIA' },
  { id: 'ROUTE', label: '路线', icon: Map, postType: 'ROUTE' },
  { id: 'JOURNEY', label: '旅程', icon: Compass, postType: 'JOURNEY' },
  { id: 'GUIDE', label: '攻略', icon: BookOpen, postType: 'GUIDE' },
  { id: 'MOMENT', label: '动态', icon: MessageSquare, postType: 'MOMENT' },
];

export default function FeedPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  const currentFilter = filterTabs.find((t) => t.id === activeFilter);

  return (
    <div className="space-y-4">
      {/* 内容类型筛选 */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
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

      {/* 关注动态列表 */}
      <FeedList
        key={`following-${activeFilter}`}
        postType={currentFilter?.postType}
        followingOnly={true}
      />
    </div>
  );
}
