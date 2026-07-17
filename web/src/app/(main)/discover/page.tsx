'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/auth-store';
import {
  getRecommendedUsers,
  getRecommendedCommunities,
  getUserCommunities,
  followUser,
  unfollowUser,
} from '@/lib/social-api';
import { toast } from 'sonner';
import type { RecommendedUser, Community } from '@/types';

export default function DiscoverPage() {
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [recommendedUsers, setRecommendedUsers] = useState<RecommendedUser[]>([]);
  const [recommendedCommunities, setRecommendedCommunities] = useState<Community[]>([]);
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, communitiesRes, myCommunitiesRes] = await Promise.all([
          getRecommendedUsers(1, 20),
          getRecommendedCommunities(1, 10),
          getUserCommunities(),
        ]);

        setRecommendedUsers(usersRes.data || []);
        setRecommendedCommunities(communitiesRes.data || []);
        setMyCommunities(myCommunitiesRes || []);

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
    if (followLoading[userId]) return;
    setFollowLoading((prev) => ({ ...prev, [userId]: true }));

    const wasFollowing = followingMap[userId];
    setFollowingMap((prev) => ({ ...prev, [userId]: !wasFollowing }));

    try {
      if (wasFollowing) {
        await unfollowUser(userId);
        toast.success('已取消关注');
      } else {
        await followUser(userId);
        toast.success('关注成功');
      }
    } catch {
      setFollowingMap((prev) => ({ ...prev, [userId]: wasFollowing }));
      toast.error('操作失败，请重试');
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  if (!mounted) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-lg font-medium">发现新朋友</h2>
          <p className="mb-4 text-sm text-muted-foreground">登录后查看智能推荐</p>
          <Link href="/login">
            <Button>立即登录</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-3">
          <TabsTrigger value="users">推荐用户</TabsTrigger>
          <TabsTrigger value="communities">推荐社群</TabsTrigger>
          <TabsTrigger value="my-communities">我的社群</TabsTrigger>
        </TabsList>

        {/* 推荐用户 */}
        <TabsContent value="users">
          {recommendedUsers.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              暂无推荐用户，完善个人资料和兴趣标签可获得更精准的推荐
            </div>
          ) : (
            <div className="divide-y rounded-lg border bg-card">
              {recommendedUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  isFollowing={!!followingMap[user.id]}
                  isLoading={!!followLoading[user.id]}
                  onFollow={() => handleFollow(user.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* 推荐社群 */}
        <TabsContent value="communities">
          {recommendedCommunities.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              暂无推荐社群，完善兴趣标签可获得更精准的推荐
            </div>
          ) : (
            <div className="divide-y rounded-lg border bg-card">
              {recommendedCommunities.map((community) => (
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
                  <Link href={`/communities/${community.id}`}>
                    <Button size="sm" variant="outline">加入</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 我的社群 */}
        <TabsContent value="my-communities">
          <div className="mb-4 flex justify-end">
            <Link href="/communities/create">
              <Button size="sm">创建社群</Button>
            </Link>
          </div>
          {myCommunities.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              你还没有加入任何社群
            </div>
          ) : (
            <div className="divide-y rounded-lg border bg-card">
              {myCommunities.map((community) => (
                <Link key={community.id} href={`/communities/${community.id}`} className="flex items-center gap-3 p-4 hover:bg-accent">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ===== 用户推荐卡片 =====

function UserCard({
  user,
  isFollowing,
  isLoading,
  onFollow,
}: {
  user: RecommendedUser;
  isFollowing: boolean;
  isLoading: boolean;
  onFollow: () => void;
}) {
  return (
    <div className="flex items-start gap-3 p-4">
      <Link href={`/profile/${user.username}`}>
        <Avatar className="h-11 w-11">
          <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName} />
          <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
        </Avatar>
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <Link href={`/profile/${user.username}`} className="text-sm font-medium hover:underline">
              {user.displayName}
            </Link>
            {user.bio && (
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{user.bio}</p>
            )}
          </div>
          <Button
            size="sm"
            variant={isFollowing ? 'outline' : 'default'}
            onClick={onFollow}
            disabled={isLoading}
            className="ml-3 shrink-0"
          >
            {isFollowing ? '已关注' : '关注'}
          </Button>
        </div>

        {/* 匹配原因 + 兴趣标签，一行展示 */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          {user.matchReasons?.map((reason, i) => (
            <span key={i} className="rounded bg-secondary px-1.5 py-0.5">{reason}</span>
          ))}
          {user.interests?.slice(0, 3).map((tag) => (
            <span key={tag.id} className="rounded bg-secondary px-1.5 py-0.5">{tag.icon} {tag.name}</span>
          ))}
          {(user.interests?.length || 0) > 3 && (
            <span className="text-xs">+{user.interests!.length - 3}</span>
          )}
        </div>

        {/* 创作数据 */}
        {user.postCount !== undefined && user.postCount > 0 && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            {user.postCount} 篇内容 · {user.totalLikes} 获赞
            {user.vrDeviceInfo && ` · ${user.vrDeviceInfo.model}`}
          </p>
        )}

        {/* 代表帖子缩略图 */}
        {user.representativePosts && user.representativePosts.length > 0 && (
          <div className="mt-2 flex gap-1.5">
            {user.representativePosts.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="block h-16 w-24 overflow-hidden rounded bg-muted"
              >
                {post.thumbnailUrl ? (
                  <img src={post.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-1 text-center text-[10px] text-muted-foreground">
                    {post.content?.slice(0, 20) || '无预览'}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* 共同好友 */}
        {user.mutualFriends && user.mutualFriends.count > 0 && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            {user.mutualFriends.names.join('、')}
            {user.mutualFriends.count > 2 && `等${user.mutualFriends.count}位共同关注`}
          </p>
        )}
      </div>
    </div>
  );
}
