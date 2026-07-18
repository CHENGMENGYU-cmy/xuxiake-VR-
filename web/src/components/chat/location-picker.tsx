'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader2, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LocationPickerProps {
  onShare: (data: { lat: number; lng: number; locationName?: string; isLive?: boolean; durationMinutes?: number }) => void;
  onClose: () => void;
}

export function LocationPicker({ onShare, onClose }: LocationPickerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [mode, setMode] = useState<'static' | 'live'>('static');
  const [duration, setDuration] = useState(15);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('浏览器不支持定位功能');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => {
        setError('无法获取当前位置，请检查定位权限');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const handleShare = () => {
    if (!position) return;
    onShare({
      lat: position.lat,
      lng: position.lng,
      isLive: mode === 'live',
      durationMinutes: mode === 'live' ? duration : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-sm rounded-xl bg-card shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* 头部 */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-base font-semibold">共享位置</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* 位置状态 */}
          <div className="flex h-[140px] items-center justify-center rounded-lg bg-muted">
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">正在获取位置...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-2 text-center">
                <MapPin className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button size="sm" variant="outline" onClick={getCurrentLocation}>重试</Button>
              </div>
            ) : position ? (
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                </p>
              </div>
            ) : null}
          </div>

          {/* 模式选择 */}
          <div className="flex gap-2">
            <button
              className={cn(
                'flex-1 rounded-lg border p-3 text-left transition-colors',
                mode === 'static' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/30'
              )}
              onClick={() => setMode('static')}
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">发送位置</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">发送当前静态位置</p>
            </button>
            <button
              className={cn(
                'flex-1 rounded-lg border p-3 text-left transition-colors',
                mode === 'live' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/30'
              )}
              onClick={() => setMode('live')}
            >
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">实时位置</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">持续共享位置</p>
            </button>
          </div>

          {/* 实时时长选择 */}
          {mode === 'live' && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">共享时长</p>
              <div className="flex gap-2">
                {[15, 30, 60].map((d) => (
                  <button
                    key={d}
                    className={cn(
                      'flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition-colors',
                      duration === d ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                    onClick={() => setDuration(d)}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {d}分钟
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex gap-2 border-t p-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>取消</Button>
          <Button className="flex-1" disabled={!position || loading} onClick={handleShare}>
            {mode === 'live' ? '开始共享' : '发送位置'}
          </Button>
        </div>
      </div>
    </div>
  );
}
