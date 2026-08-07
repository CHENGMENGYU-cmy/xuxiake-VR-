'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Globe, BookOpen, Clock, User, Loader2,
  Hash, TrendingUp, Search, X, Flame, ListFilter,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthGuard } from '@/components/auth-guard';
import { useSnapStore } from '@/stores/snap-store';
import { getHotTopics, searchTopics, getAllTopics } from '@/lib/post-api';
import type { Topic, MoodType, WeatherType } from '@/types';
import { MoodEmoji, WeatherEmoji, MoodLabel, WeatherLabel } from '@/types';
import { RecommendedUsers } from './recommended-users';
import { RecommendedCommunities } from './recommended-communities';
import { MyCommunities } from './my-communities';
import { CompanionsTab } from './companions-tab';

const HISTORY_KEY = 'xuxiake_topic_search_history';
const MAX_HISTORY = 8;
type SortMode = 'hot' | 'latest' | 'all';

export default function DiscoverPage() {
  return (
    <AuthGuard>
      <DiscoverContent />
    </AuthGuard>
  );
}

function DiscoverContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'topics' ? 'topics'
    : searchParams.get('tab') === 'social' ? 'social'
    : 'diary';
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="diary" className="gap-1.5">
            <Globe className="h-4 w-4" />
            日记广场
          </TabsTrigger>
          <TabsTrigger value="topics" className="gap-1.5">
            <Hash className="h-4 w-4" />
            话题
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-1.5">
            <UserPlus className="h-4 w-4" />
            找搭子
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diary" className="mt-4">
          <DiarySquareTab />
        </TabsContent>

        <TabsContent value="topics" className="mt-4">
          <TopicsTab />
        </TabsContent>

        <TabsContent value="social" className="mt-4">
          <SocialTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* =========================================================
 * 日记广场 Tab
 * ========================================================= */
function DiarySquareTab() {
  const router = useRouter();
  const {
    squareDiaries, squareLoading, squareHasMore,
    fetchSquareDiaries,
  } = useSnapStore();

  useEffect(() => {
    fetchSquareDiaries(true);
  }, []);

  const getStyleColor = (style: string) => {
    const map: Record<string, string> = {
      '温柔治愈风': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      '生活碎片风': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      '成长复盘风': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      '诗意散文风': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      '轻松口语风': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    };
    return map[style] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  };

  const getCoverImage = (diary: any) => {
    if (diary.mediaItems?.length > 0) {
      return diary.mediaItems[0].thumbnailUrl || diary.mediaItems[0].url;
    }
    try {
      const meta = typeof diary.vrMetadata === 'string' ? JSON.parse(diary.vrMetadata) : (diary.vrMetadata || {});
      if (meta?.coverImage) return meta.coverImage;
    } catch {}
    return null;
  };

  const getStyle = (diary: any) => {
    try {
      const meta = typeof diary.vrMetadata === 'string' ? JSON.parse(diary.vrMetadata) : (diary.vrMetadata || {});
      return meta?.style || '';
    } catch { return ''; }
  };

  const getInsight = (diary: any) => {
    try {
      const meta = typeof diary.vrMetadata === 'string' ? JSON.parse(diary.vrMetadata) : (diary.vrMetadata || {});
      return meta?.insight || '';
    } catch { return ''; }
  };

  const getMood = (diary: any) => {
    try {
      const meta = typeof diary.vrMetadata === 'string' ? JSON.parse(diary.vrMetadata) : (diary.vrMetadata || {});
      return (meta?.mood as string) || '';
    } catch { return ''; }
  };

  const getWeather = (diary: any) => {
    try {
      const meta = typeof diary.vrMetadata === 'string' ? JSON.parse(diary.vrMetadata) : (diary.vrMetadata || {});
      return (meta?.weather as string) || '';
    } catch { return ''; }
  };

  if (squareLoading && squareDiaries.length === 0) {
    return (
      <div className="py-16 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground mt-3">加载中...</p>
      </div>
    );
  }

  if (squareDiaries.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-16 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground mb-2">日记广场还没有内容</p>
          <p className="text-xs text-muted-foreground/60">成为第一个发布日记的人吧</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">浏览大家分享的日记，感受不同人的生活瞬间。</p>
        <Badge variant="secondary" className="text-xs">{squareDiaries.length} 篇日记</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {squareDiaries.map((diary: any) => {
          const coverImage = getCoverImage(diary);
          const style = getStyle(diary);
          const insight = getInsight(diary);
          const mood = getMood(diary);
          const weather = getWeather(diary);
          return (
            <Card
              key={diary.id}
              className="overflow-hidden hover:shadow-md transition-all group cursor-pointer"
              onClick={() => router.push(`/diaries/${diary.id}`)}
            >
              {coverImage && (
                <div className="aspect-[4/3] bg-muted overflow-hidden">
                  <img src={coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              )}
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-sm leading-tight line-clamp-1">{diary.title || '无标题'}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">{diary.content || '(无内容)'}</p>
                {insight && (
                  <p className="text-xs italic text-indigo-600/80 dark:text-indigo-400/80 border-l-2 border-indigo-300 pl-2">{insight}</p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  {style && <Badge className={`text-[10px] px-1.5 ${getStyleColor(style)}`}>{style}</Badge>}
                  {mood && <span className="text-[10px] text-muted-foreground">{MoodEmoji[mood as MoodType] ? `${MoodEmoji[mood as MoodType]} ` : ''}{MoodLabel[mood as MoodType] || mood}</span>}
                  {weather && <span className="text-[10px] text-muted-foreground">{WeatherEmoji[weather as WeatherType]} {WeatherLabel[weather as WeatherType]}</span>}
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    {diary.author && <><User className="h-3 w-3" /><span>{diary.author.displayName}</span></>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(diary.createdAt).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {squareHasMore && (
        <div className="text-center pt-2">
          <Button variant="outline" size="sm" onClick={() => fetchSquareDiaries()} disabled={squareLoading} className="gap-1.5">
            {squareLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            加载更多
          </Button>
        </div>
      )}
    </div>
  );
}

/* =========================================================
 * 话题 Tab
 * ========================================================= */
function TopicsTab() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('hot');

  useEffect(() => {
    setLoading(true);
    Promise.all([getHotTopics(50), getAllTopics().catch(() => [] as Topic[])])
      .then(([hot, all]) => { setTopics(hot); setAllTopics(all); })
      .catch(() => {})
      .finally(() => setLoading(false));
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    setSearching(true);
    const timer = setTimeout(() => {
      searchTopics(searchQuery)
        .then((results) => {
          setSearchResults(results);
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

  const getDisplayTopics = (): Topic[] => {
    if (searchQuery.trim()) return searchResults;
    switch (sortMode) {
      case 'hot': return topics;
      case 'latest': return [...allTopics].sort((a, b) => (b.postCount || 0) - (a.postCount || 0));
      case 'all': return allTopics;
    }
  };

  const displayTopics = getDisplayTopics();

  const sortTabs: { mode: SortMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'hot', label: '热门', icon: <Flame className="h-3.5 w-3.5" /> },
    { mode: 'latest', label: '活跃', icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { mode: 'all', label: '全部', icon: <ListFilter className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="搜索话题..."
          className="pl-10 pr-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!searchQuery.trim() && (
        <div className="flex gap-1.5 border-b pb-2">
          {sortTabs.map(({ mode, label, icon }) => (
            <Button key={mode} variant={sortMode === mode ? 'default' : 'ghost'} size="sm" className="gap-1.5" onClick={() => setSortMode(mode)}>
              {icon}{label}
            </Button>
          ))}
        </div>
      )}

      {!searchQuery.trim() && history.length > 0 && !loading && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">最近搜索</span>
            <button onClick={clearHistory} className="text-[11px] text-muted-foreground hover:text-foreground">清除</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((name) => (
              <button key={name} onClick={() => setSearchQuery(name)} className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground">
                <Clock className="h-3 w-3" />{name}
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
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">搜索中...</span>
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
                      <Badge variant="secondary" className="gap-0.5 text-[10px]"><Flame className="h-3 w-3" />热门</Badge>
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

/* =========================================================
 * 找搭子 Tab（复用已有组件）
 * ========================================================= */
function SocialTab() {
  return (
    <Tabs defaultValue="companions" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="companions">找搭子</TabsTrigger>
        <TabsTrigger value="users">推荐用户</TabsTrigger>
        <TabsTrigger value="communities">推荐社群</TabsTrigger>
        <TabsTrigger value="my-communities">我的社群</TabsTrigger>
      </TabsList>
      <TabsContent value="companions"><CompanionsTab /></TabsContent>
      <TabsContent value="users"><RecommendedUsers /></TabsContent>
      <TabsContent value="communities"><RecommendedCommunities /></TabsContent>
      <TabsContent value="my-communities"><MyCommunities /></TabsContent>
    </Tabs>
  );
}
