'use client';

import { useState } from 'react';
import { Eye, X, Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth-store';
import type { VrFormat, Topic, Community, Visibility } from '@/types';
import { cn } from '@/lib/utils';

interface PreviewData {
  content: string;
  media?: {
    type: 'VIDEO' | 'IMAGE' | 'AUDIO';
    url: string;
    vrFormat?: VrFormat;
    duration?: number;
    width?: number;
    height?: number;
  };
  images?: Array<{
    url: string;
    width?: number;
    height?: number;
    isCover?: boolean;
  }>;
  link?: {
    url: string;
    title: string;
    description?: string;
    favicon?: string;
  };
  topics?: Topic[];
  community?: Community | null;
  visibility?: Visibility;
  location?: string;
}

interface PublishPreviewProps {
  data: PreviewData;
}

const visibilityLabels: Record<string, string> = {
  PUBLIC: '公开',
  FOLLOWERS: '关注者',
  PRIVATE: '私密',
};

const vrFormatLabels: Record<string, string> = {
  STANDARD: '标准',
  VR180: 'VR180',
  VR360: 'VR360',
  SPATIAL: '空间',
};

export function PublishPreview({ data }: PublishPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();

  if (!data.content && !data.media && (!data.images || data.images.length === 0) && !data.link) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Eye className="h-4 w-4" />
        预览
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-background shadow-xl">
            {/* 头部 */}
            <div className="sticky top-0 flex items-center justify-between border-b bg-background p-4">
              <h3 className="font-semibold">发布预览</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 内容 */}
            <div className="p-4">
              {/* 用户信息 */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatarUrl} alt={user?.displayName} />
                  <AvatarFallback>{user?.displayName?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{user?.displayName}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>@{user?.username}</span>
                    {data.visibility && (
                      <>
                        <span>·</span>
                        <span>{visibilityLabels[data.visibility]}</span>
                      </>
                    )}
                    {data.location && (
                      <>
                        <span>·</span>
                        <span>{data.location}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* 文字内容 */}
              {data.content && (
                <p className="text-sm whitespace-pre-wrap mb-4">{data.content}</p>
              )}

              {/* 话题标签 */}
              {data.topics && data.topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {data.topics.map((topic) => (
                    <span
                      key={topic.id}
                      className="text-xs text-primary hover:underline cursor-pointer"
                    >
                      #{topic.name}
                    </span>
                  ))}
                </div>
              )}

              {/* 社群 */}
              {data.community && (
                <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
                  <span>发布到</span>
                  <Badge variant="secondary" className="text-xs">
                    {data.community.name}
                  </Badge>
                </div>
              )}

              {/* 单个媒体 */}
              {data.media && (
                <div className="rounded-lg overflow-hidden border mb-4">
                  {data.media.type === 'VIDEO' && (
                    <div className="relative bg-black">
                      <video
                        src={data.media.url}
                        className="max-h-64 w-full object-contain"
                        controls
                      />
                      {data.media.vrFormat && data.media.vrFormat !== 'STANDARD' && (
                        <Badge className="absolute top-2 left-2">
                          {vrFormatLabels[data.media.vrFormat]}
                        </Badge>
                      )}
                    </div>
                  )}
                  {data.media.type === 'IMAGE' && (
                    <div className="relative">
                      <img
                        src={data.media.url}
                        alt="预览"
                        className="max-h-64 w-full object-contain"
                      />
                      {data.media.vrFormat && data.media.vrFormat !== 'STANDARD' && (
                        <Badge className="absolute top-2 left-2">
                          {vrFormatLabels[data.media.vrFormat]}
                        </Badge>
                      )}
                    </div>
                  )}
                  {data.media.type === 'AUDIO' && (
                    <div className="p-4 bg-muted/50">
                      <audio src={data.media.url} controls className="w-full" />
                    </div>
                  )}
                </div>
              )}

              {/* 多图 */}
              {data.images && data.images.length > 0 && (
                <div className={cn(
                  'grid gap-1 rounded-lg overflow-hidden border mb-4',
                  data.images.length === 1 && 'grid-cols-1',
                  data.images.length === 2 && 'grid-cols-2',
                  data.images.length >= 3 && 'grid-cols-3'
                )}>
                  {data.images.map((img, index) => (
                    <div
                      key={index}
                      className={cn(
                        'aspect-square relative',
                        data.images!.length === 1 && 'aspect-video'
                      )}
                    >
                      <img
                        src={img.url}
                        alt={`图片 ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {index === 0 && img.isCover && (
                        <Badge className="absolute bottom-1 left-1 text-[10px] px-1 py-0">
                          封面
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 链接 */}
              {data.link && (
                <div className="rounded-lg border p-3 mb-4">
                  <div className="flex items-start gap-3">
                    {data.link.favicon && (
                      <img
                        src={data.link.favicon}
                        alt=""
                        className="h-5 w-5 mt-0.5"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">
                        {data.link.title}
                      </p>
                      {data.link.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {data.link.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground/70 truncate mt-1">
                        {data.link.url}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 互动按钮预览 */}
              <Separator className="my-4" />
              <div className="flex items-center justify-between text-muted-foreground">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 text-sm">
                    <Heart className="h-4 w-4" />
                    <span>0</span>
                  </button>
                  <button className="flex items-center gap-1 text-sm">
                    <MessageCircle className="h-4 w-4" />
                    <span>0</span>
                  </button>
                  <button className="flex items-center gap-1 text-sm">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
                <button>
                  <Bookmark className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 底部 */}
            <div className="sticky bottom-0 border-t bg-background p-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                关闭预览
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
