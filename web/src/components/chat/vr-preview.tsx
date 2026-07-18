'use client';

import { Play, Eye, Video, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface VRPreviewData {
  title: string;
  format: 'VR360' | 'VR180' | 'SPATIAL' | 'STANDARD';
  thumbnailUrl?: string;
  duration?: string;
  url?: string;
}

interface VRPreviewProps {
  data: VRPreviewData;
  isMine: boolean;
}

const FORMAT_LABELS: Record<string, string> = {
  VR360: 'VR 360°',
  VR180: 'VR 180°',
  SPATIAL: '空间视频',
  STANDARD: '标准',
};

const FORMAT_ICONS: Record<string, typeof Play> = {
  VR360: Eye,
  VR180: Video,
  SPATIAL: Headphones,
  STANDARD: Play,
};

export function VRPreview({ data, isMine }: VRPreviewProps) {
  const Icon = FORMAT_ICONS[data.format] || Play;

  return (
    <a
      href={data.url || '#'}
      className="block w-[260px] overflow-hidden rounded-xl border border-primary/20 transition-colors hover:border-primary/50"
    >
      {/* 缩略图 */}
      <div className="relative h-[140px] w-full overflow-hidden bg-black">
        {data.thumbnailUrl ? (
          <img
            src={data.thumbnailUrl}
            alt={data.title}
            className="h-full w-full object-cover opacity-80"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <Icon className="h-12 w-12 text-primary/40" />
          </div>
        )}

        {/* 播放按钮 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm transition-transform hover:scale-110">
            <Play className="h-6 w-6 text-white" fill="white" />
          </div>
        </div>

        {/* 格式标签 */}
        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm">
          <Icon className="h-3 w-3 text-white" />
          <span className="text-[11px] font-medium text-white">{FORMAT_LABELS[data.format]}</span>
        </div>

        {/* 时长 */}
        {data.duration && (
          <div className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[11px] text-white backdrop-blur-sm">
            {data.duration}
          </div>
        )}
      </div>

      {/* 标题 */}
      <div className="p-3">
        <h3 className="text-sm font-semibold line-clamp-2">{data.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">点击在VR播放器中打开</p>
      </div>
    </a>
  );
}
