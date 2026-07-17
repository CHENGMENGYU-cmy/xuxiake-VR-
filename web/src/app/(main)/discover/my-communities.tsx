'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { getUserCommunities } from '@/lib/social-api';
import type { Community } from '@/types';

export function MyCommunities() {
  const { isAuthenticated } = useAuthStore();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    getUserCommunities()
      .then((data) => setCommunities(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (loading) {
    return <div className="py-16 text-center text-sm text-muted-foreground">加载中...</div>;
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Link href="/communities/create">
          <Button size="sm">创建社群</Button>
        </Link>
      </div>
      {communities.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          你还没有加入任何社群
        </div>
      ) : (
        <div className="divide-y rounded-lg border bg-card">
          {communities.map((community) => (
            <Link
              key={community.id}
              href={`/communities/${community.id}`}
              className="flex items-center gap-3 p-4 hover:bg-accent"
            >
              <Avatar className="h-11 w-11">
                <AvatarImage src={community.avatarUrl || undefined} alt={community.name} />
                <AvatarFallback>{community.name[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{community.name}</p>
                <p className="text-xs text-muted-foreground">
                  {community.memberCount} 成员
                  {community.isCreator && ' · 创建者'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
