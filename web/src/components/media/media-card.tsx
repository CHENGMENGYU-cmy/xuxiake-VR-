'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Volume2, Heart, Eye, MessageCircle, Video, Image as ImageIcon, Music } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Post, MediaItem, MediaType } from '@/types';
import { cn } from '@/lib/utils';

interface MediaCardProps {
  post: Post;
  mediaType: MediaType;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatCount(count: number): string {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}w`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

function WaveformVisual() {
  const bars = [0.3, 0.6, 0.4, 0.8, 0.5, 0.9, 0.3, 0.7, 0.5, 0.6, 0.4, 0.8, 0.3, 0.5, 0.7, 0.4, 0.6, 0.8, 0.3, 0.5];
  return (
    <div className="flex items-end justify-center gap-[2px] h-16 px-3">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-1 rounded-full bg-teal-400/60"
          style={{ height: `${h * 100}%` }}
        />
      ))}
    </div>
  );
}

function StatRow({ post }: { post: Post }) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="flex items-center gap-0.5">
        <Eye className="h-3 w-3" />
        {formatCount(post.viewCount)}
      </span>
      <span className="flex items-center gap-0.5">
        <Heart className="h-3 w-3" />
        {formatCount(post.likeCount)}
      </span>
      <span className="flex items-center gap-0.5">
        <MessageCircle className="h-3 w-3" />
        {formatCount(post.commentCount)}
      </span>
    </div>
  );
}

function VideoCard({ post, media }: { post: Post; media: MediaItem }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/post/${post.id}`}>
      <Card
        className="group overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {media.thumbnailUrl || media.url ? (
            <Image
              src={media.thumbnailUrl || media.url}
              alt={post.content || '视频'}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className={cn(
                'object-cover transition-transform duration-300',
                hovered && 'scale-105'
              )}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-teal-500/20 to-teal-600/10">
              <Video className="h-12 w-12 text-teal-500/50" />
            </div>
          )}
          {/* 播放图标覆盖层 */}
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity',
              hovered ? 'opacity-100' : 'opacity-0'
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
              <Play className="h-5 w-5 text-foreground ml-0.5" fill="currentColor" />
            </div>
          </div>
          {/* 时长标签 */}
          {media.duration && (
            <Badge className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5">
              {formatDuration(media.duration)}
            </Badge>
          )}
          {/* VR格式标签 */}
          {media.vrFormat && media.vrFormat !== 'STANDARD' && (
            <Badge className="absolute top-2 left-2 bg-violet-500/90 text-white text-[10px] px-1.5 py-0.5">
              {media.vrFormat === 'VR360' ? 'VR 360°' : media.vrFormat === 'VR180' ? 'VR 180°' : '空间'}
            </Badge>
          )}
        </div>
        <CardContent className="p-3 space-y-2">
          <p className="text-sm font-medium line-clamp-2 leading-snug">
            {post.content || '无标题视频'}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <Avatar className="h-5 w-5">
                <AvatarImage src={post.author.avatarUrl} alt={post.author.displayName} />
                <AvatarFallback className="text-[8px]">{post.author.displayName[0]}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate">
                {post.author.displayName}
              </span>
            </div>
            <StatRow post={post} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ImageCard({ post, media }: { post: Post; media: MediaItem }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/post/${post.id}`}>
      <Card
        className="group overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {media.thumbnailUrl || media.url ? (
            <Image
              src={media.thumbnailUrl || media.url}
              alt={post.content || '图片'}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className={cn(
                'object-cover transition-transform duration-300',
                hovered && 'scale-105'
              )}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-500/20 to-orange-600/10">
              <ImageIcon className="h-12 w-12 text-orange-500/50" />
            </div>
          )}
          {/* AR标记 */}
          {media.vrFormat && media.vrFormat !== 'STANDARD' && (
            <Badge className="absolute top-2 left-2 bg-orange-500/90 text-white text-[10px] px-1.5 py-0.5">
              {media.vrFormat === 'VR360' ? 'VR 360°' : media.vrFormat === 'VR180' ? 'VR 180°' : '空间'}
            </Badge>
          )}
        </div>
        <CardContent className="p-3 space-y-2">
          <p className="text-sm font-medium line-clamp-2 leading-snug">
            {post.content || '无标题图片'}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <Avatar className="h-5 w-5">
                <AvatarImage src={post.author.avatarUrl} alt={post.author.displayName} />
                <AvatarFallback className="text-[8px]">{post.author.displayName[0]}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate">
                {post.author.displayName}
              </span>
            </div>
            <StatRow post={post} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function AudioCard({ post, media }: { post: Post; media: MediaItem }) {
  return (
    <Link href={`/post/${post.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
        <div className="relative aspect-[4/3] bg-gradient-to-br from-teal-500/10 via-teal-400/5 to-background overflow-hidden">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-500/15">
              <Volume2 className="h-7 w-7 text-teal-500" />
            </div>
            <WaveformVisual />
          </div>
          {/* 时长标签 */}
          {media.duration && (
            <Badge className="absolute bottom-2 right-2 bg-teal-500/90 text-white text-[10px] px-1.5 py-0.5">
              {formatDuration(media.duration)}
            </Badge>
          )}
        </div>
        <CardContent className="p-3 space-y-2">
          <p className="text-sm font-medium line-clamp-2 leading-snug">
            {post.content || '无标题音频'}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <Avatar className="h-5 w-5">
                <AvatarImage src={post.author.avatarUrl} alt={post.author.displayName} />
                <AvatarFallback className="text-[8px]">{post.author.displayName[0]}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate">
                {post.author.displayName}
              </span>
            </div>
            <StatRow post={post} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function MediaCard({ post, mediaType }: MediaCardProps) {
  const primaryMedia = post.mediaItems?.find((m) => m.type === mediaType) || post.mediaItems?.[0];

  if (!primaryMedia) {
    return null;
  }

  switch (primaryMedia.type) {
    case 'VIDEO':
      return <VideoCard post={post} media={primaryMedia} />;
    case 'IMAGE':
      return <ImageCard post={post} media={primaryMedia} />;
    case 'AUDIO':
      return <AudioCard post={post} media={primaryMedia} />;
    default:
      return null;
  }
}
