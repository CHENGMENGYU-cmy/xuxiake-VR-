'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Search,
  Home,
  MessageCircle,
  Bell,
  Menu,
  LogOut,
  Settings,
  User,
  Compass,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { useSearchStore } from '@/stores/search-store';
import { useChatStore } from '@/stores/chat-store';
import { useNotificationStore } from '@/stores/notification-store';
import { connectChat } from '@/lib/chat-socket';
import apiClient from '@/lib/api-client';
import { SearchSuggestions } from '@/components/search/search-suggestions';
import { NotificationDropdown } from '@/components/notifications/notification-dropdown';

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const { query: searchQuery, setQuery: setSearchQuery } = useSearchStore();
  const totalUnread = useChatStore((s) => s.totalUnread);
  const setTotalUnread = useChatStore((s) => s.setTotalUnread);
  const notifUnreadCount = useNotificationStore((s) => s.unreadCount);
  const setNotifUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 加载未读消息数 + WebSocket实时更新
  useEffect(() => {
    if (!user) return;
    apiClient.get('/conversations?status=NORMAL').then((res) => {
      if (res.data?.success) {
        const total = (res.data.data || []).reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0);
        setTotalUnread(total);
      }
    }).catch(() => {});
    const socket = connectChat(user.id);
    const handleNewMessage = () => {
      apiClient.get('/conversations?status=NORMAL').then((res) => {
        if (res.data?.success) {
          const total = (res.data.data || []).reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0);
          setTotalUnread(total);
        }
      }).catch(() => {});
    };
    socket.on('chat:message:new', handleNewMessage);
    return () => { socket.off('chat:message:new', handleNewMessage); };
  }, [user, setTotalUnread]);

  // 加载未读通知数 + WebSocket实时更新
  useEffect(() => {
    if (!user) return;
    apiClient.get('/notifications/unread-count').then((res) => {
      if (res.data?.success) {
        setNotifUnreadCount(res.data.data?.count || 0);
      }
    }).catch(() => {});
    const socket = connectChat(user.id);
    const handleNewNotification = (data: any) => {
      setNotifUnreadCount(data.unreadCount ?? notifUnreadCount + 1);
    };
    socket.on('notification:new', handleNewNotification);
    return () => { socket.off('notification:new', handleNewNotification); };
  }, [user, setNotifUnreadCount]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push('/search');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (value: string) => {
    setSearchQuery(value);
    router.push('/search');
    setShowSuggestions(false);
  };

  const handleLogout = () => {
    const confirmed = window.confirm('是否确定退出登录？');
    if (confirmed) {
      logout();
      router.push('/login');
    } else {
      window.location.reload();
    }
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* 左侧：Logo + 菜单按钮 */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/feed" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-brand">
              <span className="text-lg font-bold text-white">徐</span>
            </div>
            <span className="hidden text-xl font-bold text-gradient-brand sm:block">
              徐霞客
            </span>
          </Link>
        </div>

        {/* 中间：搜索框 */}
        <form onSubmit={handleSearch} className="hidden flex-1 justify-center px-6 md:flex">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索徐霞客系统..."
              className="w-full rounded-full border-muted bg-muted pl-10 focus:bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
            />
            {showSuggestions && (
              <SearchSuggestions
                query={searchQuery}
                onSelect={handleSuggestionSelect}
                onClose={() => setShowSuggestions(false)}
              />
            )}
          </div>
        </form>

        {/* 右侧：导航图标 + 用户菜单 */}
        <div className="flex items-center gap-1">
          {/* 首页 */}
          <Link href="/feed">
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
              <Home className="h-5 w-5" />
            </Button>
          </Link>

          {/* 上传 */}
          <Link href="/upload">
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
              <Upload className="h-5 w-5" />
            </Button>
          </Link>

          {/* 探索 */}
          <Link href="/explore">
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
              <Compass className="h-5 w-5" />
            </Button>
          </Link>

          {/* 消息 */}
          <Link href="/messages">
            <Button variant="ghost" size="icon" className="relative">
              <MessageCircle className="h-5 w-5" />
              {totalUnread > 0 && (
                <Badge className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-accent px-0.5 text-[10px]">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </Badge>
              )}
            </Button>
          </Link>

          {/* 通知 */}
          <DropdownMenu open={showNotifDropdown} onOpenChange={setShowNotifDropdown}>
            <DropdownMenuTrigger className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent">
              <Bell className="h-5 w-5" />
              {notifUnreadCount > 0 && (
                <Badge className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-accent px-0.5 text-[10px]">
                  {notifUnreadCount > 99 ? '99+' : notifUnreadCount}
                </Badge>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="p-0">
              <NotificationDropdown onClose={() => setShowNotifDropdown(false)} />
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 用户菜单 带有人物头像的 */}
          {user && mounted && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent"
                openOnHover
                delay={200}
                closeDelay={150}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                  <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold">{user.displayName}</span>
                      <span className="text-xs text-muted-foreground">@{user.username}</span>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/profile/${user.username}`)}>
                  <User className="mr-2 h-4 w-4" />
                  个人主页
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  设置
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
}
