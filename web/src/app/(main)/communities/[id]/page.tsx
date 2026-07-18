'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Users, MessageCircle, Loader2, LogOut, Settings,
  Megaphone, Trophy, Info, ImageIcon, MapPin, Globe, Lock,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth-store';
import {
  getCommunity, joinCommunity, leaveCommunity,
  getCommunityAnnouncements, getCommunityRoles,
} from '@/lib/social-api';
import type { Community, CommunityAnnouncement, CommunityRole } from '@/types';

export default function CommunitySpacePage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  // 子数据
  const [announcements, setAnnouncements] = useState<CommunityAnnouncement[]>([]);
  const [roles, setRoles] = useState<CommunityRole[]>([]);

  const communityId = params.id as string;

  const fetchCommunity = useCallback(async () => {
    try {
      const data = await getCommunity(communityId);
      setCommunity(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    fetchCommunity();
  }, [fetchCommunity]);

  // 加载公告和角色
  useEffect(() => {
    if (!community) return;
    getCommunityAnnouncements(communityId).then(setAnnouncements).catch(() => {});
    getCommunityRoles(communityId).then(setRoles).catch(() => {});
  }, [communityId, community]);

  const handleJoin = async () => {
    if (!isAuthenticated) { router.push('/login'); return; }
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
    return <CommunitySpaceSkeleton />;
  }

  if (!community) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="mb-4 text-muted-foreground">社群不存在或已被解散</p>
            <Link href="/discover"><Button>返回发现页</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pinnedAnnouncements = announcements.filter((a) => a.isPinned);
  const normalAnnouncements = announcements.filter((a) => !a.isPinned);

  return (
    <div className="mx-auto max-w-5xl">
      {/* 封面头部 */}
      <div className="relative">
        {/* 封面图 */}
        <div className="h-48 overflow-hidden rounded-b-lg bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 sm:h-56">
          {community.coverUrl ? (
            <img src={community.coverUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageIcon className="h-16 w-16 text-primary/20" />
            </div>
          )}
        </div>

        {/* 社群信息覆盖层 */}
        <div className="relative mx-auto max-w-4xl px-4">
          <div className="-mt-12 flex items-end gap-4">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarImage src={community.avatarUrl || undefined} alt={community.name} />
              <AvatarFallback className="text-3xl">{community.name[0]}</AvatarFallback>
            </Avatar>
            <div className="mb-1 flex-1">
              <h1 className="text-2xl font-bold">{community.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {community.memberCount}/{community.maxMembers} 成员
                </span>
                {community.isPublic ? (
                  <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> 公开社群</span>
                ) : (
                  <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> 私密社群</span>
                )}
                {community.locationName && (
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {community.locationName}</span>
                )}
              </div>
            </div>
            <div className="mb-1 flex gap-2">
              {community.isMember ? (
                <>
                  <Link href={`/messages/${community.conversationId}`}>
                    <Button><MessageCircle className="mr-2 h-4 w-4" /> 进入聊天</Button>
                  </Link>
                  {!community.isCreator && (
                    <Button variant="outline" onClick={handleLeave} disabled={actionLoading}>
                      <LogOut className="mr-2 h-4 w-4" /> 退出
                    </Button>
                  )}
                  {community.isCreator && (
                    <Link href={`/communities/${communityId}/settings`}>
                      <Button variant="outline" size="icon"><Settings className="h-4 w-4" /></Button>
                    </Link>
                  )}
                </>
              ) : (
                <Button onClick={handleJoin} disabled={actionLoading}>
                  <Users className="mr-2 h-4 w-4" /> 加入社群
                </Button>
              )}
            </div>
          </div>

          {/* 标签 */}
          {community.tags && community.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {community.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">{tag.icon} {tag.name}</Badge>
              ))}
            </div>
          )}

          {/* 简介 */}
          {community.description && (
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{community.description}</p>
          )}
        </div>
      </div>

      {/* Tab 导航 + 内容 */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList variant="line" className="w-full justify-start border-b">
            <TabsTrigger value="posts">动态</TabsTrigger>
            <TabsTrigger value="announcements">
              公告{announcements.length > 0 && <span className="ml-1 text-xs text-muted-foreground">({announcements.length})</span>}
            </TabsTrigger>
            <TabsTrigger value="challenges">挑战</TabsTrigger>
            <TabsTrigger value="members">
              成员{community.memberCount > 0 && <span className="ml-1 text-xs text-muted-foreground">({community.memberCount})</span>}
            </TabsTrigger>
            <TabsTrigger value="about">关于</TabsTrigger>
          </TabsList>

          {/* 动态 Tab */}
          <TabsContent value="posts" className="mt-4">
            <CommunityPostsTab communityId={communityId} isMember={!!community.isMember} />
          </TabsContent>

          {/* 公告 Tab */}
          <TabsContent value="announcements" className="mt-4">
            <CommunityAnnouncementsTab
              announcements={announcements}
              pinnedAnnouncements={pinnedAnnouncements}
              normalAnnouncements={normalAnnouncements}
              isModerator={!!community.isCreator}
            />
          </TabsContent>

          {/* 挑战 Tab */}
          <TabsContent value="challenges" className="mt-4">
            <CommunityChallengesTab communityId={communityId} isModerator={!!community.isCreator} />
          </TabsContent>

          {/* 成员 Tab */}
          <TabsContent value="members" className="mt-4">
            <CommunityMembersTab community={community} roles={roles} />
          </TabsContent>

          {/* 关于 Tab */}
          <TabsContent value="about" className="mt-4">
            <CommunityAboutTab community={community} roles={roles} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ==================== 动态 Tab ====================

function CommunityPostsTab({ communityId, isMember }: { communityId: string; isMember: boolean }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('@/lib/social-api').then(({ getCommunityPosts }) => {
      getCommunityPosts(communityId, 1, 20)
        .then((res) => setPosts(res.data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    });
  }, [communityId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}><CardContent className="pt-6"><Skeleton className="h-24" /></CardContent></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 置顶公告预览 */}
      {isMember && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-3 py-3">
            <Megaphone className="h-4 w-4 text-primary" />
            <p className="text-sm text-muted-foreground">分享你的VR旅行体验到社群...</p>
          </CardContent>
        </Card>
      )}

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            暂无动态，快来发布第一条吧
          </CardContent>
        </Card>
      ) : (
        posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.author?.avatarUrl || undefined} />
                  <AvatarFallback>{post.author?.displayName?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{post.author?.displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>
              {post.content && <p className="mt-3 text-sm">{post.content}</p>}
              {post.locationName && (
                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {post.locationName}
                </p>
              )}
              <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                <span>{post.likeCount || 0} 赞</span>
                <span>{post.commentCount || 0} 评论</span>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

// ==================== 公告 Tab ====================

function CommunityAnnouncementsTab({
  announcements, pinnedAnnouncements, normalAnnouncements, isModerator,
}: {
  announcements: CommunityAnnouncement[];
  pinnedAnnouncements: CommunityAnnouncement[];
  normalAnnouncements: CommunityAnnouncement[];
  isModerator: boolean;
}) {
  if (announcements.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          暂无公告
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {pinnedAnnouncements.map((a) => (
        <Card key={a.id} className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs">置顶</Badge>
              <CardTitle className="text-base">{a.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{a.content}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              {a.author && <span>{a.author.displayName}</span>}
              <span>{new Date(a.createdAt).toLocaleDateString('zh-CN')}</span>
            </div>
          </CardContent>
        </Card>
      ))}
      {normalAnnouncements.map((a) => (
        <Card key={a.id}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{a.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{a.content}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              {a.author && <span>{a.author.displayName}</span>}
              <span>{new Date(a.createdAt).toLocaleDateString('zh-CN')}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ==================== 挑战 Tab ====================

function CommunityChallengesTab({ communityId, isModerator }: { communityId: string; isModerator: boolean }) {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('@/lib/social-api').then(({ getCommunityChallenges }) => {
      getCommunityChallenges(communityId)
        .then(setChallenges)
        .catch(() => {})
        .finally(() => setLoading(false));
    });
  }, [communityId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i}><CardContent className="pt-6"><Skeleton className="h-20" /></CardContent></Card>
        ))}
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          <Trophy className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
          暂无挑战活动
        </CardContent>
      </Card>
    );
  }

  const statusLabel: Record<string, string> = { UPCOMING: '即将开始', ACTIVE: '进行中', ENDED: '已结束' };
  const statusColor: Record<string, string> = { UPCOMING: 'bg-blue-500', ACTIVE: 'bg-green-500', ENDED: 'bg-gray-400' };

  return (
    <div className="space-y-4">
      {challenges.map((c) => (
        <Card key={c.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${statusColor[c.status]}`} />
                  <span className="text-xs text-muted-foreground">{statusLabel[c.status]}</span>
                </div>
                <h3 className="mt-1 font-medium">{c.title}</h3>
                {c.description && <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>}
              </div>
              <Badge variant="outline">{c.type}</Badge>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span>{new Date(c.startDate).toLocaleDateString('zh-CN')} - {new Date(c.endDate).toLocaleDateString('zh-CN')}</span>
              <span>{c.participantCount} 人参与</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ==================== 成员 Tab ====================

function CommunityMembersTab({ community, roles }: { community: Community; roles: CommunityRole[] }) {
  const adminIds = new Set(roles.filter((r) => r.role === 'ADMIN').map((r) => r.userId));
  const moderatorIds = new Set(roles.filter((r) => r.role === 'MODERATOR').map((r) => r.userId));

  const admins = community.members?.filter((m) => adminIds.has(m.id) || m.id === community.creator?.id) || [];
  const moderators = community.members?.filter((m) => moderatorIds.has(m.id) && !adminIds.has(m.id)) || [];
  const regularMembers = community.members?.filter(
    (m) => !adminIds.has(m.id) && !moderatorIds.has(m.id) && m.id !== community.creator?.id,
  ) || [];

  return (
    <div className="space-y-6">
      {/* 创建者 */}
      {community.creator && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">创建者</h3>
          <div className="space-y-2">
            <MemberItem user={community.creator} badge="创建者" />
          </div>
        </div>
      )}

      {/* 管理员 */}
      {admins.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">管理员 ({admins.length})</h3>
          <div className="space-y-2">
            {admins.map((m) => (
              <MemberItem key={m.id} user={m} badge="管理员" />
            ))}
          </div>
        </div>
      )}

      {/* 版主 */}
      {moderators.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">版主 ({moderators.length})</h3>
          <div className="space-y-2">
            {moderators.map((m) => (
              <MemberItem key={m.id} user={m} badge="版主" />
            ))}
          </div>
        </div>
      )}

      {/* 普通成员 */}
      {regularMembers.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">成员 ({regularMembers.length})</h3>
          <div className="space-y-2">
            {regularMembers.map((m) => (
              <MemberItem key={m.id} user={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MemberItem({ user, badge }: { user: any; badge?: string }) {
  return (
    <Link
      href={`/profile/${user.username}`}
      className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent"
    >
      <Avatar className="h-9 w-9">
        <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName} />
        <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{user.displayName}</p>
          {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
        </div>
        <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
      </div>
    </Link>
  );
}

// ==================== 关于 Tab ====================

function CommunityAboutTab({ community, roles }: { community: Community; roles: CommunityRole[] }) {
  return (
    <div className="space-y-6">
      {/* 社群简介 */}
      <Card>
        <CardHeader><CardTitle className="text-base">社群简介</CardTitle></CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {community.description || '暂无简介'}
          </p>
        </CardContent>
      </Card>

      {/* 社群规则 */}
      {community.rules && (
        <Card>
          <CardHeader><CardTitle className="text-base">社群规则</CardTitle></CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{community.rules}</p>
          </CardContent>
        </Card>
      )}

      {/* 社群信息 */}
      <Card>
        <CardHeader><CardTitle className="text-base">社群信息</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <InfoRow label="类型" value={community.isPublic ? '公开社群' : '私密社群'} />
          <InfoRow label="成员数" value={`${community.memberCount} / ${community.maxMembers}`} />
          {community.category && <InfoRow label="分类" value={community.category} />}
          {community.locationName && <InfoRow label="位置" value={community.locationName} />}
          {community.creator && <InfoRow label="创建者" value={community.creator.displayName} />}
          <InfoRow label="创建时间" value={new Date(community.createdAt).toLocaleDateString('zh-CN')} />
        </CardContent>
      </Card>

      {/* 标签 */}
      {community.tags && community.tags.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">兴趣标签</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {community.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">{tag.icon} {tag.name}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

// ==================== 骨架屏 ====================

function CommunitySpaceSkeleton() {
  return (
    <div className="mx-auto max-w-5xl">
      <Skeleton className="h-48 rounded-b-lg sm:h-56" />
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="-mt-12 flex items-end gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="mt-6 h-8 w-80" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </div>
  );
}
