'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Users, ExternalLink, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { mockUsers } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { getRecommendedCommunities } from '@/lib/social-api';
import type { Community } from '@/types';

const hotTopics = [
  { tag: '黄山VR全景', count: 1520 },
  { tag: '故宫翻译', count: 980 },
  { tag: '张家界360', count: 890 },
  { tag: '桂林空间视频', count: 756 },
  { tag: '长城记录', count: 650 },
];

const suggestLinks = [
  { title: 'VR旅游攻略', url: '#' },
  { title: '拍摄技巧分享', url: '#' },
  { title: '设备推荐指南', url: '#' },
  { title: '徐霞客游记原文', url: '#' },
];

export function RightPanel() {
  const { rightPanelOpen } = useUIStore();
  const { isAuthenticated, user } = useAuthStore();
  const [recommendedUsers, setRecommendedUsers] = useState<RecommendedUser[]>([]);
  const [recommendedCommunities, setRecommendedCommunities] = useState<Community[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isAuthenticated) {
      getRecommendedUsers(1, 5).then((res) => {
        setRecommendedUsers(res.data || []);
      }).catch(() => {
        apiClient.get('/users/suggested/list').then((res) => {
          if (res.data?.success) setRecommendedUsers(res.data.data || []);
        }).catch(() => {});
      });
      getRecommendedCommunities(1, 5).then((res) => {
        setRecommendedCommunities(res.data || []);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  const handleFollow = async (userId: string) => {
    try {
      const isFollowing = followingIds.has(userId);
      if (isFollowing) {
        await apiClient.delete(`/users/${userId}/follow`);
        setFollowingIds((prev) => { const next = new Set(prev); next.delete(userId); return next; });
        toast.success('已取消关注');
      } else {
        await apiClient.post(`/users/${userId}/follow`);
        setFollowingIds((prev) => new Set(prev).add(userId));
        toast.success('关注成功');
      }
    } catch {
      toast.error('操作失败，请重试');
    }
  };

  return (
    <aside
      className={cn(
        'sticky top-14 hidden h-[calc(100vh-3.5rem)] w-72 flex-shrink-0 overflow-y-auto border-l bg-muted/50 p-4',
        'lg:block',
        !rightPanelOpen && 'hidden'
      )}
    >
      <div className="space-y-4">
        {/* 热门话题 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
              热门话题
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {hotTopics.map((topic) => (
                <Link
                  key={topic.tag}
                  href={`/search?q=${encodeURIComponent(topic.tag)}`}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <span className="text-foreground"># {topic.tag}</span>
                  <span className="text-xs text-muted-foreground">{topic.count}次浏览</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 推荐用户 */}
        {recommendedUsers.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-teal-500" />
                  推荐用户
                </span>
                <Link href="/discover" className="text-xs text-primary hover:underline font-normal">
                  更多
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendedUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-2 rounded-lg p-1 hover:bg-accent">
                    <Link href={`/profile/${u.username}`} className="flex items-center gap-2 min-w-0 flex-1">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={u.avatarUrl} alt={u.displayName} />
                        <AvatarFallback>{u.displayName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{u.displayName}</p>
                        <p className="truncate text-xs text-muted-foreground">{u.bio || `@${u.username}`}</p>
                      </div>
                    </Link>
                    <Button
                      variant={followingIds.has(u.id) ? 'secondary' : 'default'}
                      size="sm"
                      className="h-7 flex-shrink-0 text-xs"
                      onClick={() => handleFollow(u.id)}
                    >
                      {followingIds.has(u.id) ? '已关注' : '关注'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 推荐社群 */}
        {isAuthenticated && recommendedCommunities.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <MessageCircle className="h-4 w-4 text-orange-500" />
                推荐社群
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendedCommunities.map((community) => (
                  <Link
                    key={community.id}
                    href={`/communities/${community.id}`}
                    className="flex items-center gap-3 rounded-lg p-1 hover:bg-accent"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={community.avatarUrl || undefined} alt={community.name} />
                      <AvatarFallback>{community.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{community.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {community.memberCount} 成员
                      </p>
                      {community.tags && community.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {community.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="text-xs">
                              {tag.icon} {tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 推荐链接 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ExternalLink className="h-4 w-4 text-accent" />
              推荐链接
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {suggestLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.url}
                  className="block rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-primary"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 页脚 */}
        <div className="px-2 text-xs text-muted-foreground">
          <Separator className="mb-3" />
          <p>徐霞客系统 © 2026</p>
          <p className="mt-1">用VR记录旅程，让世界触手可及 🌍</p>
        </div>
      </div>
    </aside>
  );
}
