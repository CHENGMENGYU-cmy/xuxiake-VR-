'use client';

import Link from 'next/link';
import { Camera, PenLine, BookOpen, Settings, ChevronRight, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AuthGuard } from '@/components/auth-guard';
import { useAuthStore } from '@/stores/auth-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function MyPage() {
  return (
    <AuthGuard>
      <MyContent />
    </AuthGuard>
  );
}

function MyContent() {
  const { user } = useAuthStore();

  const sections = [
    { href: '/snap', label: '素材库', desc: '闪拍与日志素材', icon: Camera, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30' },
    { href: '/diaries', label: '我的日记', desc: '情感反思文章', icon: PenLine, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30' },
    { href: '/journeys', label: '我的游记', desc: 'AI 综合生成的游记', icon: BookOpen, color: 'text-primary bg-primary/10' },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* 用户信息 */}
      <div className="flex items-center gap-4 rounded-2xl border bg-card p-5">
        <Avatar className="h-14 w-14">
          <AvatarImage src={user?.avatarUrl} alt={user?.displayName} />
          <AvatarFallback>{user?.displayName?.[0]}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{user?.displayName}</p>
          <p className="text-xs text-muted-foreground">@{user?.username}</p>
        </div>
        <Link href={`/profile/${user?.username}`} className="text-xs text-muted-foreground hover:text-foreground">
          查看主页
        </Link>
      </div>

      {/* 我的内容 */}
      <div>
        <h2 className="mb-3 px-1 text-sm font-semibold text-muted-foreground">我的内容</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {sections.map(({ href, label, desc, icon: Icon, color }) => (
            <Link key={href} href={href}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col items-center gap-2 p-5 text-center">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* 设置 */}
      <Link href="/settings">
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Settings className="h-4 w-4 text-muted-foreground" />
              </span>
              <div>
                <p className="text-sm font-medium">设置</p>
                <p className="text-[11px] text-muted-foreground">账号、隐私与通知偏好</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
