'use client';

import { useState, useEffect } from 'react';
import { Video, Image, Mic, Link2, Languages, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';

const mediaButtons = [
  { type: 'VIDEO', label: 'VR视频', icon: Video, color: 'text-blue-500 hover:bg-blue-50' },
  { type: 'IMAGE', label: 'VR图片', icon: Image, color: 'text-green-500 hover:bg-green-50' },
  { type: 'AUDIO', label: '音频', icon: Mic, color: 'text-purple-500 hover:bg-purple-50' },
  { type: 'LINK', label: '链接', icon: Link2, color: 'text-orange-500 hover:bg-orange-50' },
  { type: 'TRANSLATION', label: '翻译', icon: Languages, color: 'text-cyan-500 hover:bg-cyan-50' },
];

export function PostComposer() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [content, setContent] = useState('');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = () => {
    // 模拟发布
    setContent('');
    setExpanded(false);
  };

  // SSR 和首次客户端渲染均显示骨架屏，避免 hydration 不匹配
  if (!mounted || !user) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="h-10 animate-pulse rounded-md bg-gray-100" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={user.avatarUrl} alt={user.displayName} />
            <AvatarFallback>{user.displayName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder={`${user.displayName}，今天用VR眼镜记录了什么？`}
              className="min-h-[40px] resize-none border-0 bg-gray-100 p-3 text-sm focus-visible:ring-0"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setExpanded(true)}
            />
            {expanded && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {mediaButtons.map((btn) => {
                    const Icon = btn.icon;
                    return (
                      <Button
                        key={btn.type}
                        variant="ghost"
                        size="sm"
                        className={`gap-1.5 text-xs ${btn.color}`}
                      >
                        <Icon className="h-4 w-4" />
                        {btn.label}
                      </Button>
                    );
                  })}
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    className="gap-1.5 bg-blue-600 hover:bg-blue-700"
                    disabled={!content.trim()}
                    onClick={handleSubmit}
                  >
                    <Send className="h-4 w-4" />
                    发布
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
