'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Link2, Calendar, Users, UserPlus, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { PostCard } from '@/components/post/post-card';
import { mockUsers } from '@/lib/mock-data';
import { useAuthStore } from '@/stores/auth-store';
import { usePostStore } from '@/stores/post-store';
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

  useEffect(() => {
    // If current user's own profile, always use store data (most up-to-date)
    if (currentUser && currentUser.username === username) {
      setProfileUser(currentUser);
      setLoading(false);
      return;
    }

    // Otherwise, try to find in mock data
    const mockUser = mockUsers.find((u) => u.username === username);
    if (mockUser) {
      setProfileUser(mockUser);
      setLoading(false);
      return;
    }

    setLoading(false);
  }, [username, currentUser]);

  // 获取用户的帖子
  useEffect(() => {
    if (profileUser) {
      const safePosts = storePosts ?? [];
      // 如果是当前用户，从store获取帖子
      if (currentUser && currentUser.id === profileUser.id) {
        if (safePosts.length === 0) {
          fetchPosts();
        }
        setUserPosts(safePosts.filter((p) => p.author.id === profileUser.id));
      } else {
        // 其他用户的帖子也从store过滤
        setUserPosts(safePosts.filter((p) => p.author.id === profileUser.id));
      }
    }
  }, [profileUser, storePosts, currentUser, fetchPosts]);

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
      {/* 封面图 + 头像区 */}
      <Card className="overflow-hidden">
        {/* 封面 */}
        <div className="h-32 bg-gradient-brand sm:h-48" />

        <CardContent className="relative px-4 pb-4 pt-0">
          {/* 头像 */}
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
                <Button size="sm" className="gap-1.5">
                  <UserPlus className="h-4 w-4" />
                  关注
                </Button>
              )}
            </div>
          </div>

          {/* 用户信息 */}
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

            {/* 额外信息 */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-muted-foreground">
              {user.website && (
                <span className="flex items-center gap-1">
                  <Link2 className="h-3 w-3" />
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {user.website}
                  </a>
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                加入于 {new Date(user.createdAt).toLocaleDateString('zh-CN')}
              </span>
            </div>

            {/* 统计数据 */}
            <div className="flex gap-4 pt-2 text-sm">
              <span><strong>{userPosts.length}</strong> <span className="text-muted-foreground">内容</span></span>
              <span><strong>128</strong> <span className="text-muted-foreground">粉丝</span></span>
              <span><strong>64</strong> <span className="text-muted-foreground">关注</span></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 内容标签页 */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full justify-start border-b bg-transparent p-0">
          <TabsTrigger value="posts" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600">
            发布内容
          </TabsTrigger>
          <TabsTrigger value="media" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600">
            媒体库
          </TabsTrigger>
          <TabsTrigger value="likes" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600">
            赞过的
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-4 space-y-4">
          {userPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {userPosts.length === 0 && (
            <div className="py-12 text-center text-gray-400">还没有发布任何内容</div>
          )}
        </TabsContent>

        <TabsContent value="media" className="mt-4">
          <div className="py-12 text-center text-gray-400">媒体库功能即将上线</div>
        </TabsContent>

        <TabsContent value="likes" className="mt-4">
          <div className="py-12 text-center text-gray-400">赞过的内容即将上线</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
