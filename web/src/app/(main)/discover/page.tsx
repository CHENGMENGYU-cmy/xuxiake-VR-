'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Compass, UserPlus, MessageCircle, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/auth-store';
import { getRecommendedUsers, getRecommendedCommunities, getUserCommunities } from '@/lib/social-api';
import type { RecommendedUser, Community } from '@/types';

export default function DiscoverPage() {
  const { isAuthenticated } = useAuthStore();
  const [recommendedUsers, setRecommendedUsers] = useState<RecommendedUser[]>([]);
  const [recommendedCommunities, setRecommendedCommunities] = useState<Community[]>([]);
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, communitiesRes, myCommunitiesRes] = await Promise.all([
          getRecommendedUsers(1, 10),
          getRecommendedCommunities(1, 10),
          getUserCommunities(),
        ]);

        setRecommendedUsers(usersRes.data || []);
        setRecommendedCommunities(communitiesRes.data || []);
        setMyCommunities(myCommunitiesRes || []);

        // 初始化关注状态
        const followMap: Record<string, boolean> = {};
        usersRes.data?.forEach((u) => {
          if (u.isFollowing) followMap[u.id] = true;
        });
        setFollowingMap(followMap);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleFollow = async (userId: string) => {
    // TODO: 实现关注功能
    setFollowingMap((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Compass className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">发现新朋友</h2>
            <p className="mb-4 text-muted-foreground">登录后查看智能推荐</p>
            <Link href="/login">
              <Button>立即登录</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">发现</h1>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            推荐用户
          </TabsTrigger>
          <TabsTrigger value="communities" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            推荐社群
          </TabsTrigger>
          <TabsTrigger value="my-communities" className="flex items-center gap-2">
            <Compass className="h-4 w-4" />
            我的社群
          </TabsTrigger>
        </TabsList>

        {/* 推荐用户 */}
        <TabsContent value="users" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {recommendedUsers.length === 0 ? (
              <Card className="col-span-2">
                <CardContent className="pt-6 text-center text-muted-foreground">
                  暂无推荐用户，完善个人资料和兴趣标签可获得更精准的推荐
                </CardContent>
              </Card>
            ) : (
              recommendedUsers.map((user) => (
                <Card key={user.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Link href={`/profile/${user.username}`}>
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName} />
                          <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link href={`/profile/${user.username}`} className="font-semibold hover:underline">
                              {user.displayName}
                            </Link>
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                          </div>
                          <Button
                            size="sm"
                            variant={followingMap[user.id] ? 'outline' : 'default'}
                            onClick={() => handleFollow(user.id)}
                          >
                            {followingMap[user.id] ? '已关注' : '关注'}
                          </Button>
                        </div>
                        {user.bio && (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{user.bio}</p>
                        )}
                        {/* 匹配原因 */}
                        {user.matchReasons && user.matchReasons.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {user.matchReasons.map((reason, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {reason}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {/* 兴趣标签 */}
                        {user.interests && user.interests.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {user.interests.slice(0, 4).map((tag) => (
                              <Badge key={tag.id} variant="outline" className="text-xs">
                                {tag.icon} {tag.name}
                              </Badge>
                            ))}
                            {user.interests.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{user.interests.length - 4}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* 推荐社群 */}
        <TabsContent value="communities" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {recommendedCommunities.length === 0 ? (
              <Card className="col-span-2">
                <CardContent className="pt-6 text-center text-muted-foreground">
                  暂无推荐社群，完善兴趣标签可获得更精准的推荐
                </CardContent>
              </Card>
            ) : (
              recommendedCommunities.map((community) => (
                <Card key={community.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={community.avatarUrl || undefined} alt={community.name} />
                        <AvatarFallback>{community.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <Link href={`/communities/${community.id}`} className="font-semibold hover:underline">
                          {community.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {community.memberCount} / {community.maxMembers} 成员
                        </p>
                        {community.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {community.description}
                          </p>
                        )}
                        {/* 标签 */}
                        {community.tags && community.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {community.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag.id} variant="secondary" className="text-xs">
                                {tag.icon} {tag.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* 我的社群 */}
        <TabsContent value="my-communities" className="mt-6">
          <div className="mb-4 flex justify-end">
            <Link href="/communities/create">
              <Button>
                <MessageCircle className="mr-2 h-4 w-4" />
                创建社群
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {myCommunities.length === 0 ? (
              <Card className="col-span-2">
                <CardContent className="pt-6 text-center text-muted-foreground">
                  你还没有加入任何社群
                </CardContent>
              </Card>
            ) : (
              myCommunities.map((community) => (
                <Link key={community.id} href={`/communities/${community.id}`}>
                  <Card className="overflow-hidden transition-colors hover:bg-accent">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={community.avatarUrl || undefined} alt={community.name} />
                          <AvatarFallback>{community.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{community.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {community.memberCount} 成员
                            {community.isCreator && ' · 创建者'}
                          </p>
                          {community.tags && community.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {community.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag.id} variant="secondary" className="text-xs">
                                  {tag.icon} {tag.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
