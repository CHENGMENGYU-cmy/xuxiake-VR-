'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth-store';
import { getUserCommunities } from '@/lib/social-api';
import { Search, Plus, Users, Crown, ChevronRight } from 'lucide-react';
import type { Community } from '@/types';

export function MyCommunities() {
  const { isAuthenticated, user } = useAuthStore();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Community[]>([]);
  const [searching, setSearching] = useState(false);
  const [joiningMap, setJoiningMap] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<'all' | 'created' | 'joined'>('all');

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    getUserCommunities()
      .then((data) => setCommunities(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, user]);

  // 搜索全站社群
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      searchCommunities(searchQuery.trim(), 1, 20)
        .then((res) => setSearchResults(res.data || []))
        .catch(() => {})
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleJoin = async (id: string) => {
    if (joiningMap[id]) return;
    setJoiningMap((prev) => ({ ...prev, [id]: true }));
    try {
      await joinCommunity(id);
      setSearchResults((prev) => prev.filter((c) => c.id !== id));
      toast.success('已加入社群');
      // 刷新我的社群列表
      getUserCommunities()
        .then((data) => setCommunities(data || []))
        .catch(() => {});
    } catch {
      toast.error('加入失败');
    } finally {
      setJoiningMap((prev) => ({ ...prev, [id]: false }));
    }
  };

  const filteredCommunities = communities.filter((c) => {
    // 搜索时也过滤我的社群
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchDesc = c.description?.toLowerCase().includes(q);
      const matchTag = c.tags?.some((t) => t.name.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchTag) return false;
    }
    // 类型过滤
    if (filter === 'created') return c.isCreator;
    if (filter === 'joined') return !c.isCreator;
    return true;
  });

  if (loading) {
    return <div className="py-16 text-center text-sm text-muted-foreground">加载中...</div>;
  }

  return (
    <>
      {/* 头部操作栏 */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索我的社群..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Link href="/communities/create">
          <Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> 创建社群</Button>
        </Link>
      </div>

      {/* 筛选标签 */}
      <div className="mb-4 flex gap-2">
        {[
          { key: 'all' as const, label: '全部' },
          { key: 'created' as const, label: '我创建的' },
          { key: 'joined' as const, label: '我加入的' },
        ].map((item) => (
          <Button
            key={item.key}
            variant={filter === item.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(item.key)}
          >
            {item.label}
            {item.key === 'all' && communities.length > 0 && (
              <span className="ml-1.5 text-xs opacity-70">({communities.length})</span>
            )}
          </Button>
        ))}
      </div>

      {/* 社群列表 */}
      {searchQuery ? (
        // 搜索模式：显示搜索结果
        <>
          {searching && (
            <div className="py-16 text-center text-sm text-muted-foreground">搜索中...</div>
          )}
          {!searching && searchResults.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">没有找到匹配的社群</p>
            </div>
          )}
          {!searching && searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((community) => {
                const isJoined = communities.some((c) => c.id === community.id);
                return (
                  <div
                    key={community.id}
                    className="group flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
                  >
                    <Link href={`/communities/${community.id}`} className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage src={community.avatarUrl || undefined} alt={community.name} />
                        <AvatarFallback className="text-lg">{community.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{community.name}</p>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> {community.memberCount} 成员
                          </span>
                        </div>
                        {community.tags && community.tags.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {community.tags.slice(0, 3).map((tag) => (
                              <span key={tag.id} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                    <Button
                      size="sm"
                      variant={isJoined ? 'secondary' : 'default'}
                      disabled={isJoined || !!joiningMap[community.id]}
                      onClick={() => handleJoin(community.id)}
                      className="shrink-0"
                    >
                      {isJoined ? (
                        <><Check className="mr-1 h-3.5 w-3.5" /> 已加入</>
                      ) : joiningMap[community.id] ? (
                        '加入中...'
                      ) : (
                        <><Plus className="mr-1 h-3.5 w-3.5" /> 加入</>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : filteredCommunities.length === 0 ? (
        // 非搜索模式：显示我的社群
        <div className="py-16 text-center">
          {communities.length === 0 ? (
            <>
              <Users className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">你还没有加入任何社群</p>
              <p className="mt-1 text-xs text-muted-foreground">去发现页探索感兴趣的社群吧</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">没有匹配的社群</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCommunities.map((community) => (
            <Link
              key={community.id}
              href={`/communities/${community.id}`}
              className="group flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
            >
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarImage src={community.avatarUrl || undefined} alt={community.name} />
                <AvatarFallback className="text-lg">{community.name[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{community.name}</p>
                  {community.isCreator && (
                    <Crown className="h-3.5 w-3.5 shrink-0 text-yellow-500" />
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {community.memberCount} 成员
                  </span>
                </div>
                {/* 标签预览 */}
                {community.tags && community.tags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {community.tags.slice(0, 3).map((tag) => (
                      <span key={tag.id} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {tag.name}
                      </span>
                    ))}
                    {community.tags.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">+{community.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
