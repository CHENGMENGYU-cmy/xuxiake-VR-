'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Hash, TrendingUp, Search, X, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getHotTopics, searchTopics } from '@/lib/post-api';
import type { Topic } from '@/types';

const HISTORY_KEY = 'xuxiake_topic_search_history';
const MAX_HISTORY = 8;

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    getHotTopics(50)
      .then(setTopics)
      .catch(() => {})
      .finally(() => setLoading(false));
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      searchTopics(searchQuery)
        .then((results) => {
          setSearchResults(results);
          // 搜索成功后保存历史
          if (results.length > 0) {
            setHistory((prev) => {
              const next = [searchQuery.trim(), ...prev.filter((t) => t !== searchQuery.trim())].slice(0, MAX_HISTORY);
              try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch {}
              return next;
            });
          }
        })
        .catch(() => {})
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const clearHistory = () => {
    setHistory([]);
    try { localStorage.removeItem(HISTORY_KEY); } catch {}
  };

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
          className="pl-10 pr-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 搜索历史 */}
      {!searchQuery.trim() && history.length > 0 && !loading && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">最近搜索</span>
            <button onClick={clearHistory} className="text-[11px] text-muted-foreground hover:text-foreground">
              清除
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((name) => (
              <button
                key={name}
                onClick={() => setSearchQuery(name)}
                className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
              >
                <Clock className="h-3 w-3" />
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : searching ? (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">搜索中...</span>
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
