'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play, Volume2, Link2, Languages, ExternalLink, Maximize2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MediaItem } from '@/types';
import { cn } from '@/lib/utils';

interface MediaViewerProps {
  items: MediaItem[];
}

export function MediaViewer({ items }: MediaViewerProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const images = items.filter((m) => m.type === 'IMAGE');
  const videos = items.filter((m) => m.type === 'VIDEO');
  const audios = items.filter((m) => m.type === 'AUDIO');
  const links = items.filter((m) => m.type === 'LINK');
  const translations = items.filter((m) => m.type === 'TRANSLATION');

  const vrFormatLabels: Record<string, string> = {
    VR360: 'VR 360°',
    VR180: 'VR 180°',
    SPATIAL: '空间视频',
  };

  return (
    <div className="space-y-2">
      {/* 视频 */}
      {videos.map((video) => (
        <div key={video.id} className="relative bg-black">
          <video
            src={video.url}
            poster={video.thumbnailUrl ?? undefined}
            controls
            className="w-full"
            style={{ maxHeight: '500px' }}
            preload="metadata"
          >
            您的浏览器不支持视频播放
          </video>
          {video.vrFormat && video.vrFormat !== 'STANDARD' && (
            <Badge className="absolute left-3 top-3 bg-black/70 text-white hover:bg-black/70">
              <Play className="mr-1 h-3 w-3" />
              {vrFormatLabels[video.vrFormat] || video.vrFormat}
            </Badge>
          )}
          {video.duration && (
            <span className="absolute bottom-3 right-3 rounded bg-black/70 px-2 py-0.5 text-xs text-white">
              {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
            </span>
          )}
        </div>
      ))}

      {/* 图片网格 */}
      {images.length > 0 && (
        <div
          className={cn(
            'grid gap-1',
            images.length === 1 && 'grid-cols-1',
            images.length === 2 && 'grid-cols-2',
            images.length === 3 && 'grid-cols-2',
            images.length >= 4 && 'grid-cols-2'
          )}
        >
          {images.slice(0, 4).map((img, idx) => (
            <div
              key={img.id}
              className={cn(
                'relative cursor-pointer overflow-hidden bg-muted',
                images.length === 3 && idx === 0 && 'row-span-2'
              )}
              onClick={() => {
                setLightboxIndex(idx);
                setLightboxOpen(true);
              }}
            >
              <Image
                src={img.url}
                alt=""
                width={img.width || 800}
                height={img.height || 600}
                className="h-full w-full object-cover transition-transform hover:scale-105"
                unoptimized
              />
              {img.vrFormat && img.vrFormat !== 'STANDARD' && (
                <Badge className="absolute left-2 top-2 bg-black/70 text-white hover:bg-black/70">
                  {vrFormatLabels[img.vrFormat]}
                </Badge>
              )}
              {images.length > 4 && idx === 3 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-bold text-white">
                  +{images.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 音频 */}
      {audios.map((audio) => (
        <div key={audio.id} className="rounded-lg bg-gray-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
            <Volume2 className="h-4 w-4 text-purple-500" />
            <span>音频记录</span>
            {audio.duration && (
              <span className="text-xs text-gray-400">
                {Math.floor(audio.duration / 60)}:{(audio.duration % 60).toString().padStart(2, '0')}
              </span>
            )}
          </div>
          <audio src={audio.url} controls className="w-full" preload="metadata">
            您的浏览器不支持音频播放
          </audio>
        </div>
      ))}

      {/* 翻译 */}
      {translations.map((trans) => (
        <Card key={trans.id} className="border-l-4 border-l-blue-500 bg-blue-50/50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-blue-600">
            <Languages className="h-4 w-4" />
            <span>翻译内容 {trans.language && `(${trans.language})`}</span>
          </div>
          <p className="text-sm leading-relaxed text-gray-700">{trans.translatedText}</p>
        </Card>
      ))}

      {/* 链接 */}
      {links.map((link) => (
        <a
          key={link.id}
          href={link.linkUrl ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg border bg-gray-50 p-4 transition-colors hover:bg-gray-100"
        >
          <div className="flex items-start gap-3">
            {link.linkFavicon && (
              <Image
                src={link.linkFavicon}
                alt=""
                width={32}
                height={32}
                className="mt-0.5 rounded"
                unoptimized
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-sm font-medium text-blue-600">
                <Link2 className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{link.linkTitle || link.linkUrl}</span>
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </div>
              {link.linkDescription && (
                <p className="mt-1 text-xs text-gray-500 line-clamp-2">{link.linkDescription}</p>
              )}
            </div>
          </div>
        </a>
      ))}

      {/* 图片灯箱 */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl border-0 bg-transparent p-0">
          <div className="relative">
            <Image
              src={images[lightboxIndex]?.url || ''}
              alt=""
              width={1200}
              height={900}
              className="max-h-[80vh] w-full object-contain"
              unoptimized
            />
            <button
              className="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              onClick={() => setLightboxOpen(false)}
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
