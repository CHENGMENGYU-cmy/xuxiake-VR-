'use client';

import { useState, useEffect } from 'react';
import { Video, Image, Mic, Link2, Languages, Send, AlertCircle, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import { usePostStore } from '@/stores/post-store';

const MAX_CONTENT_LENGTH = 500;

const mediaButtons = [
  { type: 'VIDEO', label: 'VR视频', icon: Video, color: 'text-blue-500 hover:bg-blue-50' },
  { type: 'IMAGE', label: 'VR图片', icon: Image, color: 'text-green-500 hover:bg-green-50' },
  { type: 'AUDIO', label: '音频', icon: Mic, color: 'text-purple-500 hover:bg-purple-50' },
  { type: 'LINK', label: '链接', icon: Link2, color: 'text-orange-500 hover:bg-orange-50' },
  { type: 'TRANSLATION', label: '翻译', icon: Languages, color: 'text-cyan-500 hover:bg-cyan-50' },
];

export function PostComposer() {
  const { user } = useAuthStore();
  const { isPublishing, publishError, publishPost, clearPublishError } = usePostStore();
  const [mounted, setMounted] = useState(false);
  const [content, setContent] = useState('');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CONTENT_LENGTH;
  const charCountColor = charCount > 450 ? 'text-orange-500' : 'text-gray-400';
  const canPublish = content.trim().length > 0 && !isOverLimit && !isPublishing;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_CONTENT_LENGTH) {
      setContent(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && canPublish) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!canPublish) return;

    try {
      await publishPost({
        content: content.trim(),
        visibility: 'PUBLIC',
      });
      setContent('');
      setExpanded(false);
      toast.success('发布成功');
    } catch {
      toast.error(publishError || '发布失败，请重试');
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (!content.trim() && !isPublishing) {
        setExpanded(false);
        clearPublishError();
      }
    }, 150);
  };

  const handleMediaClick = (type: string) => {
    toast.info(`${type} 上传功能即将上线`);
  };

  // SSR和首次客户端渲染均显示骨架屏，避免hydration不匹配
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
              onChange={handleChange}
              onFocus={() => setExpanded(true)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              disabled={isPublishing}
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
                        onClick={() => handleMediaClick(btn.type)}
                        disabled={isPublishing}
                      >
                        <Icon className="h-4 w-4" />
                        {btn.label}
                      </Button>
                    );
                  })}
                </div>

                {publishError && (
                  <div className="flex items-center gap-2 text-xs text-red-500">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{publishError}</span>
                    <button
                      onClick={clearPublishError}
                      className="ml-auto text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className={`text-xs ${charCountColor}`}>
                    {charCount}/{MAX_CONTENT_LENGTH}
                  </span>
                  <Button
                    size="sm"
                    className="gap-1.5 bg-blue-600 hover:bg-blue-700"
                    disabled={!canPublish}
                    onClick={handleSubmit}
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        发布中...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        发布
                      </>
                    )}
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
