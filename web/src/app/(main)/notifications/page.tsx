import Link from 'next/link';
import { Bell, Heart, MessageCircle, UserPlus, Info, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { mockNotifications } from '@/lib/mock-data';
import { Notification } from '@/types';
import { cn } from '@/lib/utils';

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

export default function NotificationsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">通知</h1>
        </div>
        <Button variant="outline" size="sm">
          全部标为已读
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        {mockNotifications.length === 0 ? (
          <div className="py-12 text-center text-gray-400">暂无通知</div>
        ) : (
          <div>
            {mockNotifications.map((notif: Notification, idx: number) => {
              const Icon = iconMap[notif.type] || Info;
              const colorClass = iconColors[notif.type] || 'text-gray-500 bg-gray-50';
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
                      'flex items-start gap-3 p-4 transition-colors hover:bg-gray-50',
                      !notif.isRead && 'bg-blue-50/50'
                    )}
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
                          <p className="text-sm text-gray-800">{notif.message}</p>
                          <p className="mt-0.5 text-xs text-gray-400">{notif.createdAt}</p>
                        </div>
                      </div>
                    </div>

                    {/* 未读标记 */}
                    {!notif.isRead && (
                      <div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-600" />
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
