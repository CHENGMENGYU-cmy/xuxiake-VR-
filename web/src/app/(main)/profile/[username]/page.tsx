'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Link2, Calendar, Users, UserPlus, Settings, UserCheck, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { PostCard } from '@/components/post/post-card';
import { useAuthStore } from '@/stores/auth-store';
import { usePostStore } from '@/stores/post-store';
import apiClient from '@/lib/api-client';
import { followUser, unfollowUser, getFollowers, getFollowing } from '@/lib/social-api';
import { toast } from 'sonner';
import type { User, Post } from '@/types';

export default function ProfilePage() {
  const params = useParams();
  const username = params?.username as string || '';

  return <ProfileContent username={username} />;
}

function ProfileContent({ username }: { username: string }) {
  const { user: currentUser } = useAuthStore();
  const { posts: storePosts, fetchPosts } = usePostStore();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (currentUser && currentUser.username === username) {
      setProfileUser(currentUser);
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await apiClient.get(`/users/${username}`);
        if (res.data.success) {
          setProfileUser(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [username, currentUser]);

  // 获取关注状态和粉丝/关注数
  useEffect(() => {
    const fetchFollowData = async () => {
      try {
        const [followersRes, followingRes] = await Promise.all([
          getFollowers(username),
          getFollowing(username),
        ]);
        setFollowerCount(followersRes.total || 0);
        setFollowingCount(followingRes.total || 0);

        if (currentUser) {
          const isFollowingUser = followersRes.data?.some((u) => u.id === currentUser.id);
          setIsFollowing(!!isFollowingUser);
        }
      } catch (err) {
        console.error('Failed to fetch follow data:', err);
      }
    };

    fetchFollowData();
  }, [username, currentUser]);

  // 获取用户的帖子
  useEffect(() => {
    if (profileUser) {
      const safePosts = storePosts ?? [];
      if (currentUser && currentUser.id === profileUser.id) {
        if (safePosts.length === 0) {
          fetchPosts();
        }
        setUserPosts(safePosts.filter((p) => p.author.id === profileUser.id));
      } else {
        setUserPosts(safePosts.filter((p) => p.author.id === profileUser.id));
      }
    }
  }, [profileUser, storePosts, currentUser, fetchPosts]);

  const handleFollow = async () => {
    if (!profileUser || followLoading) return;
    setFollowLoading(true);
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setFollowerCount((prev) => wasFollowing ? Math.max(0, prev - 1) : prev + 1);

    try {
      if (wasFollowing) {
        await unfollowUser(profileUser.id);
        toast.success('已取消关注');
      } else {
        await followUser(profileUser.id);
        toast.success('关注成功');
      }
    } catch {
      setIsFollowing(wasFollowing);
      setFollowerCount((prev) => wasFollowing ? prev + 1 : Math.max(0, prev - 1));
      toast.error('操作失败，请重试');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">加载中...</div>
    );
  }

  if (!profileUser) {
    notFound();
  }

  const user = profileUser;
  const isOwnProfile = currentUser?.username === username;

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-brand sm:h-48" />

        <CardContent className="relative px-4 pb-4 pt-0">
          <div className="-mt-12 mb-3 flex items-end justify-between sm:-mt-16">
            <Avatar className="h-20 w-20 border-4 border-white sm:h-28 sm:w-28">
              <AvatarImage src={user.avatarUrl} alt={user.displayName} />
              <AvatarFallback className="text-2xl">{user.displayName[0]}</AvatarFallback>
            </Avatar>

            <div className="flex gap-2">
              {isOwnProfile ? (
                <Link href="/settings">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Settings className="h-4 w-4" />
                    编辑资料
                  </Button>
                </Link>
              ) : (
                <Button
                  size="sm"
                  variant={isFollowing ? 'outline' : 'default'}
                  className="gap-1.5"
                  onClick={handleFollow}
                  disabled={followLoading}
                >
                  {followLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isFollowing ? (
                    <UserCheck className="h-4 w-4" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  {isFollowing ? '已关注' : '关注'}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{user.displayName}</h1>
              {user.vrDeviceInfo && (
                <Badge variant="secondary" className="text-xs">
                  {user.vrDeviceInfo.model}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            {user.bio && <p className="text-sm text-foreground">{user.bio}</p>}

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-muted-foreground">
              {user.website && (
                <span className="flex items-center gap-1">
                  <Link2 className="h-3 w-3" />
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {user.website}
                  </a>
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                加入于 {new Date(user.createdAt).toLocaleDateString('zh-CN')}
              </span>
            </div>

            <div className="flex gap-4 pt-2 text-sm">
              <span><strong>{userPosts.length}</strong> <span className="text-muted-foreground">内容</span></span>
              <span><strong>{followerCount}</strong> <span className="text-muted-foreground">粉丝</span></span>
              <span><strong>{followingCount}</strong> <span className="text-muted-foreground">关注</span></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 内容标签页 */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full justify-start border-b bg-transparent p-0">
          <TabsTrigger value="posts" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-primary">
            发布内容
          </TabsTrigger>
          <TabsTrigger value="media" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-primary">
            媒体库
          </TabsTrigger>
          <TabsTrigger value="likes" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-primary">
            赞过的
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-4 space-y-4">
          {userPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {userPosts.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">还没有发布任何内容</div>
          )}
        </TabsContent>

        <TabsContent value="media" className="mt-4">
          <div className="py-12 text-center text-muted-foreground">媒体库功能即将上线</div>
        </TabsContent>

        <TabsContent value="likes" className="mt-4">
          <div className="py-12 text-center text-muted-foreground">赞过的内容即将上线</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
