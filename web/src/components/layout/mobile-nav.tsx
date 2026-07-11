'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Upload, MessageCircle, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockNotifications } from '@/lib/mock-data';

const navItems = [
  { href: '/feed', label: '首页', icon: Home },
  { href: '/search', label: '搜索', icon: Search },
  { href: '/upload', label: '上传', icon: Upload },
  { href: '/messages', label: '消息', icon: MessageCircle },
  { href: '/notifications', label: '通知', icon: Bell },
];

export function MobileNav() {
  const pathname = usePathname();
  const unreadNotif = mockNotifications.filter((n) => !n.isRead).length;

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
              {item.label === '消息' && (
                <span className="absolute -right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent text-[9px] text-white">
                  2
                </span>
              )}
              {item.label === '通知' && unreadNotif > 0 && (
                <span className="absolute -right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent text-[9px] text-white">
                  {unreadNotif}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
