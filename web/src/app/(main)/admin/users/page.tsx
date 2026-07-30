'use client';

import { useState, useEffect } from 'react';
import { Users, Shield, Loader2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth-store';
import { AuthGuard } from '@/components/auth-guard';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';

export default function AdminUsersPage() {
  return <AuthGuard requiredRole="MODERATOR"><UsersContent /></AuthGuard>;
}

function UsersContent() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/users/list?limit=100');
      if (res.data?.success) setUsers(res.data.data || []);
    } catch { toast.error('需要管理员权限'); router.push('/'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await apiClient.put(`/users/${userId}/role`, { role });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
      toast.success('角色已更新');
    } catch { toast.error('操作失败'); }
  };

  const handleBan = async (userId: string) => {
    if (!confirm('确定封禁该用户？封禁后将无法登录和发布内容。')) return;
    try {
      await apiClient.put(`/users/${userId}/ban`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'BANNED' } : u));
      toast.success('用户已封禁');
    } catch (err: any) { toast.error(err.response?.data?.message || '操作失败'); }
  };

  const handleUnban = async (userId: string) => {
    try {
      await apiClient.put(`/users/${userId}/unban`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'ACTIVE' } : u));
      toast.success('用户已解封');
    } catch { toast.error('操作失败'); }
  };

  const filtered = search
    ? users.filter(u => u.displayName?.includes(search) || u.username?.includes(search))
    : users;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">用户管理</h1>
            <p className="text-sm text-muted-foreground">{users.length} 位用户</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="搜索用户..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <div className="space-y-1">
          {filtered.map(u => (
            <div key={u.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={u.avatarUrl} />
                  <AvatarFallback>{u.displayName?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{u.displayName}</p>
                    {u.status === 'BANNED' && <Badge className="h-4 text-[10px] bg-gray-500">已封禁</Badge>}
                    {u.role === 'ADMIN' && <Badge className="h-4 text-[10px] bg-red-500">管理员</Badge>}
                    {u.role === 'MODERATOR' && <Badge className="h-4 text-[10px] bg-amber-500">审核员</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">@{u.username}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {u.status === 'BANNED' ? (
                  <Button size="sm" variant="outline" onClick={() => handleUnban(u.id)}>解封</Button>
                ) : (
                  <>
                    {u.role !== 'ADMIN' && u.role !== 'MODERATOR' && (
                      <Button size="sm" variant="outline" onClick={() => handleRoleChange(u.id, 'MODERATOR')}>
                        <Shield className="mr-1 h-3 w-3" /> 审核员
                      </Button>
                    )}
                    {u.role === 'MODERATOR' && (
                      <Button size="sm" variant="outline" onClick={() => handleRoleChange(u.id, 'USER')}>取消审核员</Button>
                    )}
                    {u.role !== 'ADMIN' && (
                      <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleRoleChange(u.id, 'ADMIN')}>
                        <Shield className="mr-1 h-3 w-3" /> 管理员
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="text-red-400" onClick={() => handleBan(u.id)}>封禁</Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
