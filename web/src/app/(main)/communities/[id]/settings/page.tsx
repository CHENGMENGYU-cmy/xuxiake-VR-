'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2, Loader2, Users, Shield, X, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/auth-store';
import { AuthGuard } from '@/components/auth-guard';
import {
  getCommunity, updateCommunity, dissolveCommunity,
  getCommunityRoles, assignCommunityRole, removeCommunityRole,
} from '@/lib/social-api';
import { toast } from 'sonner';
import type { Community, CommunityRole } from '@/types';

export default function CommunitySettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}

function SettingsContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const communityId = params.id as string;

  const [community, setCommunity] = useState<Community | null>(null);
  const [roles, setRoles] = useState<CommunityRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 表单
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('');
  const [category, setCategory] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const c = await getCommunity(communityId);
      setCommunity(c);
      setName(c.name);
      setDescription(c.description || '');
      setRules(c.rules || '');
      setCategory(c.category || '');
      setIsPublic(c.isPublic);
      setAvatarUrl(c.avatarUrl || '');
      setCoverUrl(c.coverUrl || '');
      const r = await getCommunityRoles(communityId);
      setRoles(r);
    } catch {
      toast.error('无权访问');
      router.push(`/communities/${communityId}`);
    }
    setLoading(false);
  }, [communityId, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCommunity(communityId, { name, description, rules, category, isPublic, avatarUrl, coverUrl });
      setCommunity((prev) => prev ? { ...prev, name, description, rules, category, isPublic, avatarUrl, coverUrl } : null);
      toast.success('设置已保存');
    } catch {
      toast.error('保存失败');
    }
    setSaving(false);
  };

  const handleDissolve = async () => {
    if (!confirm('确定解散社群？此操作不可恢复！')) return;
    try {
      await dissolveCommunity(communityId);
      toast.success('社群已解散');
      router.push('/communities');
    } catch {
      toast.error('解散失败');
    }
  };

  const handleRemoveRole = async (userId: string) => {
    try {
      await removeCommunityRole(communityId, userId);
      setRoles((prev) => prev.filter((r) => r.userId !== userId));
      toast.success('已移除角色');
    } catch { toast.error('操作失败'); }
  };

  const isAdmin = community && user && community.creator?.id === user.id;

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!isAdmin) {
    return <div className="py-16 text-center text-muted-foreground">仅社群创建者可管理设置</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/communities/${communityId}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">社群设置</h1>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">基本信息</TabsTrigger>
          <TabsTrigger value="members">成员管理</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4 mt-4">
          <Card><CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>社群名称</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label>简介</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>社群规则</Label>
              <Textarea value={rules} onChange={(e) => setRules(e.target.value)} rows={4} placeholder="社群行为规范..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>分类</Label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="旅行/VR/活动/文化" />
              </div>
              <div className="space-y-2">
                <Label>头像URL</Label>
                <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label>封面URL</Label>
              <Input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>公开社群</Label>
                <p className="text-xs text-muted-foreground">关闭后仅成员可查看</p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
            <Separator />
            <div className="flex justify-between">
              <Button variant="destructive" size="sm" onClick={handleDissolve} className="gap-1">
                <Trash2 className="h-4 w-4" /> 解散社群
              </Button>
              <Button onClick={handleSave} disabled={saving || !name.trim()} className="gap-1">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                保存设置
              </Button>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>管理员: {roles.filter(r => r.role === 'ADMIN').length} 人 | 版主: {roles.filter(r => r.role === 'MODERATOR').length} 人</span>
            </div>
          </div>

          {/* 成员列表（含角色切换） */}
          {community?.members && community.members.length > 0 ? (
            community.members
              .filter((m) => m.id !== community.creator?.id)
              .map((member) => {
                const memberRole = roles.find((r) => r.userId === member.id);
                return (
                  <div key={member.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={member.avatarUrl ?? undefined} />
                        <AvatarFallback>{member.displayName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.displayName}</p>
                        <p className="text-xs text-muted-foreground">@{member.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        className="text-xs border rounded px-2 py-1"
                        value={memberRole?.role || 'MEMBER'}
                        onChange={async (e) => {
                          const newRole = e.target.value;
                          try {
                            if (newRole === 'MEMBER') {
                              if (memberRole) {
                                await removeCommunityRole(communityId, member.id);
                                setRoles((prev) => prev.filter((r) => r.userId !== member.id));
                                toast.success('已移除角色');
                              }
                            } else {
                              await assignCommunityRole(communityId, member.id, newRole as 'ADMIN' | 'MODERATOR');
                              // 刷新角色列表
                              const r = await getCommunityRoles(communityId);
                              setRoles(r);
                              toast.success(`已分配${newRole === 'ADMIN' ? '管理员' : '版主'}角色`);
                            }
                          } catch { toast.error('操作失败'); }
                        }}
                      >
                        <option value="MEMBER">普通成员</option>
                        <option value="MODERATOR">版主</option>
                        <option value="ADMIN">管理员</option>
                      </select>
                    </div>
                  </div>
                );
              })
          ) : (
            <p className="py-8 text-center text-muted-foreground">暂无成员可管理</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
