'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin, Upload, Loader2, Send, X, Plus, Trash2,
  Mountain, Clock, Route, ArrowUp, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { usePostStore } from '@/stores/post-store';
import { CreatePostPayload } from '@/lib/post-api';
import type { Difficulty, RouteType } from '@/types';
import { cn } from '@/lib/utils';

interface Waypoint {
  id: string;
  lat: number;
  lng: number;
  name: string;
  description?: string;
}

interface RouteData {
  distanceKm?: number;
  durationMinutes?: number;
  elevationGainM?: number;
  difficulty?: Difficulty;
  routeType?: RouteType;
  gpxData?: string;
  waypoints: Waypoint[];
}

const difficulties: { value: Difficulty; label: string; color: string }[] = [
  { value: 'EASY', label: '简单', color: 'bg-green-100 text-green-700' },
  { value: 'MODERATE', label: '中等', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'HARD', label: '困难', color: 'bg-orange-100 text-orange-700' },
  { value: 'EXPERT', label: '专家', color: 'bg-red-100 text-red-700' },
];

const routeTypes: { value: RouteType; label: string; icon: string }[] = [
  { value: 'HIKE', label: '徒步', icon: '🥾' },
  { value: 'BIKE', label: '骑行', icon: '🚲' },
  { value: 'DRIVE', label: '自驾', icon: '🚗' },
  { value: 'PADDLE', label: '皮划艇', icon: '🚣' },
  { value: 'CLIMB', label: '攀岩', icon: '🧗' },
];

export default function RouteCreatorPage() {
  const router = useRouter();
  const { publishPost, isPublishing } = usePostStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [routeData, setRouteData] = useState<RouteData>({
    waypoints: [],
  });
  const [gpxFileName, setGpxFileName] = useState('');
  const [isParsingGpx, setIsParsingGpx] = useState(false);

  const gpxInputRef = useRef<HTMLInputElement>(null);

  // 解析GPX文件
  const handleGpxUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.name.endsWith('.gpx')) {
      toast.error('请上传 .gpx 格式的文件');
      return;
    }

    setIsParsingGpx(true);
    try {
      const text = await file.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');

      // 解析轨迹点
      const trackPoints = Array.from(xml.querySelectorAll('trkpt'));
      const waypoints: Waypoint[] = [];

      let totalDistance = 0;
      let minLat = Infinity, maxLat = -Infinity;
      let minLng = Infinity, maxLng = -Infinity;

      trackPoints.forEach((pt, index) => {
        const lat = parseFloat(pt.getAttribute('lat') || '0');
        const lon = parseFloat(pt.getAttribute('lon') || '0');
        const ele = pt.querySelector('ele')?.textContent;
        const name = pt.querySelector('name')?.textContent;

        if (lat && lon) {
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
          minLng = Math.min(minLng, lon);
          maxLng = Math.max(maxLng, lon);

          // 每10个点取一个作为途经点
          if (index % 10 === 0 || index === trackPoints.length - 1) {
            waypoints.push({
              id: `wp-${index}`,
              lat,
              lng: lon,
              name: name || `途经点 ${waypoints.length + 1}`,
              description: ele ? `海拔 ${Math.round(parseFloat(ele))}m` : undefined,
            });
          }

          // 计算距离
          if (index > 0) {
            const prevPt = trackPoints[index - 1];
            const prevLat = parseFloat(prevPt.getAttribute('lat') || '0');
            const prevLon = parseFloat(prevPt.getAttribute('lon') || '0');
            totalDistance += calculateDistance(prevLat, prevLon, lat, lon);
          }
        }
      });

      setRouteData({
        ...routeData,
        distanceKm: Math.round(totalDistance * 100) / 100,
        gpxData: text,
        waypoints,
      });
      setGpxFileName(file.name);
      toast.success('GPX文件解析成功');
    } catch (error) {
      console.error('GPX解析失败:', error);
      toast.error('GPX文件解析失败');
    }
    setIsParsingGpx(false);
    if (gpxInputRef.current) gpxInputRef.current.value = '';
  };

  // 计算两点距离（Haversine公式）
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 添加途经点
  const addWaypoint = () => {
    const newWaypoint: Waypoint = {
      id: `wp-${Date.now()}`,
      lat: 0,
      lng: 0,
      name: `途经点 ${routeData.waypoints.length + 1}`,
    };
    setRouteData({
      ...routeData,
      waypoints: [...routeData.waypoints, newWaypoint],
    });
  };

  // 删除途经点
  const removeWaypoint = (id: string) => {
    setRouteData({
      ...routeData,
      waypoints: routeData.waypoints.filter((wp) => wp.id !== id),
    });
  };

  // 更新途经点
  const updateWaypoint = (id: string, updates: Partial<Waypoint>) => {
    setRouteData({
      ...routeData,
      waypoints: routeData.waypoints.map((wp) =>
        wp.id === id ? { ...wp, ...updates } : wp
      ),
    });
  };

  // 发布
  const canPublish = title.trim().length > 0 && !isPublishing;

  const handlePublish = async () => {
    if (!canPublish) return;

    const payload: CreatePostPayload = {
      content: content.trim() || title.trim(),
      visibility: 'PUBLIC',
      postType: 'ROUTE',
      routeDetail: {
        distanceKm: routeData.distanceKm,
        durationMinutes: routeData.durationMinutes,
        elevationGainM: routeData.elevationGainM,
        difficulty: routeData.difficulty || 'MODERATE',
        routeType: routeData.routeType || 'HIKE',
        gpxData: routeData.gpxData,
        waypoints: routeData.waypoints.map((wp) => ({
          lat: wp.lat,
          lng: wp.lng,
          name: wp.name,
          description: wp.description,
        })),
      },
    };

    try {
      await publishPost(payload);
      toast.success('路线发布成功');
      router.push('/feed');
    } catch {
      toast.error('发布失败，请重试');
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}小时${mins > 0 ? `${mins}分钟` : ''}`;
    return `${mins}分钟`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Route className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">创建路线</h1>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* 标题 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">路线标题 *</label>
            <Input
              placeholder="给你的路线起个名字..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">路线描述</label>
            <Textarea
              placeholder="描述这条路线的特色、注意事项..."
              className="min-h-[100px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <Separator />

          {/* GPX上传 */}
          <div className="space-y-3">
            <label className="text-sm font-medium">上传GPX文件</label>
            {gpxFileName ? (
              <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{gpxFileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {routeData.distanceKm ? `${routeData.distanceKm} 公里` : ''}
                    {routeData.waypoints.length > 0 ? ` · ${routeData.waypoints.length} 个途经点` : ''}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setGpxFileName('');
                    setRouteData({ ...routeData, gpxData: undefined, waypoints: [] });
                  }}
                  className="rounded-full p-1 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => gpxInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary"
              >
                {isParsingGpx ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                ) : (
                  <Upload className="h-8 w-8 text-primary" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {isParsingGpx ? '解析中...' : '点击上传GPX文件'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    支持 .gpx 格式的轨迹文件
                  </p>
                </div>
              </div>
            )}
            <input
              ref={gpxInputRef}
              type="file"
              accept=".gpx"
              className="hidden"
              onChange={(e) => handleGpxUpload(e.target.files)}
            />
          </div>

          <Separator />

          {/* 路线类型 */}
          <div className="space-y-3">
            <label className="text-sm font-medium">路线类型</label>
            <div className="flex flex-wrap gap-2">
              {routeTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setRouteData({ ...routeData, routeType: type.value })}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors',
                    routeData.routeType === type.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 难度等级 */}
          <div className="space-y-3">
            <label className="text-sm font-medium">难度等级</label>
            <div className="flex flex-wrap gap-2">
              {difficulties.map((diff) => (
                <button
                  key={diff.value}
                  type="button"
                  onClick={() => setRouteData({ ...routeData, difficulty: diff.value })}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-sm transition-colors',
                    routeData.difficulty === diff.value
                      ? diff.color
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* 路线数据 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Route className="h-4 w-4" />
                距离 (公里)
              </label>
              <Input
                type="number"
                step="0.1"
                placeholder="0.0"
                value={routeData.distanceKm || ''}
                onChange={(e) => setRouteData({ ...routeData, distanceKm: parseFloat(e.target.value) || undefined })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                时长 (分钟)
              </label>
              <Input
                type="number"
                placeholder="0"
                value={routeData.durationMinutes || ''}
                onChange={(e) => setRouteData({ ...routeData, durationMinutes: parseInt(e.target.value) || undefined })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <ArrowUp className="h-4 w-4" />
                海拔增益 (米)
              </label>
              <Input
                type="number"
                placeholder="0"
                value={routeData.elevationGainM || ''}
                onChange={(e) => setRouteData({ ...routeData, elevationGainM: parseInt(e.target.value) || undefined })}
              />
            </div>
          </div>

          {/* 路线预览 */}
          {routeData.distanceKm && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <h4 className="text-sm font-medium mb-2">路线概览</h4>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {routeData.distanceKm && (
                  <span className="flex items-center gap-1">
                    <Route className="h-3.5 w-3.5" />
                    {routeData.distanceKm} 公里
                  </span>
                )}
                {routeData.durationMinutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDuration(routeData.durationMinutes)}
                  </span>
                )}
                {routeData.elevationGainM && (
                  <span className="flex items-center gap-1">
                    <ArrowUp className="h-3.5 w-3.5" />
                    +{routeData.elevationGainM} 米
                  </span>
                )}
                {routeData.difficulty && (
                  <Badge variant="secondary">
                    {difficulties.find((d) => d.value === routeData.difficulty)?.label}
                  </Badge>
                )}
                {routeData.routeType && (
                  <Badge variant="secondary">
                    {routeTypes.find((t) => t.value === routeData.routeType)?.icon}{' '}
                    {routeTypes.find((t) => t.value === routeData.routeType)?.label}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* 途经点 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">途经点</label>
              <Button variant="outline" size="sm" onClick={addWaypoint}>
                <Plus className="h-4 w-4 mr-1" />
                添加
              </Button>
            </div>
            {routeData.waypoints.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                暂无途经点，上传GPX文件或手动添加
              </p>
            ) : (
              <div className="space-y-2">
                {routeData.waypoints.map((wp, index) => (
                  <div key={wp.id} className="flex items-start gap-2 rounded-lg border p-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-1">
                      <Input
                        placeholder="途经点名称"
                        value={wp.name}
                        onChange={(e) => updateWaypoint(wp.id, { name: e.target.value })}
                        className="h-8 text-sm"
                      />
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          step="0.0001"
                          placeholder="纬度"
                          value={wp.lat || ''}
                          onChange={(e) => updateWaypoint(wp.id, { lat: parseFloat(e.target.value) || 0 })}
                          className="h-7 text-xs"
                        />
                        <Input
                          type="number"
                          step="0.0001"
                          placeholder="经度"
                          value={wp.lng || ''}
                          onChange={(e) => updateWaypoint(wp.id, { lng: parseFloat(e.target.value) || 0 })}
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeWaypoint(wp.id)}
                      className="rounded-full p-1 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* 发布按钮 */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.push('/upload')}>
              取消
            </Button>
            <Button className="gap-2" disabled={!canPublish} onClick={handlePublish}>
              {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isPublishing ? '发布中...' : '发布路线'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
