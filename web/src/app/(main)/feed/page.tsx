'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, FileText, Video, Compass, MessageSquare, Sparkles, Users } from 'lucide-react';
import { FeedList } from '@/components/feed/feed-list';
import { useAuthStore } from '@/stores/auth-store';
import type { PostType } from '@/types';

type FilterTab = { id: string; label: string; icon: typeof FileText; postType?: PostType };

const filterTabs: FilterTab[] = [
  { id: 'all', label: '全部', icon: Home },
  { id: 'VR_MEDIA', label: '第一视角', icon: Video, postType: 'VR_MEDIA' },
  { id: 'NOTE', label: '随记', icon: FileText, postType: 'NOTE' },
  { id: 'JOURNEY', label: '游记', icon: Compass, postType: 'JOURNEY' },
  { id: 'MOMENT', label: '瞬间', icon: MessageSquare, postType: 'MOMENT' },
];

export default function FeedPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [activeFilter, setActiveFilter] = useState('all');
  const [feedMode, setFeedMode] = useState<'discover' | 'following'>('discover');

  // 管理员/审核员重定向到管理仪表板
  useEffect(() => {
    if (isAuthenticated && user?.role !== 'USER') {
      router.replace('/admin/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const currentFilter = filterTabs.find((t) => t.id === activeFilter);

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

      {/* 内容流 */}
      <FeedList
        key={feedMode}
        followingOnly={feedMode === 'following'}
      />
    </div>
  );
}
