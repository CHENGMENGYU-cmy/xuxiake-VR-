'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Globe, Lock, Plus, Search, Users, MapPin, Loader2 } from 'lucide-react';
import { AuthGuard } from '@/components/auth-guard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { listCommunities, searchCommunities } from '@/lib/social-api';
import type { Community } from '@/types';
import { toast } from 'sonner';

export default function CommunitiesPage() {
  return (
    <AuthGuard>
      <CommunitiesContent />
    </AuthGuard>
  );
}

function CommunitiesContent() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async (q = '') => {
    setLoading(true);
    try {
      const res = q.trim()
        ? await searchCommunities(q.trim(), 1, 30)
        : await listCommunities({ page: 1, limit: 30 });
      setCommunities(res.data || []);
    } catch {
      toast.error('社群加载失败');
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    loadCommunities(keyword);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">社群</h1>
          <p className="mt-1 text-sm text-muted-foreground">发现旅行、户外、美食和 VR 创作社群。</p>
        </div>
        <Link href="/communities/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            创建社群
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索社群名称、地点或分类..."
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="outline">搜索</Button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>加载社群中...</span>
        </div>
      ) : communities.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Users className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">没有找到匹配的社群</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {communities.map((community) => (
            <Link key={community.id} href={`/communities/${community.id}`}>
              <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
                {community.coverUrl && (
                  <div className="aspect-[16/7] bg-muted">
                    <img src={community.coverUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                )}
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 border bg-background">
                      <AvatarImage src={community.avatarUrl || undefined} alt={community.name} />
                      <AvatarFallback>{community.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="truncate font-semibold">{community.name}</h2>
                        <Badge variant={community.isPublic ? 'secondary' : 'outline'} className="gap-1 text-[10px]">
                          {community.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                          {community.isPublic ? '公开' : '私密'}
                        </Badge>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {community.memberCount}/{community.maxMembers} 成员
                        </span>
                        {community.locationName && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {community.locationName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {community.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{community.description}</p>
                  )}
                  {community.tags && community.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {community.tags.slice(0, 4).map((tag) => (
                        <Badge key={tag.id} variant="outline" className="text-[10px]">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
