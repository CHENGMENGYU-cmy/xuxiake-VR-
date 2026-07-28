'use client';

import { useState, useEffect } from 'react';
import { Flag, Check, X, Loader2, RefreshCw, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/stores/auth-store';
import { AuthGuard } from '@/components/auth-guard';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';

export default function AdminReportsPage() {
  return <AuthGuard><ReportsContent /></AuthGuard>;
}

function ReportsContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolution, setResolution] = useState('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/posts/reports/list?limit=50');
      if (res.data?.success) setReports(res.data.data || []);
    } catch { toast.error('需要管理员权限'); router.push('/'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleResolve = async (id: string, action: 'RESOLVED' | 'DISMISSED') => {
    try {
      await apiClient.post(`/posts/reports/${id}/resolve`, { action, resolution: resolution || undefined });
      setReports(r => r.filter(i => i.id !== id));
      setResolvingId(null); setResolution('');
      toast.success(action === 'RESOLVED' ? '已处理' : '已驳回');
    } catch { toast.error('操作失败'); }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
            <Flag className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">举报管理</h1>
            <p className="text-sm text-muted-foreground">{reports.length} 条举报</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`mr-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> 刷新
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : reports.length === 0 ? (
        <div className="rounded-lg border bg-card py-16 text-center">
          <Flag className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">暂无举报</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-lg border bg-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={r.status === 'PENDING' ? 'bg-orange-500' : r.status === 'RESOLVED' ? 'bg-green-500' : 'bg-muted'}>
                    {r.status === 'PENDING' ? '待处理' : r.status === 'RESOLVED' ? '已解决' : '已驳回'}
                  </Badge>
                  <Badge variant="outline">{r.reason}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString('zh-CN')}</span>
              </div>
              {r.detail && <p className="text-sm text-muted-foreground mb-2">{r.detail}</p>}
              <div className="mb-2 rounded bg-muted/50 p-2 text-sm line-clamp-3">
                {r.post?.content || '(内容已删除)'}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>举报人: {r.reporter?.displayName}</span>
                <span>类型: {r.post?.postType}</span>
              </div>
              {r.status === 'PENDING' && (
                resolvingId === r.id ? (
                  <div className="space-y-2">
                    <Textarea placeholder="处理说明" className="min-h-[50px]" value={resolution} onChange={e => setResolution(e.target.value)} />
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setResolvingId(null)}>取消</Button>
                      <Button size="sm" onClick={() => handleResolve(r.id, 'RESOLVED')}><Check className="mr-1 h-3 w-3" /> 解决</Button>
                      <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleResolve(r.id, 'DISMISSED')}><X className="mr-1 h-3 w-3" /> 驳回</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => router.push(`/post/${r.postId}`)}><Eye className="mr-1 h-3 w-3" /> 查看</Button>
                    <Button size="sm" onClick={() => setResolvingId(r.id)}>处理</Button>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
