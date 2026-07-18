'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Heart, MessageCircle, UserPlus, Info, MessageSquare, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Notification } from '@/types';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationStore } from '@/stores/notification-store';

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
  const { user } = useAuthStore();
  const { clearUnread, decrementUnread } = useNotificationStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const res = await apiClient.get('/notifications');
        if (res.data.success) {
          setNotifications(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

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
