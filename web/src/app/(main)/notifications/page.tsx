'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Heart, MessageCircle, UserPlus, Info, MessageSquare, Loader2, Shield, Flag } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Notification } from '@/types';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationStore } from '@/stores/notification-store';
import { AuthGuard } from '@/components/auth-guard';

const iconMap: Record<string, React.ElementType> = {
  LIKE: Heart,
  COMMENT: MessageCircle,
  FOLLOW: UserPlus,
  SYSTEM: Info,
  MESSAGE: MessageSquare,
};

const iconColors: Record<string, string> = {
  LIKE: 'text-accent bg-accent/10',
  COMMENT: 'text-primary bg-primary/10',
  FOLLOW: 'text-teal-500 bg-teal-50 dark:bg-teal-900/20',
  SYSTEM: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
  MESSAGE: 'text-accent bg-accent/10',
};

const typeLabels: Record<string, string> = {
  ALL: '全部',
  LIKE: '赞',
  COMMENT: '评论',
  FOLLOW: '关注',
  SYSTEM: '系统',
  MESSAGE: '私信',
};

export default function NotificationsPage() {
  return (
    <AuthGuard>
      <NotificationsContent />
    </AuthGuard>
  );
}

function NotificationsContent() {
  const { user } = useAuthStore();
  const isAdmin = user?.role !== 'USER';
  const { clearUnread, decrementUnread } = useNotificationStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  const [adminItems, setAdminItems] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const [notifRes, reviewsRes, reportsRes] = await Promise.all([
          apiClient.get('/notifications'),
          isAdmin ? apiClient.get('/posts/reviews/queue?limit=20') : Promise.resolve(null),
          isAdmin ? apiClient.get('/posts/reports/list?limit=20') : Promise.resolve(null),
        ]);
        if (notifRes.data.success) {
          setNotifications(notifRes.data.data || []);
        }
        // 构建管理通知列表
        if (isAdmin) {
          const items: any[] = [];
          const reviews = (reviewsRes?.data?.data || []).filter((r: any) => r.status === 'FLAGGED');
          const reports = (reportsRes?.data?.data || []).filter((r: any) => r.status === 'PENDING');
          reviews.forEach((r: any) => {
            items.push({
              id: `review-${r.id}`,
              type: 'REVIEW',
              message: `内容待审核`,
              detail: r.post?.content?.slice(0, 50) || '(无内容)',
              postId: r.postId,
              createdAt: r.createdAt,
              isRead: false,
            });
          });
          reports.forEach((r: any) => {
            items.push({
              id: `report-${r.id}`,
              type: 'REPORT',
              message: `收到新举报：${r.reason || '违规内容'}`,
              detail: r.detail?.slice(0, 50) || '',
              postId: r.postId,
              createdAt: r.createdAt,
              isRead: false,
            });
          });
          // 按时间倒序
          items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setAdminItems(items);
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [user, isAdmin]);

  const handleMarkAllRead = async () => {
    try {
      await apiClient.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      clearUnread();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      decrementUnread();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const filteredNotifications =
    activeTab === 'ALL'
      ? notifications
      : notifications.filter((n) => n.type === activeTab);

  if (!mounted || !user) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{mounted ? '请先登录' : ''}</p>
      </div>
    );
  }

  // 管理员/审核员 — 管理通知
  if (isAdmin) {
    const adminIconMap: Record<string, any> = { REVIEW: Shield, REPORT: Flag };
    const adminIconColor: Record<string, string> = {
      REVIEW: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30',
      REPORT: 'text-red-500 bg-red-100 dark:bg-red-900/30',
    };
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">系统通知</h1>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <div className="rounded-lg border bg-card">
            {adminItems.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-muted-foreground">
                <Bell className="h-8 w-8 opacity-30 mb-2" />
                <p className="text-sm">暂无待处理事项</p>
              </div>
            ) : (
              <div>
                {adminItems.map((item: any, idx: number) => {
                  const Icon = adminIconMap[item.type] || Info;
                  const colorClass = adminIconColor[item.type] || '';
                  const link = item.type === 'REVIEW' ? '/admin/reviews' : '/admin/reports';
                  return (
                    <div key={item.id}>
                      {idx > 0 && <Separator />}
                      <Link href={link} className="flex items-start gap-3 p-4 transition-colors hover:bg-muted/50">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm">{item.message}</p>
                          {item.detail && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{item.detail}</p>}
                          <p className="mt-0.5 text-xs text-muted-foreground">{formatTime(item.createdAt)}</p>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // 普通用户 — 原通知列表
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">通知</h1>
        </div>
        <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
          全部标为已读
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line" className="w-full justify-start overflow-x-auto">
          {Object.entries(typeLabels).map(([key, label]) => (
            <TabsTrigger key={key} value={key}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="rounded-lg border bg-card">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">暂无通知</div>
            ) : (
              <div>
                {filteredNotifications.map((notif: any, idx: number) => {
                  const Icon = iconMap[notif.type] || Info;
                  const colorClass = iconColors[notif.type] || 'text-muted-foreground bg-muted';
                  const link = notif.postId
                    ? `/post/${notif.postId}`
                    : notif.sender
                      ? `/profile/${notif.sender.username}`
                      : '#';

                  return (
                    <div key={notif.id}>
                      {idx > 0 && <Separator />}
                      <Link
                        href={link}
                        className={cn(
                          'flex items-start gap-3 p-4 transition-colors hover:bg-muted/50',
                          !notif.isRead && 'bg-primary/5'
                        )}
                        onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                      >
                        {/* 图标 */}
                        <div className={cn('flex h-9 w-9 items-center justify-center rounded-full', colorClass)}>
                          <Icon className="h-4 w-4" />
                        </div>

                        {/* 内容 */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-2">
                            {notif.sender && (
                              <Avatar className="h-6 w-6 flex-shrink-0">
                                <AvatarImage src={notif.sender.avatarUrl} alt={notif.sender.displayName} />
                                <AvatarFallback>{notif.sender.displayName[0]}</AvatarFallback>
                              </Avatar>
                            )}
                            <div>
                              <p className="text-sm text-foreground">{notif.message}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {new Date(notif.createdAt).toLocaleString('zh-CN')}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 未读标记 */}
                        {!notif.isRead && (
                          <div className="h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                        )}
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
