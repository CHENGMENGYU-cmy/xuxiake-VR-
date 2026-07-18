'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, UserPlus, Info, MessageSquare, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotificationStore } from '@/stores/notification-store';
import apiClient from '@/lib/api-client';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
  LIKE: Heart,
  COMMENT: MessageCircle,
  FOLLOW: UserPlus,
  SYSTEM: Info,
  MESSAGE: MessageSquare,
};

const iconColors: Record<string, string> = {
  LIKE: 'text-red-500 bg-red-50 dark:bg-red-900/20',
  COMMENT: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  FOLLOW: 'text-teal-500 bg-teal-50 dark:bg-teal-900/20',
  SYSTEM: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
  MESSAGE: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}天前`;
  return new Date(dateStr).toLocaleDateString('zh-CN');
}

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setUnreadCount, clearUnread } = useNotificationStore();

  useEffect(() => {
    apiClient
      .get('/notifications')
      .then((res) => {
        if (res.data?.success) {
          setNotifications((res.data.data || []).slice(0, 10));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await apiClient.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      clearUnread();
    } catch {}
  };

  const handleMarkRead = async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount(Math.max(0, useNotificationStore.getState().unreadCount - 1));
    } catch {}
  };

  return (
    <div className="w-80">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-semibold">通知</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground"
          onClick={handleMarkAllRead}
        >
          <Check className="mr-1 h-3 w-3" />
          全部已读
        </Button>
      </div>
      <Separator />

      <ScrollArea className="max-h-96">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">暂无通知</div>
        ) : (
          notifications.map((notif) => {
            const Icon = iconMap[notif.type] || Info;
            const colorClass = iconColors[notif.type] || 'text-muted-foreground bg-muted';
            const link = notif.postId
              ? `/post/${notif.postId}`
              : notif.sender
                ? `/profile/${notif.sender.username}`
                : '#';

            return (
              <Link
                key={notif.id}
                href={link}
                className={cn(
                  'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50',
                  !notif.isRead && 'bg-primary/5'
                )}
                onClick={() => {
                  if (!notif.isRead) handleMarkRead(notif.id);
                  onClose();
                }}
              >
                <div
                  className={cn(
                    'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full',
                    colorClass
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    {notif.sender && (
                      <Avatar className="h-6 w-6 flex-shrink-0">
                        <AvatarImage src={notif.sender.avatarUrl} alt={notif.sender.displayName} />
                        <AvatarFallback className="text-[10px]">
                          {notif.sender.displayName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">{notif.message}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {timeAgo(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
                {!notif.isRead && (
                  <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                )}
              </Link>
            );
          })
        )}
      </ScrollArea>

      <Separator />
      <Link
        href="/notifications"
        className="block py-2.5 text-center text-xs font-medium text-primary transition-colors hover:bg-muted/50"
        onClick={onClose}
      >
        查看全部通知
      </Link>
    </div>
  );
}
