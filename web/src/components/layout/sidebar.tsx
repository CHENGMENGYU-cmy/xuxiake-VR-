'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Upload,
  Compass,
  Bell,
  Settings,
  Video,
  Image,
  Music,
  UserPlus,
  MessageCircle,
  Hash,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { useChatStore } from '@/stores/chat-store';
import { useNotificationStore } from '@/stores/notification-store';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api-client';
import { getRecommendedUsers } from '@/lib/social-api';

const navItems = [
  { href: '/feed', label: '首页', icon: Home },
  { href: '/explore', label: '探索发现', icon: Compass },
  { href: '/topics', label: '话题广场', icon: Hash },
  { href: '/discover', label: '发现好友', icon: UserPlus },
  { href: '/upload', label: '上传内容', icon: Upload },
  { href: '/messages', label: '消息', icon: MessageCircle },
  { href: '/notifications', label: '通知', icon: Bell },
  { href: '/settings', label: '设置', icon: Settings },
];

const mediaTypes = [
  { href: '/media?type=VIDEO', label: 'AR视频', icon: Video, color: 'text-teal-500' },
  { href: '/media?type=IMAGE', label: 'AR图片', icon: Image, color: 'text-orange-500' },
  { href: '/media?type=AUDIO', label: '音频记录', icon: Music, color: 'text-teal-400' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { sidebarOpen } = useUIStore();
  const totalUnread = useChatStore((s) => s.totalUnread);
  const notifUnreadCount = useNotificationStore((s) => s.unreadCount);
  const [mounted, setMounted] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      getRecommendedUsers(1, 10).then((res) => {
        setSuggestedUsers(res.data || []);
      }).catch(() => {
        apiClient.get('/users/suggested/list').then((res) => {
          if (res.data?.success) {
            setSuggestedUsers(res.data.data || []);
          }
        }).catch(() => {});
      });
    }
  }, [user]);

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => useUIStore.getState().setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-64 transform border-r bg-card transition-transform duration-200 ease-in-out',
          'lg:sticky lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <ScrollArea className="h-full">
          <div className="flex flex-col">
            {mounted && user && (
              <div className="space-y-1 p-3">
                <Link
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                    <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{user.displayName}</p>
                    <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                </Link>
              </div>
            )}

            <Separator />

            <div className="space-y-1 p-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start gap-3',
                        isActive && 'bg-primary/10 text-primary hover:bg-primary/10'
                      )}
                    >
                      <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                      <span>{item.label}</span>
                      {item.label === '消息' && totalUnread > 0 && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] text-white">
                          {totalUnread > 99 ? '99+' : totalUnread}
                        </span>
                      )}
                      {item.label === '通知' && notifUnreadCount > 0 && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] text-white">
                          {notifUnreadCount > 99 ? '99+' : notifUnreadCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                );
              })}
            </div>

            <Separator />

            <div className="space-y-1 p-3">
              <p className="px-2 text-xs font-medium uppercase text-muted-foreground">
                内容分类
              </p>
              {mediaTypes.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button variant="ghost" className="w-full justify-start gap-3">
                      <Icon className={cn('h-5 w-5', item.color)} />
                      <span className="text-sm">{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>

            <Separator />

            {mounted && user && suggestedUsers.length > 0 && (
              <div className="p-3">
                <p className="px-2 pb-1 text-xs font-medium uppercase text-muted-foreground">
                  推荐关注
                </p>
                <div className="space-y-1">
                  {suggestedUsers.map((u) => (
                    <Link key={u.id} href={`/profile/${u.username}`}>
                      <Button variant="ghost" className="w-full justify-start gap-3">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={u.avatarUrl} alt={u.displayName} />
                          <AvatarFallback>{u.displayName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1 text-left">
                          <p className="truncate text-sm">{u.displayName}</p>
                          <p className="truncate text-xs text-muted-foreground">@{u.username}</p>
                        </div>
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
