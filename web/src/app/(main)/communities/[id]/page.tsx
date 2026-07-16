'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, MessageCircle, Loader2, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth-store';
import { getCommunity, joinCommunity, leaveCommunity } from '@/lib/social-api';
import type { Community } from '@/types';

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const communityId = params.id as string;

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const data = await getCommunity(communityId);
        setCommunity(data);
      } catch (error) {
        console.error('Failed to fetch community:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunity();
  }, [communityId]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setActionLoading(true);
    try {
      await joinCommunity(communityId);
      setCommunity((prev) => prev ? { ...prev, isMember: true, memberCount: prev.memberCount + 1 } : null);
    } catch (error: any) {
      alert(error.response?.data?.message || '加入失败');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm('确定要退出该社群吗？')) return;

    setActionLoading(true);
    try {
      await leaveCommunity(communityId);
      setCommunity((prev) => prev ? { ...prev, isMember: false, memberCount: Math.max(0, prev.memberCount - 1) } : null);
    } catch (error: any) {
      alert(error.response?.data?.message || '退出失败');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="mb-4 text-muted-foreground">社群不存在或已被解散</p>
            <Link href="/discover">
              <Button>返回发现页</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      {/* 头部 */}
      <div className="mb-6 flex items-center gap-4">
        <Link href="/discover">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">社群详情</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* 左侧：社群信息 */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={community.avatarUrl || undefined} alt={community.name} />
                  <AvatarFallback className="text-2xl">{community.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{community.name}</h2>
                  <p className="mt-1 text-muted-foreground">
                    {community.memberCount} / {community.maxMembers} 成员
                  </p>
                  {community.description && (
                    <p className="mt-3 text-sm">{community.description}</p>
                  )}
                  {/* 标签 */}
                  {community.tags && community.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {community.tags.map((tag) => (
                        <Badge key={tag.id} variant="secondary">
                          {tag.icon} {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              {/* 操作按钮 */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {community.isPublic ? '公开社群' : '私密社群'}
                  {community.creator && (
                    <span> · 创建者: {community.creator.displayName}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  {community.isMember ? (
                    <>
                      <Link href={`/messages/${community.conversationId}`}>
                        <Button>
                          <MessageCircle className="mr-2 h-4 w-4" />
                          进入聊天
                        </Button>
                      </Link>
                      {!community.isCreator && (
                        <Button variant="outline" onClick={handleLeave} disabled={actionLoading}>
                          <LogOut className="mr-2 h-4 w-4" />
                          退出
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button onClick={handleJoin} disabled={actionLoading}>
                      <Users className="mr-2 h-4 w-4" />
                      加入社群
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 社群规则 */}
          <Card>
            <CardHeader>
              <CardTitle>社群介绍</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {community.description || '暂无详细介绍'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：成员列表 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                社群成员 ({community.memberCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {community.members && community.members.length > 0 ? (
                <div className="space-y-3">
                  {community.members.slice(0, 20).map((member) => (
                    <Link
                      key={member.id}
                      href={`/profile/${member.username}`}
                      className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatarUrl || undefined} alt={member.displayName} />
                        <AvatarFallback>{member.displayName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{member.displayName}</p>
                        <p className="truncate text-xs text-muted-foreground">@{member.username}</p>
                      </div>
                    </Link>
                  ))}
                  {community.memberCount > 20 && (
                    <p className="text-center text-sm text-muted-foreground">
                      还有 {community.memberCount - 20} 位成员...
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">暂无成员信息</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
