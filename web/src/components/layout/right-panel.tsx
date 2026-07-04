'use client';

import Link from 'next/link';
import { TrendingUp, Users, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useUIStore } from '@/stores/ui-store';
import { mockUsers } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const hotTopics = [
  { tag: '黄山VR全景', count: 1520 },
  { tag: '故宫翻译', count: 980 },
  { tag: '张家界360', count: 890 },
  { tag: '桂林空间视频', count: 756 },
  { tag: '长城记录', count: 650 },
];

const suggestLinks = [
  { title: 'VR旅游攻略', url: '#' },
  { title: '拍摄技巧分享', url: '#' },
  { title: '设备推荐指南', url: '#' },
  { title: '徐霞客游记原文', url: '#' },
];

export function RightPanel() {
  const { rightPanelOpen } = useUIStore();

  return (
    <aside
      className={cn(
        'sticky top-14 hidden h-[calc(100vh-3.5rem)] w-72 flex-shrink-0 overflow-y-auto border-l bg-muted/50 p-4',
        'lg:block',
        !rightPanelOpen && 'hidden'
      )}
    >
      <div className="space-y-4">
        {/* 热门话题 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              热门话题
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {hotTopics.map((topic) => (
                <Link
                  key={topic.tag}
                  href={`/search?q=${encodeURIComponent(topic.tag)}`}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-gray-100"
                >
                  <span className="text-gray-700"># {topic.tag}</span>
                  <span className="text-xs text-gray-400">{topic.count}次浏览</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 推荐用户 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-green-500" />
              推荐用户
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockUsers
                .filter((u) => u.username !== 'xuxiake')
                .map((user) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.username}`}
                    className="flex items-center gap-3 rounded-lg p-1 hover:bg-gray-100"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                      <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{user.displayName}</p>
                      <p className="truncate text-xs text-gray-500">{user.bio}</p>
                    </div>
                  </Link>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* 推荐链接 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ExternalLink className="h-4 w-4 text-purple-500" />
              推荐链接
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {suggestLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.url}
                  className="block rounded-lg px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 页脚 */}
        <div className="px-2 text-xs text-gray-400">
          <Separator className="mb-3" />
          <p>徐霞客系统 © 2026</p>
          <p className="mt-1">用VR记录旅程，让世界触手可及 🌍</p>
        </div>
      </div>
    </aside>
  );
}
