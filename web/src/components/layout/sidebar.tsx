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
  Radio,
  FolderOpen,
  PenLine,
  Camera,
  BookOpen,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { useChatStore } from '@/stores/chat-store';
import { useNotificationStore } from '@/stores/notification-store';
import { cn } from '@/lib/utils';

// 顶部导航
const navItems = [
  { href: '/feed', label: '首页', icon: Home },
  { href: '/explore', label: '探索发现', icon: Compass },
  { href: '/topics', label: '话题广场', icon: Hash },
  { href: '/discover', label: '找搭子', icon: UserPlus },
  { href: '/upload', label: '分享见闻', icon: Upload },
];

// 第一视角
const mediaItems = [
  { href: '/media?type=VIDEO', label: '瞬间捕获', icon: Video, color: 'text-teal-500' },
  { href: '/media?type=IMAGE', label: '影像集', icon: Image, color: 'text-orange-500' },
  { href: '/media?type=AUDIO', label: '语音记录', icon: Music, color: 'text-teal-400' },
  { href: '/live', label: '直播', icon: Radio, color: 'text-red-500', badge: '即将上线' },
];

// 个人中心
const personalItems = [
  { href: '/messages', label: '消息', icon: MessageCircle },
  { href: '/notifications', label: '通知', icon: Bell },
  { href: '/settings', label: '设置', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { sidebarOpen } = useUIStore();
  const totalUnread = useChatStore((s) => s.totalUnread);
  const notifUnreadCount = useNotificationStore((s) => s.unreadCount);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
          'lg:relative lg:top-0 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-full overflow-y-auto">
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

            {/* 顶部导航 */}
            <div className="space-y-1 p-3">
              {navItems.filter((item) => user || item.href !== '/upload').map((item) => {
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
                    </Button>
                  </Link>
                );
              })}
            </div>

            <Separator />

            {/* 第一视角 */}
            <div className="space-y-1 p-3">
              <p className="px-2 text-xs font-medium uppercase text-muted-foreground">
                第一视角
              </p>
              {mediaItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button variant="ghost" className="w-full justify-start gap-3">
                      <Icon className={cn('h-5 w-5', item.color)} />
                      <span className="text-sm">{item.label}</span>
                      {'badge' in item && item.badge && (
                        <span className="ml-auto rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-500">
                          {item.badge}
                        </span>
                      )}
                    </Button>
                  </Link>
                );
              })}
            </div>

            <Separator />

            {/* 内容层级: 瞬间捕获 → 分类 → 日记 → 游记 */}
            <div className="space-y-1 p-3">
              <p className="px-2 text-xs font-medium uppercase text-muted-foreground">
                内容体系
              </p>
              {[
                { href: '/media', label: '瞬间捕获', icon: Camera, color: 'text-teal-500' },
                { href: '/classified', label: '内容分类', icon: FolderOpen, color: 'text-amber-500' },
                { href: '/diaries', label: '我的日记', icon: PenLine, color: 'text-indigo-500' },
                { href: '/journeys', label: '游记散文', icon: BookOpen, color: 'text-primary' },
              ].map((item) => {
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
                      <Icon className={cn('h-5 w-5', item.color, isActive && 'text-primary')} />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>

            <Separator />

            {/* 个人中心 - 仅登录后显示 */}
            {mounted && user && (
            <div className="space-y-1 p-3">
              <p className="px-2 text-xs font-medium uppercase text-muted-foreground">
                个人中心
              </p>
              {personalItems.map((item) => {
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
            )}

          </div>
        </div>
      </aside>
    </>
  );
}
