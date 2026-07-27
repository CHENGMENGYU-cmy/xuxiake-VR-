'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, MapPin, Heart, MessageCircle, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth-store';
import { getRecommendedCompanions, followUser, unfollowUser, getOrCreateDirectConversation } from '@/lib/social-api';
import { toast } from 'sonner';
import type { RecommendedUser } from '@/types';

export function CompanionsTab() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [companions, setCompanions] = useState<RecommendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [destination, setDestination] = useState('');
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const fetchCompanions = (dest?: string) => {
    if (!isAuthenticated) return;
    setLoading(true);
    getRecommendedCompanions(dest || undefined, 1, 20)
      .then((res) => {
        setCompanions(res.data || []);
        const map: Record<string, boolean> = {};
        res.data?.forEach((u: RecommendedUser) => { if (u.isFollowing) map[u.id] = true; });
        setFollowingMap(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCompanions();
  }, [isAuthenticated]);

  const handleFollow = async (userId: string) => {
    if (actionLoading[userId]) return;
    setActionLoading((prev) => ({ ...prev, [userId]: true }));
    const wasFollowing = followingMap[userId];
    setFollowingMap((prev) => ({ ...prev, [userId]: !wasFollowing }));
    try {
      if (wasFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
    } catch {
      setFollowingMap((prev) => ({ ...prev, [userId]: wasFollowing }));
      toast.error('操作失败');
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleMessage = async (userId: string) => {
    try {
      const conv = await getOrCreateDirectConversation(userId);
      router.push(`/messages/${conv.id}`);
    } catch {
      toast.error('无法创建对话');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">寻找旅行搭子</h2>
      </div>

      <p className="text-sm text-muted-foreground">
        基于你的旅行目的地、兴趣和行程，智能匹配同行伙伴。匹配度 ≥ 50% 才会推荐。
      </p>

      {/* 目的地搜索 */}
      <div className="flex gap-2">
        <Input
          placeholder="输入目的地筛选搭子..."
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="max-w-xs"
        />
        <Button variant="outline" size="sm" onClick={() => fetchCompanions(destination)}>
          筛选
        </Button>
      </div>

      {/* 搭子列表 */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : companions.length === 0 ? (
        <div className="py-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">
            {destination ? `暂无去过"${destination}"的搭子` : '暂无匹配的搭子，多分享旅行内容有助于匹配'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {companions.map((companion) => (
            <Card key={companion.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Link href={`/profile/${companion.username}`}>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={companion.avatarUrl} alt={companion.displayName} />
                      <AvatarFallback>{companion.displayName[0]}</AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link href={`/profile/${companion.username}`} className="font-semibold hover:underline truncate">
                        {companion.displayName}
                      </Link>
                      {companion.matchScore != null && (
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          {companion.matchScore}% 匹配
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">@{companion.username}</p>
                    {companion.bio && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{companion.bio}</p>
                    )}

                    {/* 匹配原因 */}
                    {companion.matchReasons && companion.matchReasons.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {companion.matchReasons.map((reason, i) => (
                          <span key={i} className="inline-flex items-center gap-1 rounded-full bg-primary/5 px-2 py-0.5 text-xs text-primary">
                            {reason.includes('共同') && <Heart className="h-3 w-3" />}
                            {reason.includes('同城') && <MapPin className="h-3 w-3" />}
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 共享目的地 */}
                    {'sharedDestinations' in companion && (companion as any).sharedDestinations?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(companion as any).sharedDestinations.map((dest: string, i: number) => (
                          <span key={i} className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-2 py-0.5 text-xs text-teal-600">
                            <MapPin className="h-3 w-3" />
                            {dest}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="mt-3 flex gap-2">
                  {followingMap[companion.id] ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleFollow(companion.id)}
                      disabled={actionLoading[companion.id]}
                    >
                      已关注
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleFollow(companion.id)}
                      disabled={actionLoading[companion.id]}
                    >
                      <Heart className="mr-1 h-3.5 w-3.5" />
                      关注
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMessage(companion.id)}
                    disabled={actionLoading[companion.id]}
                  >
                    <MessageCircle className="mr-1 h-3.5 w-3.5" />
                    打招呼
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
