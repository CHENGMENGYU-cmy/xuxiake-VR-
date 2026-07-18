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
  const { isAuthenticated } = useAuthStore();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'created' | 'joined'>('all');

  useEffect(() => {
    if (!isAuthenticated) return;
    getUserCommunities()
      .then((data) => setCommunities(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const filteredCommunities = communities.filter((c) => {
    // 搜索过滤
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
      {filteredCommunities.length === 0 ? (
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
