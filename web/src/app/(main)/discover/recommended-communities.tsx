'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { getRecommendedCommunities, joinCommunity } from '@/lib/social-api';
import { toast } from 'sonner';
import type { Community } from '@/types';

export function RecommendedCommunities() {
  const { isAuthenticated } = useAuthStore();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningMap, setJoiningMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isAuthenticated) return;
    getRecommendedCommunities(1, 20)
      .then((res) => setCommunities(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleJoin = async (id: string) => {
    if (joiningMap[id]) return;
    setJoiningMap((prev) => ({ ...prev, [id]: true }));
    try {
      await joinCommunity(id);
      setCommunities((prev) => prev.filter((c) => c.id !== id));
      toast.success('已加入社群');
    } catch {
      toast.error('加入失败');
    } finally {
      setJoiningMap((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-sm text-muted-foreground">加载中...</div>;
  }

  if (communities.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        暂无推荐社群，完善兴趣标签可获得更精准的推荐
      </div>
    );
  }

  return (
    <div className="divide-y rounded-lg border bg-card">
      {communities.map((community) => (
        <div key={community.id} className="flex items-center gap-3 p-4">
          <Avatar className="h-11 w-11">
            <AvatarImage src={community.avatarUrl || undefined} alt={community.name} />
            <AvatarFallback>{community.name[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <Link href={`/communities/${community.id}`} className="text-sm font-medium hover:underline">
              {community.name}
            </Link>
            <p className="text-xs text-muted-foreground">
              {community.memberCount}/{community.maxMembers} 成员
              {community.description && ` · ${community.description}`}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleJoin(community.id)}
            disabled={!!joiningMap[community.id]}
          >
            加入
          </Button>
        </div>
      ))}
    </div>
  );
}
