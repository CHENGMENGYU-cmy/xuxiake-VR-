'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceMessageProps {
  url: string;
  isMine: boolean;
}

export function VoiceMessage({ url, isMine }: VoiceMessageProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(Math.floor(audio.duration));
    });

    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration);
      }
    });

    audio.addEventListener('ended', () => {
      setPlaying(false);
      setProgress(0);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [url]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // 生成静态波形条（基于progress模拟）
  const bars = 24;

  return (
    <div className="flex items-center gap-2.5 min-w-[180px]">
      <button
        onClick={togglePlay}
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors',
          isMine ? 'bg-primary-foreground/20' : 'bg-primary/10'
        )}
      >
        {playing ? (
          <Pause className={cn('h-4 w-4', isMine ? 'text-primary-foreground' : 'text-primary')} />
        ) : (
          <Play className={cn('h-4 w-4', isMine ? 'text-primary-foreground' : 'text-primary')} />
        )}
      </button>

      {/* 波形 */}
      <div className="flex flex-1 items-center gap-[2px]">
        {Array.from({ length: bars }).map((_, i) => {
          const filled = i / bars <= progress;
          const height = 4 + Math.sin(i * 0.8) * 8 + Math.cos(i * 1.3) * 4;
          return (
            <div
              key={i}
              className={cn(
                'w-[3px] shrink-0 rounded-full transition-colors',
                filled
                  ? isMine ? 'bg-primary-foreground' : 'bg-primary'
                  : isMine ? 'bg-primary-foreground/30' : 'bg-muted-foreground/30'
              )}
              style={{ height: `${Math.max(4, height)}px` }}
            />
          );
        })}
      </div>

      <span className={cn('text-xs tabular-nums', isMine ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
        {formatDuration(duration)}
      </span>
    </div>
  );
}
