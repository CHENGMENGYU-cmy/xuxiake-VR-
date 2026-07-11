'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  User,
  Users,
  Upload,
  Compass,
  Bookmark,
  Settings,
  Video,
  Image,
  Music,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { mockUsers } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/feed', label: '首页', icon: Home },
  { href: '/explore', label: '探索发现', icon: Compass },
  { href: '/upload', label: '上传内容', icon: Upload },
  { href: '/messages', label: '消息', icon: Users },
  { href: '/notifications', label: '通知', icon: Bookmark },
  { href: '/settings', label: '设置', icon: Settings },
];

const mediaTypes = [
  { href: '/search?type=VIDEO', label: 'VR视频', icon: Video, color: 'text-teal-500' },
  { href: '/search?type=IMAGE', label: 'VR图片', icon: Image, color: 'text-orange-500' },
  { href: '/search?type=AUDIO', label: '音频记录', icon: Music, color: 'text-teal-400' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { sidebarOpen } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => useUIStore.getState().setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={cn(
          'fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-64 transform border-r bg-card transition-transform duration-200 ease-in-out',
          'lg:sticky lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <ScrollArea className="h-full">
          {/* 用户信息卡片 */}
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

          {/* 主导航 */}
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
                  </Button>
                </Link>
              );
            })}
          </div>

          <Separator />

          {/* 媒体类型快捷入口 */}
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

          {/* 推荐关注 */}
          {mounted && user && (
            <div className="space-y-1 p-3">
              <p className="px-2 text-xs font-medium uppercase text-muted-foreground">
                推荐关注
              </p>
              {mockUsers.filter((u) => u.id !== user.id).map((u) => (
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
          )}
        </ScrollArea>
      </aside>
    </>
  );
}
