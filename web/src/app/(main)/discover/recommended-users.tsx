'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { getRecommendedUsers, followUser, unfollowUser, getOrCreateDirectConversation } from '@/lib/social-api';
import { toast } from 'sonner';
import type { RecommendedUser } from '@/types';

export function RecommendedUsers() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<RecommendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isAuthenticated) return;
    getRecommendedUsers(1, 20)
      .then((res) => {
        setUsers(res.data || []);
        const map: Record<string, boolean> = {};
        res.data?.forEach((u) => { if (u.isFollowing) map[u.id] = true; });
        setFollowingMap(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleFollow = async (userId: string) => {
    if (actionLoading[userId]) return;
    setActionLoading((prev) => ({ ...prev, [userId]: true }));
    const wasFollowing = followingMap[userId];
    setFollowingMap((prev) => ({ ...prev, [userId]: !wasFollowing }));
    try {
      if (wasFollowing) {
        await unfollowUser(userId);
        toast.success('已取消关注');
      } else {
        await followUser(userId);
        toast.success('关注成功，和TA打个招呼吧', {
          action: {
            label: '发消息',
            onClick: () => handleMessage(userId),
          },
          duration: 5000,
        });
      }
    } catch {
      setFollowingMap((prev) => ({ ...prev, [userId]: wasFollowing }));
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
    return <div className="py-16 text-center text-sm text-muted-foreground">加载中...</div>;
  }

  if (users.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        暂无推荐用户，完善个人资料和兴趣标签可获得更精准的推荐
      </div>
    );
  }

  return (
    <div className="divide-y rounded-lg border bg-card">
      {users.map((user) => (
        <div key={user.id} className="flex items-start gap-3 p-4">
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
              <div className="ml-3 flex shrink-0 gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleMessage(user.id)}
                  disabled={!!actionLoading[user.id]}
                >
                  私信
                </Button>
                <Button
                  size="sm"
                  variant={followingMap[user.id] ? 'outline' : 'default'}
                  onClick={() => handleFollow(user.id)}
                  disabled={!!actionLoading[user.id]}
                >
                  {followingMap[user.id] ? '已关注' : '关注'}
                </Button>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              {user.matchReasons?.map((reason, i) => (
                <span key={i} className="rounded bg-secondary px-1.5 py-0.5">{reason}</span>
              ))}
              {user.interests?.slice(0, 3).map((tag) => (
                <span key={tag.id} className="rounded bg-secondary px-1.5 py-0.5">{tag.name}</span>
              ))}
              {(user.interests?.length || 0) > 3 && (
                <span>+{user.interests!.length - 3}</span>
              )}
            </div>

            {user.postCount !== undefined && user.postCount > 0 && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {user.postCount} 篇内容 · {user.totalLikes} 获赞
                {user.vrDeviceInfo && ` · ${user.vrDeviceInfo.model}`}
              </p>
            )}

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

            {user.mutualFriends && user.mutualFriends.count > 0 && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {user.mutualFriends.names.join('、')}
                {user.mutualFriends.count > 2 && `等${user.mutualFriends.count}位共同关注`}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
