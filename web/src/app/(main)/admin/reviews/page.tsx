'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Check, X, Eye, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/stores/auth-store';
import { AuthGuard } from '@/components/auth-guard';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';

interface ReviewItem {
  id: string;
  postId: string;
  status: string;
  riskType: string | null;
  riskDetail: string | null;
  reason: string | null;
  createdAt: string;
  post: {
    id: string;
    content: string | null;
    authorId: string;
    createdAt: string;
  } | null;
}

export default function AdminReviewsPage() {
  return (
    <AuthGuard requiredRole="MODERATOR">
      <AdminReviewsContent />
    </AuthGuard>
  );
}

function AdminReviewsContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchAction, setBatchAction] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [batchReason, setBatchReason] = useState('');

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/posts/reviews/queue?limit=50');
      if (res.data?.success) setReviews(res.data.data || []);
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error('需要管理员权限');
        router.push('/');
      }
    }
    setLoading(false);
  };

  useEffect(() => { loadReviews(); }, []);

  const handleApprove = async (postId: string) => {
    try {
      await apiClient.post(`/posts/${postId}/review/approve`, {});
      setReviews(r => r.filter(i => i.postId !== postId));
      toast.success('已通过');
    } catch { toast.error('操作失败'); }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const handleBatch = async () => {
    if (selected.size === 0) { toast.error('请先选择内容'); return; }
    try {
      await apiClient.post('/posts/reviews/batch', {
        postIds: [...selected], action: batchAction, reason: batchReason || undefined,
      });
      setReviews(r => r.filter(i => !selected.has(i.postId)));
      setSelected(new Set()); setBatchAction(null); setBatchReason('');
      toast.success(`已${batchAction === 'APPROVED' ? '通过' : '驳回'} ${selected.size} 条`);
    } catch { toast.error('操作失败'); }
  };

  const handleReject = async (postId: string) => {
    if (!rejectReason.trim()) { toast.error('请输入驳回原因'); return; }
    try {
      await apiClient.post(`/posts/${postId}/review/reject`, { reason: rejectReason });
      setReviews(r => r.filter(i => i.postId !== postId));
      setRejectingId(null);
      setRejectReason('');
      toast.success('已驳回');
    } catch { toast.error('操作失败'); }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'FLAGGED': return <Badge className="bg-amber-500">待审核</Badge>;
      case 'APPROVED': return <Badge className="bg-green-500">已通过</Badge>;
      case 'REJECTED': return <Badge className="bg-red-500">已驳回</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
            <Shield className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">内容审核</h1>
            <p className="text-sm text-muted-foreground">管理员审核队列</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={loadReviews} disabled={loading}>
          <RefreshCw className={`mr-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : reviews.length === 0 ? (
        <div className="rounded-lg border bg-card py-16 text-center">
          <Shield className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">暂无待审核内容</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* 批量操作栏 */}
          {selected.size > 0 && (
            <div className="sticky top-0 z-10 flex items-center gap-3 rounded-lg border-2 border-primary bg-primary/5 p-3">
              <span className="text-sm font-medium">已选 {selected.size} 条</span>
              <Button size="sm" variant="outline" onClick={() => { setBatchAction('APPROVED'); handleBatch(); }}>全部通过</Button>
              <Button size="sm" variant="outline" className="text-red-500" onClick={() => setBatchAction('REJECTED')}>
                全部驳回
              </Button>
              {batchAction === 'REJECTED' && (
                <>
                  <Input placeholder="驳回原因" className="h-8 w-48" value={batchReason} onChange={e => setBatchReason(e.target.value)} />
                  <Button size="sm" variant="destructive" onClick={handleBatch}>确认驳回</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setBatchAction(null); setBatchReason(''); }}>取消</Button>
                </>
              )}
              <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>取消选择</Button>
            </div>
          )}
          {reviews.map((review) => (
            <div key={review.id} className={`flex gap-3 rounded-lg border bg-card p-4 ${selected.has(review.postId) ? 'border-primary bg-primary/5' : ''}`}>
              <input type="checkbox" checked={selected.has(review.postId)} onChange={() => toggleSelect(review.postId)} className="mt-1 h-4 w-4 shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  {statusBadge(review.status)}
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleString('zh-CN')}
                  </span>
                </div>

                {review.riskType && (
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 px-3 py-2">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">{review.riskType}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-500">{review.riskDetail}</p>
                  </div>
                )}

                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-sm whitespace-pre-wrap line-clamp-5">{review.post?.content || '(无文本内容)'}</p>
                </div>

                {rejectingId === review.postId ? (
                  <div className="space-y-2">
                    <Textarea placeholder="驳回原因" className="min-h-[60px]" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setRejectingId(null)}>取消</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReject(review.postId)}>确认驳回</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => router.push(`/post/${review.postId}`)}><Eye className="mr-1 h-4 w-4" />查看原文</Button>
                    <Button size="sm" variant="outline" onClick={() => handleApprove(review.postId)}><Check className="mr-1 h-4 w-4" />通过</Button>
                    <Button size="sm" variant="outline" className="text-red-500" onClick={() => setRejectingId(review.postId)}><X className="mr-1 h-4 w-4" />驳回</Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
