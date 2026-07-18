'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { getRecommendedCommunities, joinCommunity, submitCommunityFeedback } from '@/lib/social-api';
import { toast } from 'sonner';
import type { RecommendedCommunity } from '@/types';

export function RecommendedCommunities() {
  const { isAuthenticated } = useAuthStore();
  const [communities, setCommunities] = useState<RecommendedCommunity[]>([]);
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

  const handleNotInterested = async (id: string) => {
    try {
      await submitCommunityFeedback(id, 'NOT_INTERESTED');
      setCommunities((prev) => prev.filter((c) => c.id !== id));
      toast.success('已减少此类推荐');
    } catch {
      toast.error('操作失败');
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
        <div key={community.id} className="flex items-start gap-3 p-4">
          <Link href={`/communities/${community.id}`}>
            <Avatar className="h-11 w-11">
              <AvatarImage src={community.avatarUrl || undefined} alt={community.name} />
              <AvatarFallback>{community.name[0]}</AvatarFallback>
            </Avatar>
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <Link href={`/communities/${community.id}`} className="text-sm font-medium hover:underline">
                  {community.name}
                </Link>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {community.memberCount}/{community.maxMembers} 成员
                  {community.description && ` · ${community.description}`}
                </p>
              </div>
              <div className="ml-3 flex shrink-0 gap-1.5">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-muted-foreground"
                  onClick={() => handleNotInterested(community.id)}
                >
                  不感兴趣
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleJoin(community.id)}
                  disabled={!!joiningMap[community.id]}
                >
                  加入
                </Button>
              </div>
            </div>

            {/* 推荐理由 */}
            {community.matchReasons && community.matchReasons.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                {community.matchReasons.map((reason, i) => (
                  <span key={i} className="rounded bg-secondary px-1.5 py-0.5">{reason.text}</span>
                ))}
              </div>
            )}

            {/* 好友在这里 */}
            {community.friendsInCommunity && community.friendsInCommunity.length > 0 && (
              <div className="mt-2 flex items-center gap-1.5">
                <div className="flex -space-x-1.5">
                  {community.friendsInCommunity.slice(0, 3).map((friend) => (
                    <Avatar key={friend.id} className="h-5 w-5 border-2 border-background">
                      <AvatarImage src={friend.avatarUrl || undefined} alt={friend.displayName} />
                      <AvatarFallback className="text-[8px]">{friend.displayName[0]}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {community.friendsInCommunity.length <= 2
                    ? `${community.friendsInCommunity.map((f) => f.displayName).join('、')}在这里`
                    : `${community.friendsInCommunity[0].displayName}等${community.friendsInCommunity.length}位好友在这里`}
                </p>
              </div>
            )}

            {/* 社区标签 */}
            {community.tags && community.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {community.tags.slice(0, 5).map((tag) => (
                  <span key={tag.id} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {tag.name}
                  </span>
                ))}
                {community.tags.length > 5 && (
                  <span className="text-[10px] text-muted-foreground">+{community.tags.length - 5}</span>
                )}
              </div>
            )}

            {/* 近期动态 */}
            {community.recentPostCount !== undefined && community.recentPostCount > 0 && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                近7天有 {community.recentPostCount} 条新动态
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
