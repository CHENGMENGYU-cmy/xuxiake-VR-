'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Flag, Users, FileText, TrendingUp, ArrowRight, Loader2, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth-store';
import { AuthGuard } from '@/components/auth-guard';
import apiClient from '@/lib/api-client';

interface DashboardStats {
  pendingReviews: number;
  pendingReports: number;
  totalUsers: number;
  totalPosts: number;
  recentPosts: any[];
}

export default function AdminDashboard() {
  return <AuthGuard requiredRole="MODERATOR"><DashboardContent /></AuthGuard>;
}

function DashboardContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({ pendingReviews: 0, pendingReports: 0, totalUsers: 0, totalPosts: 0, recentPosts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAdmin = user?.role === 'ADMIN';
    const requests: Promise<any>[] = [
      apiClient.get('/posts/reviews/queue?limit=100'),
      apiClient.get('/posts/reports/list?limit=100'),
      apiClient.get('/posts?sort=latest&limit=5'),
    ];
    // 仅 ADMIN 可查看用户列表
    if (isAdmin) {
      requests.push(apiClient.get('/users/list?limit=1'));
    }

    Promise.all(requests).then((results) => {
      const [reviews, reports, posts] = results;
      const users = isAdmin ? results[3] : null;
      setStats({
        pendingReviews: (reviews.data?.data || []).filter((r: any) => r.status === 'FLAGGED').length,
        pendingReports: (reports.data?.data || []).filter((r: any) => r.status === 'PENDING').length,
        totalUsers: users ? (users.data?.data?.length || 0) : 0,
        totalPosts: posts.data?.posts?.length || 0,
        recentPosts: posts.data?.posts || [],
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user, router]);

  const cards = [
    { label: '待审核', value: stats.pendingReviews, icon: Shield, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30', href: '/admin/reviews' },
    { label: '待处理举报', value: stats.pendingReports, icon: Flag, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', href: '/admin/reports' },
    { label: '用户数', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', href: '/admin/users' },
    { label: '内容数', value: stats.totalPosts, icon: FileText, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', href: '/feed' },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-red-500">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">管理仪表板</h1>
          <p className="text-sm text-muted-foreground">
            {user?.role === 'ADMIN' ? '系统管理员' : '审核员'} · 欢迎回来，{user?.displayName}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <>
          {/* 统计卡片 */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {cards.map((card) => (
              <button key={card.label} onClick={() => router.push(card.href)} className="text-left">
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>
                        <card.icon className={`h-5 w-5 ${card.color}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{card.value}</p>
                        <p className="text-xs text-muted-foreground">{card.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>

          {/* 快捷操作 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-amber-500" /> 待处理
                </h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-between" onClick={() => router.push('/admin/reviews')}>
                    审核队列 <Badge className="bg-amber-500">{stats.pendingReviews}</Badge> <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between" onClick={() => router.push('/admin/reports')}>
                    举报管理 <Badge className="bg-red-500">{stats.pendingReports}</Badge> <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between" onClick={() => router.push('/feed')}>
                    <Eye className="h-4 w-4 mr-2" /> 内容巡查 <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" /> 最近内容
                </h3>
                {stats.recentPosts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">暂无内容</p>
                ) : (
                  <div className="space-y-2">
                    {stats.recentPosts.slice(0, 3).map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between text-sm">
                        <span className="truncate max-w-[200px]">{p.content?.slice(0, 40) || '(无内容)'}</span>
                        <span className="text-xs text-muted-foreground shrink-0">{new Date(p.createdAt).toLocaleDateString('zh-CN')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
