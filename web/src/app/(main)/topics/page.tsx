'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Hash, TrendingUp, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getHotTopics, searchTopics } from '@/lib/post-api';
import type { Topic } from '@/types';

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHotTopics(50)
      .then(setTopics)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      searchTopics(searchQuery).then(setSearchResults).catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const displayTopics = searchQuery.trim() ? searchResults : topics;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Hash className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">话题广场</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="搜索话题..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : displayTopics.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {displayTopics.map((topic) => (
            <Link key={topic.id} href={`/topics/${topic.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 flex-shrink-0 text-primary" />
                    <p className="truncate font-medium">{topic.name}</p>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{topic.postCount} 篇内容</span>
                    {topic.isHot && (
                      <Badge variant="secondary" className="gap-0.5 text-[10px]">
                        <TrendingUp className="h-3 w-3" />
                        热门
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-muted-foreground">
          <Hash className="mx-auto h-12 w-12 opacity-30" />
          <p className="mt-4">{searchQuery ? '没有找到相关话题' : '暂无话题'}</p>
        </div>
      )}
    </div>
  );
}
