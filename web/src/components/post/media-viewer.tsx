'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Play, Volume2, Link2, Languages, ExternalLink, Maximize2, Pause } from 'lucide-react';
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
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const handleVideoHover = useCallback((id: string, hovering: boolean) => {
    const video = videoRefs.current.get(id);
    if (!video) return;
    if (hovering) {
      setHoveredVideo(id);
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      setHoveredVideo(null);
      video.pause();
      video.currentTime = 0;
    }
  }, []);

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
        <div
          key={video.id}
          className="group relative bg-black"
          onMouseEnter={() => video.id && handleVideoHover(video.id, true)}
          onMouseLeave={() => video.id && handleVideoHover(video.id, false)}
        >
          <video
            ref={(el) => { if (el && video.id) videoRefs.current.set(video.id, el); }}
            src={video.url}
            poster={video.thumbnailUrl ?? undefined}
            controls={hoveredVideo === video.id}
            muted
            loop
            className="w-full"
            style={{ maxHeight: '500px' }}
            preload="metadata"
          >
            您的浏览器不支持视频播放
          </video>
          {/* 悬停前的播放按钮覆盖层 */}
          {hoveredVideo !== video.id && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity group-hover:bg-black/10">
              <div className="rounded-full bg-white/90 p-3 shadow-lg transition-transform group-hover:scale-110">
                <Play className="h-6 w-6 text-foreground fill-current" />
              </div>
            </div>
          )}
          {video.vrFormat && video.vrFormat !== 'STANDARD' && (
            <Badge className="absolute left-3 top-3 bg-black/70 text-white hover:bg-black/70">
              <Play className="mr-1 h-3 w-3" />
              {vrFormatLabels[video.vrFormat] || video.vrFormat}
            </Badge>
          )}
          {video.duration && video.duration > 0 && (
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
        <AudioPlayer key={audio.id} audio={audio} />
      ))}

      {/* 翻译 */}
      {translations.map((trans) => (
        <Card key={trans.id} className="border-l-4 border-l-primary bg-primary/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-primary">
            <Languages className="h-4 w-4" />
            <span>翻译内容 {trans.language && `(${trans.language})`}</span>
          </div>
          <p className="text-sm leading-relaxed text-foreground">{trans.translatedText}</p>
        </Card>
      ))}

      {/* 链接 */}
      {links.map((link) => (
        <a
          key={link.id}
          href={link.linkUrl ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg border bg-muted/50 p-4 transition-colors hover:bg-muted"
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
              <div className="flex items-center gap-1 text-sm font-medium text-primary">
                <Link2 className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{link.linkTitle || link.linkUrl}</span>
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </div>
              {link.linkDescription && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{link.linkDescription}</p>
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

function AudioPlayer({ audio }: { audio: MediaItem }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
    } else {
      el.play().catch(() => {});
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
        >
          {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Volume2 className="h-3.5 w-3.5 text-accent" />
            <span className="text-sm font-medium">音频记录</span>
            {audio.duration && audio.duration > 0 && (
              <span className="text-xs text-muted-foreground">
                {formatTime(audio.duration)}
              </span>
            )}
          </div>
          {/* 进度条 */}
          <div className="relative h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-accent transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-0.5 flex justify-between text-[10px] text-muted-foreground">
            <span>{formatTime((audio.duration ?? 0) * progress / 100)}</span>
            <span>{formatTime(audio.duration ?? 0)}</span>
          </div>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={audio.url}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={() => {
          const el = audioRef.current;
          if (el && el.duration) setProgress((el.currentTime / el.duration) * 100);
        }}
        onEnded={() => { setPlaying(false); setProgress(0); }}
      />
    </div>
  );
}
