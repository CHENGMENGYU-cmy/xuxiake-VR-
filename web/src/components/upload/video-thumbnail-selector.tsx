'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Image, X, Check, SkipBack, SkipForward, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface VideoThumbnailSelectorProps {
  videoUrl: string;
  onSelect: (thumbnailUrl: string) => void;
  onCancel: () => void;
}

export function VideoThumbnailSelector({
  videoUrl,
  onSelect,
  onCancel,
}: VideoThumbnailSelectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null);

  // 视频加载
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      generateThumbnails(video);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, []);

  // 生成缩略图
  const generateThumbnails = useCallback(async (video: HTMLVideoElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const thumbnailCount = 8;
    const interval = video.duration / (thumbnailCount + 1);
    const newThumbnails: string[] = [];

    for (let i = 1; i <= thumbnailCount; i++) {
      const time = interval * i;
      video.currentTime = time;

      await new Promise<void>((resolve) => {
        const handleSeeked = () => {
          canvas.width = video.videoWidth / 4;
          canvas.height = video.videoHeight / 4;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          newThumbnails.push(canvas.toDataURL('image/jpeg', 0.8));
          resolve();
        };
        video.addEventListener('seeked', handleSeeked, { once: true });
      });
    }

    setThumbnails(newThumbnails);
    video.currentTime = 0;
  }, []);

  // 时间滑块变化
  const handleTimeChange = useCallback((value: number[]) => {
    const time = value[0];
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  }, []);

  // 播放/暂停
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // 截取当前帧
  const captureCurrentFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.9);
    setSelectedThumbnail(thumbnailUrl);
  }, []);

  // 选择缩略图
  const handleSelectThumbnail = useCallback((thumbnail: string) => {
    setSelectedThumbnail(thumbnail);
  }, []);

  // 确认选择
  const handleConfirm = useCallback(() => {
    if (selectedThumbnail) {
      onSelect(selectedThumbnail);
    }
  }, [selectedThumbnail, onSelect]);

  // 格式化时间
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-2xl bg-background rounded-xl overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">选择封面</h3>
          <button onClick={onCancel} className="rounded-full p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 视频预览 */}
        <div className="relative bg-black">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full max-h-[300px] object-contain"
            onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
            onEnded={() => setIsPlaying(false)}
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* 播放控制 */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <div className="flex-1">
                <Slider
                  value={[currentTime]}
                  onValueChange={handleTimeChange}
                  min={0}
                  max={duration}
                  step={0.1}
                  className="cursor-pointer"
                />
              </div>
              <span className="text-xs text-white">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>

        {/* 截取当前帧 */}
        <div className="p-4 border-b">
          <Button
            variant="outline"
            size="sm"
            onClick={captureCurrentFrame}
            className="w-full"
          >
            <Image className="h-4 w-4 mr-1" />
            截取当前帧作为封面
          </Button>
        </div>

        {/* 自动提取的缩略图 */}
        {thumbnails.length > 0 && (
          <div className="p-4 border-b">
            <p className="text-sm font-medium mb-3">或选择自动提取的封面：</p>
            <div className="grid grid-cols-4 gap-2">
              {thumbnails.map((thumbnail, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectThumbnail(thumbnail)}
                  className={cn(
                    'relative aspect-video rounded-lg overflow-hidden border-2 transition-all',
                    selectedThumbnail === thumbnail
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-transparent hover:border-muted-foreground/50'
                  )}
                >
                  <img
                    src={thumbnail}
                    alt={`封面 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {selectedThumbnail === thumbnail && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                      <Check className="h-6 w-6 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 底部按钮 */}
        <div className="flex justify-end gap-2 p-4">
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedThumbnail}
          >
            <Check className="h-4 w-4 mr-1" />
            确认封面
          </Button>
        </div>
      </div>
    </div>
  );
}
