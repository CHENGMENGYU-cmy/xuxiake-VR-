'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Upload, MessageCircle, User, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useChatStore } from '@/stores/chat-store';
import { useNotificationStore } from '@/stores/notification-store';

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const totalUnread = useChatStore((s) => s.totalUnread);
  const notifUnreadCount = useNotificationStore((s) => s.unreadCount);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { href: '/feed', label: '首页', icon: Home },
    ...(user ? [
      { href: '/discover', label: '发现', icon: Compass },
      { href: '/upload', label: '发布', icon: Upload },
      { href: '/messages', label: '消息', icon: MessageCircle },
      { href: '/my', label: '我的', icon: User },
    ] : [
      { href: '/login', label: '登录', icon: LogIn },
    ]),
  ];

  // 未挂载时渲染固定内容（避免 hydration mismatch）
  if (!mounted) {
    return (
      <nav className="fixed bottom-0 z-50 w-full border-t bg-card lg:hidden">
        <div className="flex h-14 items-center justify-around">
          {[
            { href: '/feed', label: '首页', icon: Home },
            { href: '/login', label: '登录', icon: LogIn },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center gap-0.5 text-muted-foreground"
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 z-50 w-full border-t bg-card lg:hidden">
      <div className="flex h-14 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
              {item.label === '消息' && totalUnread > 0 && (
                <span className="absolute -right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent text-[9px] text-white">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
              {item.label === '通知' && notifUnreadCount > 0 && (
                <span className="absolute -right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent text-[9px] text-white">
                  {notifUnreadCount > 99 ? '99+' : notifUnreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
