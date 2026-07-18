'use client';

import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationMessageProps {
  lat: number;
  lng: number;
  locationName?: string | null;
  isLive: boolean;
  isMine: boolean;
}

export function LocationMessage({ lat, lng, locationName, isLive, isMine }: LocationMessageProps) {
  // 使用OpenStreetMap静态地图
  const mapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=15&size=260x120&markers=${lat},${lng},red-pushpin`;

  const openInMaps = () => {
    // 打开系统地图应用
    const url = `https://www.amap.com/search?query=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-[260px] overflow-hidden">
      {/* 地图预览 */}
      <div
        className="relative h-[120px] w-full cursor-pointer overflow-hidden bg-muted"
        onClick={openInMaps}
      >
        <img
          src={mapUrl}
          alt="位置"
          className="h-full w-full object-cover"
          onError={(e) => {
            // 地图加载失败时显示占位
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {/* 地图加载失败占位 */}
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <MapPin className="h-8 w-8 text-muted-foreground/40" />
        </div>
        {/* 打开地图按钮 */}
        <div className="absolute bottom-2 right-2 flex h-7 items-center gap-1 rounded-full bg-black/60 px-2 text-white backdrop-blur-sm">
          <ExternalLink className="h-3 w-3" />
          <span className="text-[11px]">打开地图</span>
        </div>
      </div>

      {/* 位置信息 */}
      <div className="p-3">
        <div className="flex items-center gap-2">
          {isLive ? (
            <Navigation className="h-4 w-4 text-green-500" />
          ) : (
            <MapPin className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">
            {locationName || (isLive ? '实时位置' : '位置')}
          </span>
          {isLive && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              实时
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {lat.toFixed(6)}, {lng.toFixed(6)}
        </p>
      </div>
    </div>
  );
}
