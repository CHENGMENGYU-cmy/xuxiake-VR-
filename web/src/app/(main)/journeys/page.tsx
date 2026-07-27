'use client';

import { useState } from 'react';
import { BookOpen, PenLine, Lock, Globe } from 'lucide-react';
import { HierarchyList } from '@/components/feed/hierarchy-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { AuthGuard } from '@/components/auth-guard';

type StatusTab = 'public' | 'private';

const statusTabs: { id: StatusTab; label: string; icon: typeof Globe }[] = [
  { id: 'public', label: '已发布', icon: Globe },
  { id: 'private', label: '我的（私密）', icon: Lock },
];

export default function JourneysPage() {
  return (
    <AuthGuard>
      <JourneysContent />
    </AuthGuard>
  );
}

function JourneysContent() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<StatusTab>('public');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">游记散文</h1>
        </div>
        <Link href="/upload/journey-creator">
          <Button size="sm" className="gap-1.5">
            <PenLine className="h-4 w-4" />
            写游记
          </Button>
        </Link>
      </div>

      <p className="text-sm text-muted-foreground">
        基于瞬间捕获和日记，生成有个人情感的正式游记文章。
      </p>

      {/* 状态切换 */}
      <div className="flex gap-1 border-b">
        {statusTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
                isActive
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

      {/* 已发布 — 展示全站公开的ESSAY级别内容 */}
      {activeTab === 'public' && (
        <HierarchyList
          level="ESSAY"
          detailBasePath="/journeys"
          emptyText="还没有公开的游记"
        />
      )}

      {/* 我的（私密）— 只看当前用户的ESSAY级别私密内容 */}
      {activeTab === 'private' && (
        <HierarchyList
          key="private-essay"
          level="ESSAY"
          userId={user?.id}
          detailBasePath="/journeys"
          emptyText="没有私密游记，已发布的游记会显示在「已发布」标签中"
        />
      )}
    </div>
  );
}
