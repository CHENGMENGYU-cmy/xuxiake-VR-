'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Bell,
  Settings,
  MessageCircle,
  Shield,
  Flag,
  Users,
  TrendingUp,
  Camera,
  Compass,
  FolderOpen,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { useChatStore } from '@/stores/chat-store';
import { useNotificationStore } from '@/stores/notification-store';
import { cn } from '@/lib/utils';

// 浏览
const browseItems = [
  { href: '/feed', label: '首页', icon: Home },
  { href: '/discover', label: '发现', icon: Compass },
];

// 我的
const myItems = [
  { href: '/snap', label: '素材库', icon: Camera, color: 'text-orange-500' },
  { href: '/my/works', label: '我的作品', icon: FolderOpen, color: 'text-indigo-500' },
];

// 个人
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
  const isAdmin = !!(mounted && user && user.role && user.role !== 'USER');

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
                  href={isAdmin ? '/admin/dashboard' : `/profile/${user.username}`}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                    <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{user.displayName}</p>
                      {user.role === 'ADMIN' && (
                        <Badge className="h-4 px-1 text-[10px] bg-red-500">管理员</Badge>
                      )}
                      {user.role === 'MODERATOR' && (
                        <Badge className="h-4 px-1 text-[10px] bg-amber-500">审核员</Badge>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                </Link>
              </div>
            )}

            <Separator />

            {/* 浏览发现 — 仅普通用户显示 */}
            {!isAdmin && (
              <>
                <div className="space-y-1 p-3">
                  <p className="px-2 text-xs font-medium uppercase text-muted-foreground">浏览</p>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link key={item.href} href={item.href}>
                        <Button variant="ghost" className={cn('w-full justify-start gap-3', isActive && 'bg-primary/10 text-primary hover:bg-primary/10')}>
                          <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                          <span>{item.label}</span>
                        </Button>
                      </Link>
                    );
                  })}
                </div>
                <Separator />
              </>
            )}

            {/* 我的内容 — 仅普通用户显示 */}
            {!isAdmin && (
              <>
                <div className="space-y-1 p-3">
                  <p className="px-2 text-xs font-medium uppercase text-muted-foreground">
                    我的内容
                  </p>
                  {contentItems.map((item) => {
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
              </>
            )}

            {/* 管理中心 — 管理员/审核员核心区域 */}
            {isAdmin && (
              <div className="space-y-1 p-3">
                <p className="px-2 text-xs font-medium uppercase text-amber-600 dark:text-amber-400">
                  管理中心
                </p>
                <Link href="/admin/dashboard">
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start gap-3',
                      pathname === '/admin/dashboard' && 'bg-primary/10 text-primary'
                    )}
                  >
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span>仪表板</span>
                  </Button>
                </Link>
                <Link href="/admin/reviews">
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start gap-3',
                      pathname.startsWith('/admin/reviews') && !pathname.startsWith('/admin/reports') && 'bg-primary/10 text-primary'
                    )}
                  >
                    <Shield className="h-5 w-5 text-amber-500" />
                    <span>审核队列</span>
                  </Button>
                </Link>
                <Link href="/admin/reports">
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start gap-3',
                      pathname.startsWith('/admin/reports') && 'bg-primary/10 text-primary'
                    )}
                  >
                    <Flag className="h-5 w-5 text-red-500" />
                    <span>举报管理</span>
                  </Button>
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link href="/admin/users">
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start gap-3',
                        pathname === '/admin/users' && 'bg-primary/10 text-primary'
                      )}
                    >
                      <Users className="h-5 w-5 text-blue-500" />
                      <span>用户管理</span>
                    </Button>
                  </Link>
                )}
              </div>
            )}

            <Separator />

            {/* 创作 — 仅普通用户显示 */}
            {!isAdmin && mounted && user && (
              <div className="space-y-1 p-3">
                <p className="px-2 text-xs font-medium uppercase text-muted-foreground">
                  创作
                </p>
                <Link href="/upload">
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start gap-3',
                      (pathname === '/upload' || pathname.startsWith('/upload/')) && 'bg-primary/10 text-primary hover:bg-primary/10'
                    )}
                  >
                    <Upload className="h-5 w-5" />
                    <span>分享见闻</span>
                  </Button>
                </Link>
                <Link href="/snap">
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start gap-3',
                      pathname.startsWith('/snap/generate') && 'bg-primary/10 text-primary hover:bg-primary/10'
                    )}
                  >
                    <Sparkles className="h-5 w-5 text-teal-500" />
                    <span>AI 日记</span>
                  </Button>
                </Link>
              </div>
            )}

            {/* 个人中心 - 仅登录后显示 */}
            {mounted && user && (
            <div className="space-y-1 px-3 pb-3">
              <p className="px-2 text-xs font-medium uppercase text-muted-foreground">
                个人
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
