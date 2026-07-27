'use client';

import { BookOpen, PenLine, Lock, Eye, Globe } from 'lucide-react';
import { HierarchyList } from '@/components/feed/hierarchy-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { AuthGuard } from '@/components/auth-guard';

export default function DiariesPage() {
  return (
    <AuthGuard>
      <DiariesContent />
    </AuthGuard>
  );
}

function DiariesContent() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-indigo-500" />
          <h1 className="text-xl font-bold">日记</h1>
        </div>
        <Link href="/upload">
          <Button size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-700">
            <PenLine className="h-4 w-4" />
            写日记
          </Button>
        </Link>
      </div>

      <p className="text-sm text-muted-foreground">
        内容加上部分感想情绪，带有个人色彩但未形成正式文章。这是属于你的私密空间。
      </p>

      {/* 私密提示 */}
      <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/30 px-3 py-2">
        <Lock className="h-4 w-4 text-indigo-500 shrink-0" />
        <p className="text-xs text-indigo-600 dark:text-indigo-400">
          日记默认为私密内容，仅自己可见。你可以选择发布到社区。
        </p>
      </div>

      {/* 日记列表 — 使用层级API，只看当前用户的DIARY级别内容 */}
      <HierarchyList
        level="DIARY"
        userId={user?.id}
        emptyText="还没有日记，点击「写日记」开始记录吧"
      />
    </div>
  );
}
