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
  Sparkles,
  Radio,
  Route,
  Map,
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
import apiClient from '@/lib/api-client';
import { getRecommendedUsers } from '@/lib/social-api';
import type { RecommendedUser } from '@/types';

// 内容发现
const discoverItems = [
  { href: '/feed', label: '首页', icon: Home },
  { href: '/explore', label: '探索发现', icon: Compass },
  { href: '/topics', label: '话题广场', icon: Hash },
  { href: '/discover', label: '发现好友', icon: UserPlus },
];

// 媒体广场
const mediaTypes = [
  { href: '/media?type=VIDEO', label: '旅行视频', icon: Video, color: 'text-teal-500' },
  { href: '/media?type=IMAGE', label: '旅行图片', icon: Image, color: 'text-orange-500' },
  { href: '/media?type=AUDIO', label: '音频记录', icon: Music, color: 'text-teal-400' },
  { href: '/live', label: '直播', icon: Radio, color: 'text-red-500', badge: '即将上线' },
];

// 旅行工具
const travelTools = [
  { href: '/routes', label: '路线', icon: Route, color: 'text-primary' },
  { href: '/journeys', label: '旅程', icon: Map, color: 'text-teal-500' },
  { href: '/guides', label: '攻略', icon: BookOpen, color: 'text-orange-500' },
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
  const [suggestedUsers, setSuggestedUsers] = useState<RecommendedUser[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      getRecommendedUsers(1, 20).then((res) => {
        const all = res.data || [];
        const picked = [...all].sort(() => Math.random() - 0.5).slice(0, 3);
        setSuggestedUsers(picked);
      }).catch(() => {
        apiClient.get('/users/suggested/list').then((res) => {
          if (res.data?.success) {
            const all = res.data.data || [];
            const picked = [...all].sort(() => Math.random() - 0.5).slice(0, 3);
            setSuggestedUsers(picked);
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

            {/* 内容发现 */}
            <div className="space-y-1 p-3">
              <p className="px-2 text-xs font-medium uppercase text-muted-foreground">
                内容发现
              </p>
              {discoverItems.map((item) => {
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

            {/* 媒体广场 */}
            <div className="space-y-1 p-3">
              <p className="px-2 text-xs font-medium uppercase text-muted-foreground">
                媒体广场
              </p>
              {mediaTypes.map((item) => {
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

            {/* 创作中心 */}
            <div className="space-y-1 p-3">
              <p className="px-2 text-xs font-medium uppercase text-muted-foreground">
                创作中心
              </p>
              <Link href="/upload">
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-3',
                    pathname === '/upload' && 'bg-primary/10 text-primary hover:bg-primary/10'
                  )}
                >
                  <Upload className={cn('h-5 w-5', pathname === '/upload' && 'text-primary')} />
                  <span>上传内容</span>
                </Button>
              </Link>
            </div>

            <Separator />

            {/* 个人中心 */}
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

            <Separator />

            {mounted && user && suggestedUsers.length > 0 && (
              <div className="p-3">
                <p className="px-2 pb-1 text-xs font-medium uppercase text-muted-foreground">
                  推荐关注
                </p>
                <div className="space-y-1">
                  {suggestedUsers.map((u) => (
                    <Link key={u.id} href={`/profile/${u.username}`}>
                      <div className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.avatarUrl} alt={u.displayName} />
                          <AvatarFallback>{u.displayName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{u.displayName}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {u.matchReasons?.length ? u.matchReasons[0] : (u.bio || `@${u.username}`)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
