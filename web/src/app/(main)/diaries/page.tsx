'use client';

import { useState } from 'react';
import { BookOpen, Clock, PenLine } from 'lucide-react';
import { FeedList } from '@/components/feed/feed-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DiariesPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-indigo-500" />
          <h1 className="text-xl font-bold">日记</h1>
        </div>
        <Link href="/upload">
          <Button size="sm" className="gap-1.5">
            <PenLine className="h-4 w-4" />
            写日记
          </Button>
        </Link>
      </div>

      <p className="text-sm text-muted-foreground">
        内容加上部分感想情绪，带有个人色彩但未形成正式文章。这是属于你的私密空间。
      </p>

      <FeedList postType="MOMENT" followingOnly={false} />
    </div>
  );
}
