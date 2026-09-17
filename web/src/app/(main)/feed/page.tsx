'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, FileText, Compass, Sparkles, Users } from 'lucide-react';
import { FeedList } from '@/components/feed/feed-list';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import { PUBLIC_POST_CATEGORIES, getPublicPostCategory, type PublicPostCategoryId } from '@/lib/post-category';

const filterIcons: Record<PublicPostCategoryId, typeof FileText> = {
  all: Home,
  diary: FileText,
  travelogue: Compass,
};

export default function FeedPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [activeFilter, setActiveFilter] = useState<PublicPostCategoryId>('all');
  const [feedMode, setFeedMode] = useState<'discover' | 'following'>('discover');

  // 管理员/审核员重定向到管理仪表板
  useEffect(() => {
    if (isAuthenticated && user?.role !== 'USER') {
      router.replace('/admin/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const currentFilter = getPublicPostCategory(activeFilter);

  return (
    <div className="space-y-4">
      {/* 发现/关注切换 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFeedMode('discover')}
          className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            feedMode === 'discover'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          推荐
        </button>
        <button
          onClick={() => setFeedMode('following')}
          className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            feedMode === 'following'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          关注
        </button>
      </div>

      {/* 内容类型筛选 */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {PUBLIC_POST_CATEGORIES.map((tab) => {
          const Icon = filterIcons[tab.id];
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={cn(
                'flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 内容流 */}
      <FeedList
        key={`${feedMode}-${activeFilter}`}
        showComposer={false}
        followingOnly={feedMode === 'following'}
        contentLevel={currentFilter.query.contentLevel}
        postType={currentFilter.query.postType}
        postTypes={currentFilter.query.postTypes}
        excludeContentLevels={currentFilter.query.excludeContentLevels}
      />
    </div>
  );
}
