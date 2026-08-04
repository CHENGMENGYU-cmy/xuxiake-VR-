'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, MapPin, Clock, Sparkles, ChevronRight, ImageIcon, FileText, ListFilter, FolderOpen, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AuthGuard } from '@/components/auth-guard';
import { useSnapStore } from '@/stores/snap-store';
import apiClient from '@/lib/api-client';

type Dimension = { name: string; count: number };
type ViewMode = 'all' | 'location' | 'time';

export default function SnapPage() {
  return <AuthGuard><SnapContent /></AuthGuard>;
}

function SnapContent() {
  const router = useRouter();
  const { snaps, snapsLoading, fetchSnaps, logs, logsLoading, fetchLogs } = useSnapStore();
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [byLocation, setByLocation] = useState<Dimension[]>([]);
  const [byTime, setByTime] = useState<Dimension[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchSnaps();
    fetchLogs();
  }, [fetchSnaps, fetchLogs]);

  useEffect(() => {
    apiClient.get('/posts/classified/dimensions').then((res) => {
      if (res.data?.success) {
        setByLocation(res.data.data.byLocation || []);
        setByTime((res.data.data.byTime || []).map((d: any) => ({ name: d.month, count: d.count })));
      }
    }).catch(() => {});
  }, []);

  const getMoodColor = (mood: string) => {
    if (/开心|满足|兴奋/.test(mood)) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (/疲惫|累/.test(mood)) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (/平静/.test(mood)) return 'bg-sky-50 text-sky-700 border-sky-200';
    if (/难过|低落/.test(mood)) return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  const getMediaImage = (item: any) => {
    if (item.mediaItems?.length > 0) {
      const img = item.mediaItems[0];
      return img.thumbnailUrl || img.url;
    }
    try {
      const meta = typeof item.vrMetadata === 'string' ? JSON.parse(item.vrMetadata) : item.vrMetadata;
      if (meta?.image) return meta.image;
    } catch {}
    return null;
  };

  // 合并闪拍+日志，按时间排序
  const allItems = [
    ...snaps.map((s: any) => ({ ...s, _type: 'SNAPSHOT' })),
    ...logs.map((l: any) => ({ ...l, _type: 'LOG' })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // 按筛选条件过滤
  const filteredItems = (() => {
    if (!selectedFilter) return allItems;
    if (viewMode === 'location') {
      return allItems.filter((item: any) => item.location?.name === selectedFilter || item.locationName === selectedFilter);
    }
    if (viewMode === 'time') {
      return allItems.filter((item: any) => {
        const d = new Date(item.createdAt);
        const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return m === selectedFilter;
      });
    }
    return allItems;
  })();

  const loading = snapsLoading || logsLoading;
  const totalCount = allItems.length;

  const viewModes: { id: ViewMode; label: string }[] = [
    { id: 'all', label: '全部' },
    { id: 'location', label: '按地点' },
    { id: 'time', label: '按时间' },
  ];

  const filters = viewMode === 'location' ? byLocation :
    viewMode === 'time' ? byTime : [];

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30">
              <Camera className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold">素材库</h1>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">
            你的闪拍和日志素材。点击卡片可由 AI 一键生成日记。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="shrink-0">{totalCount} 条</Badge>
          <Button
            size="sm"
            className="gap-1.5 bg-gradient-to-r from-teal-500 to-orange-400 text-white shadow-sm hover:from-teal-600 hover:to-orange-500"
            onClick={() => {
              if (allItems.length > 0) {
                router.push(`/snap/generate/${allItems[0].id}`);
              }
            }}
            disabled={allItems.length === 0}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI 写日记
          </Button>
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5">
          <ListFilter className="h-4 w-4 text-muted-foreground" />
          {viewModes.map((m) => (
            <Button
              key={m.id}
              variant={viewMode === m.id ? 'default' : 'ghost'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => { setViewMode(m.id); setSelectedFilter(null); }}
            >
              {m.label}
            </Button>
          ))}
        </div>

        {/* 筛选芯片 */}
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedFilter(null)}
              className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                !selectedFilter ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-muted'
              }`}
            >
              全部 ({totalCount})
            </button>
            {filters.map((f) => (
              <button
                key={f.name}
                onClick={() => setSelectedFilter(selectedFilter === f.name ? null : f.name)}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                  selectedFilter === f.name ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-muted'
                }`}
              >
                {viewMode === 'location' ? <MapPin className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                {f.name}
                <span className="text-muted-foreground">{f.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 列表 */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-[3/2] animate-pulse bg-muted" />
              <CardContent className="p-4 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
              <Camera className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              {selectedFilter ? '该分类下暂无记录' : '暂无闪拍记录'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              使用闪拍 App 记录生活中的瞬间，记录将自动同步到这里
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredItems.map((item: any) => {
            const meta = (() => {
              try {
                return typeof item.vrMetadata === 'string' ? JSON.parse(item.vrMetadata) : (item.vrMetadata || {});
              } catch { return {}; }
            })();

            const image = getMediaImage(item);
            const keywords: string[] = meta.keywords || [];
            const mood = meta.mood || '';
            const scene = meta.scene || '';
            const isLog = item._type === 'LOG';

            return (
              <Card
                key={item.id}
                className="group overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer"
                onClick={() => router.push(`/snap/generate/${item.id}`)}
              >
                {image ? (
                  <>
                    <div className="relative aspect-[3/2] bg-muted overflow-hidden">
                      <img src={image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      <div className="absolute left-3 top-3 flex items-center gap-1.5">
                        {mood && <Badge className={`border text-[10px] ${getMoodColor(mood)}`}>{mood}</Badge>}
                        <Badge className={`border text-[10px] ${isLog ? 'bg-slate-100 text-slate-600' : 'bg-orange-100 text-orange-600'}`}>
                          {isLog ? '日志' : '闪拍'}
                        </Badge>
                        {meta.hasDiary && (
                          <Badge className="border text-[10px] bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                            <Check className="h-2.5 w-2.5" />已生成
                          </Badge>
                        )}
                      </div>
                      {scene && (
                        <Badge variant="secondary" className="absolute right-3 top-3 bg-white/80 backdrop-blur-sm text-xs">{scene}</Badge>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <p className="text-sm leading-relaxed line-clamp-2">{item.content || '(无内容)'}</p>
                      <div className="flex flex-wrap gap-1">
                        {keywords.slice(0, 4).map((kw: string) => (
                          <Badge key={kw} variant="outline" className="text-[10px]">{kw}</Badge>
                        ))}
                      </div>
                      <SnapFooter item={item} />
                      <Button className="w-full gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-xs font-medium" size="sm">
                        <Sparkles className="h-3.5 w-3.5" />
                        生成日记
                        <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                      </Button>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isLog ? 'bg-slate-100 text-slate-500' : 'bg-orange-50 text-orange-500'}`}>
                        {isLog ? <FolderOpen className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-[10px] border ${isLog ? 'bg-slate-100 text-slate-600' : 'bg-orange-100 text-orange-600'}`}>
                            {isLog ? '日志' : '闪拍'}
                          </Badge>
                          {meta.hasDiary && (
                            <Badge className="text-[10px] border bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                              <Check className="h-2.5 w-2.5" />已生成
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed">{item.content || '(无内容)'}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {mood && <Badge className={`text-[10px] border ${getMoodColor(mood)}`}>{mood}</Badge>}
                          {scene && <Badge variant="secondary" className="text-[10px]">{scene}</Badge>}
                          {keywords.slice(0, 3).map((kw: string) => (
                            <Badge key={kw} variant="outline" className="text-[10px]">{kw}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <SnapFooter item={item} />
                    <Button className="w-full gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600" size="sm">
                      <Sparkles className="h-3.5 w-3.5" />
                      生成日记
                      <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                    </Button>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SnapFooter({ item }: { item: any }) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      {item.location?.name && (
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span className="truncate max-w-[120px]">{item.location.name}</span>
        </span>
      )}
      {item.locationName && !item.location?.name && (
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span className="truncate max-w-[120px]">{item.locationName}</span>
        </span>
      )}
      <span className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {new Date(item.createdAt).toLocaleDateString('zh-CN')}
      </span>
    </div>
  );
}
