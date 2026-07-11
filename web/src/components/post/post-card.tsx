'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, Eye, MoreHorizontal, Play, Volume2, Globe, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MediaViewer } from './media-viewer';
import { Post } from '@/types';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';

const vrFormatLabels: Record<string, string> = {
  VR360: 'VR 360°',
  VR180: 'VR 180°',
  SPATIAL: '空间视频',
  STANDARD: '标准',
};

const mediaTypeIcons: Record<string, React.ReactNode> = {
  VIDEO: <Play className="h-3 w-3" />,
  AUDIO: <Volume2 className="h-3 w-3" />,
};

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { user: currentUser } = useAuthStore();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);

  // 如果帖子作者是当前用户，使用 authStore 中的最新头像
  const authorAvatarUrl = currentUser && post.author.username === currentUser.username
    ? currentUser.avatarUrl
    : post.author.avatarUrl;

  const handleLike = () => {
    if (isLiked) {
      setLikeCount((c) => c - 1);
    } else {
      setLikeCount((c) => c + 1);
    }
    setIsLiked(!isLiked);
  };

  return (
    <Card className="overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      {/* 作者信息头 */}
      <div className="flex items-center gap-3 p-4">
        <Link href={`/profile/${post.author.username}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={authorAvatarUrl} alt={post.author.displayName} />
            <AvatarFallback>{post.author.displayName[0]}</AvatarFallback>
          </Avatar>
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${post.author.username}`}
              className="truncate text-sm font-semibold hover:underline"
            >
              {post.author.displayName}
            </Link>
            {post.vrMetadata && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {typeof post.vrMetadata.device === 'string' ? post.vrMetadata.device : 'VR'}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{formatRelativeTime(post.createdAt)}</span>
            {post.visibility === 'PUBLIC' && (
              <>
                <span>·</span>
                <Globe className="h-3 w-3" />
              </>
            )}
            {post.location && (
              <>
                <span>·</span>
                <MapPin className="h-3 w-3" />
                <span className="truncate">{post.location.name}</span>
              </>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>保存链接</DropdownMenuItem>
            <DropdownMenuItem>复制链接</DropdownMenuItem>
            <DropdownMenuItem>举报内容</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 文字内容 */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {post.content}
          </p>
        </div>
      )}

      {/* 媒体内容 */}
      {post.mediaItems.length > 0 && (
        <MediaViewer items={post.mediaItems} />
      )}

      {/* 互动数据行 */}
      <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Heart className="h-3.5 w-3.5 text-accent" />
          <span>{likeCount}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{post.commentCount} 条评论</span>
          <span>{post.viewCount} 次浏览</span>
        </div>
      </div>

      {/* 互动按钮行 */}
      <div className="flex border-t px-2 py-1">
        <Button
          variant="ghost"
          className={cn(
            'flex-1 gap-2 text-sm text-muted-foreground hover:bg-accent/10',
            isLiked && 'text-accent hover:text-accent'
          )}
          onClick={handleLike}
        >
          <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
          赞
        </Button>
        <Link href={`/post/${post.id}`} className="flex-1">
          <Button variant="ghost" className="w-full gap-2 text-sm text-muted-foreground hover:bg-primary/10">
            <MessageCircle className="h-4 w-4" />
            评论
          </Button>
        </Link>
        <Button variant="ghost" className="flex-1 gap-2 text-sm text-muted-foreground hover:bg-teal-50 dark:hover:bg-teal-900/20">
          <Share2 className="h-4 w-4" />
          分享
        </Button>
      </div>
    </Card>
  );
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays < 7) return `${diffDays} 天前`;
  return date.toLocaleDateString('zh-CN');
}
