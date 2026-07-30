'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Compass, Shield, Flag, ArrowRight } from 'lucide-react';
import { FeedList } from '@/components/feed/feed-list';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth-store';
import type { PostSortType } from '@/lib/post-api';
import apiClient from '@/lib/api-client';

const adminContentTabs = [
  { id: 'all', label: '全部' },
  { id: 'latest', label: '最新' },
];

export default function ExplorePage() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const isAdmin = !!(mounted && user?.role && user.role !== 'USER');
  const [activeTab, setActiveTab] = useState('all');
  const [pendingReviews, setPendingReviews] = useState(0);
  const [pendingReports, setPendingReports] = useState(0);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([
      apiClient.get('/posts/reviews/queue?limit=100'),
      apiClient.get('/posts/reports/list?limit=100'),
    ]).then(([reviews, reports]) => {
      setPendingReviews((reviews.data?.data || []).filter((r: any) => r.status === 'FLAGGED').length);
      setPendingReports((reports.data?.data || []).filter((r: any) => r.status === 'PENDING').length);
    }).catch(() => {});
  }, [isAdmin]);

  // 管理员精简版
  if (isAdmin) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Compass className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">内容巡查</h1>
        </div>

        {/* 待处理统计 */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/admin/reviews" className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-4 hover:shadow-sm transition-shadow">
            <Shield className="h-5 w-5 text-amber-500" />
            <div className="flex-1">
              <p className="text-2xl font-bold text-amber-600">{pendingReviews}</p>
              <p className="text-xs text-muted-foreground">待审核内容</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link href="/admin/reports" className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 p-4 hover:shadow-sm transition-shadow">
            <Flag className="h-5 w-5 text-red-500" />
            <div className="flex-1">
              <p className="text-2xl font-bold text-red-600">{pendingReports}</p>
              <p className="text-xs text-muted-foreground">待处理举报</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>

        {/* 内容类型切换（精简版） */}
        <div className="flex gap-1">
          {adminContentTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 内容列表（以最新排序方便巡查） */}
        <FeedList
          key={`admin-${activeTab}`}
          showComposer={false}
          sort="latest"
          postType={undefined}
        />
      </div>
    );
  }

  // 普通用户完整版
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Compass className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">探索发现</h1>
      </div>

      <FeedList showComposer={false} sort="trending" />
    </div>
  );
}
