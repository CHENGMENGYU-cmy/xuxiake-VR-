'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/auth-store';
import {
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
  getOrCreateDirectConversation,
} from '@/lib/social-api';
import { toast } from 'sonner';
import type { User } from '@/types';

export default function FollowersPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const username = params?.username as string || '';
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const defaultTab = searchParams.get('tab') === 'following' ? 'following' : 'followers';

  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [followMap, setFollowMap] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    Promise.all([getFollowers(username), getFollowing(username)])
      .then(([followersRes, followingRes]) => {
        const followerList = followersRes.data || [];
        const followingList = followingRes.data || [];
        setFollowers(followerList);
        setFollowing(followingList);

        // 构建我关注了谁的 map
        if (currentUser) {
          // 我关注的人 = 我的 following 列表，但这里用 followerList 判断（粉丝列表里谁关注了我）
          // 需要知道我关注了哪些人 —— 通过 followerList 中的用户来反查不够
          // 直接用 followingRes（我访问的用户的关注列表）不准确
          // 最准确的方式：我自己关注了谁，需要单独查
          // 但可以简化：如果当前用户在某人的粉丝列表中，说明我关注了他
          // getFollowers(username) = 谁关注了 username
          // 如果我在 followers 中，说明我关注了该用户
          // 但这里 followers/following 是 username 的，不是 current user 的
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [username, currentUser]);

  // 获取我（当前用户）的关注列表，用于判断互关
  const [myFollowingIds, setMyFollowingIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!currentUser) return;
    getFollowing(currentUser.username).then((res) => {
      setMyFollowingIds(new Set((res.data || []).map((u) => u.id)));
    }).catch(() => {});
  }, [currentUser]);

  const isMutual = (userId: string) => {
    // 互关 = 我关注了他 + 他关注了我（他在 followers 列表中）
    return myFollowingIds.has(userId) && followers.some((u) => u.id === userId);
  };

  const handleFollow = async (userId: string) => {
    if (actionLoading[userId]) return;
    setActionLoading((prev) => ({ ...prev, [userId]: true }));
    const wasFollowing = followMap[userId] || myFollowingIds.has(userId);
    setFollowMap((prev) => ({ ...prev, [userId]: !wasFollowing }));
    if (wasFollowing) {
      setMyFollowingIds((prev) => { const s = new Set(prev); s.delete(userId); return s; });
    } else {
      setMyFollowingIds((prev) => new Set(prev).add(userId));
    }

    try {
      if (wasFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
    } catch {
      setFollowMap((prev) => ({ ...prev, [userId]: wasFollowing }));
      if (wasFollowing) {
        setMyFollowingIds((prev) => new Set(prev).add(userId));
      } else {
        setMyFollowingIds((prev) => { const s = new Set(prev); s.delete(userId); return s; });
      }
      toast.error('操作失败');
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleMessage = async (userId: string) => {
    if (actionLoading[userId]) return;
    setActionLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      const conv = await getOrCreateDirectConversation(userId);
      router.push(`/messages/${conv.id}`);
    } catch {
      toast.error('无法创建对话');
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-sm text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          ← 返回
        </Button>
      </div>

      <Tabs defaultValue="followers" className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-2">
          <TabsTrigger value="followers">粉丝 {followers.length}</TabsTrigger>
          <TabsTrigger value="following">关注 {following.length}</TabsTrigger>
        </TabsList>

        <TabsContent value="followers">
          <UserList
            users={followers}
            currentUserId={currentUser?.id}
            myFollowingIds={myFollowingIds}
            followMap={followMap}
            actionLoading={actionLoading}
            onFollow={handleFollow}
            onMessage={handleMessage}
            isMutual={isMutual}
            emptyText="暂无粉丝"
          />
        </TabsContent>

        <TabsContent value="following">
          <UserList
            users={following}
            currentUserId={currentUser?.id}
            myFollowingIds={myFollowingIds}
            followMap={followMap}
            actionLoading={actionLoading}
            onFollow={handleFollow}
            onMessage={handleMessage}
            isMutual={isMutual}
            emptyText="暂无关注"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UserList({
  users,
  currentUserId,
  myFollowingIds,
  followMap,
  actionLoading,
  onFollow,
  onMessage,
  isMutual,
  emptyText,
}: {
  users: User[];
  currentUserId?: string;
  myFollowingIds: Set<string>;
  followMap: Record<string, boolean>;
  actionLoading: Record<string, boolean>;
  onFollow: (id: string) => void;
  onMessage: (id: string) => void;
  isMutual: (id: string) => boolean;
  emptyText: string;
}) {
  if (users.length === 0) {
    return <div className="py-12 text-center text-sm text-muted-foreground">{emptyText}</div>;
  }

  return (
    <div className="divide-y rounded-lg border bg-card">
      {users.map((user) => {
        const isSelf = user.id === currentUserId;
        const isFollowing = followMap[user.id] || myFollowingIds.has(user.id);
        const mutual = isMutual(user.id);

        return (
          <div key={user.id} className="flex items-center gap-3 p-3">
            <Link href={`/profile/${user.username}`}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName} />
                <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/profile/${user.username}`} className="text-sm font-medium hover:underline">
                {user.displayName}
              </Link>
              {user.bio && (
                <p className="line-clamp-1 text-xs text-muted-foreground">{user.bio}</p>
              )}
            </div>
            {!isSelf && (
              <div className="flex shrink-0 gap-1.5">
                {mutual && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onMessage(user.id)}
                    disabled={!!actionLoading[user.id]}
                  >
                    私信
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={isFollowing ? 'outline' : 'default'}
                  onClick={() => onFollow(user.id)}
                  disabled={!!actionLoading[user.id]}
                >
                  {isFollowing ? '已关注' : '关注'}
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
