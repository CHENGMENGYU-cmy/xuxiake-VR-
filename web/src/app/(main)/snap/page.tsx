'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, MapPin, Clock, Sparkles, ChevronLeft, ChevronRight, ImageIcon, FileText, ListFilter, FolderOpen, Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AuthGuard } from '@/components/auth-guard';
import { useSnapStore } from '@/stores/snap-store';
import { generateDiaryBatch, generateTravelogueByTrip, getAiJob, getTravelogueJob } from '@/lib/snap-api';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';

type Dimension = { name: string; count: number };
type TripDimension = { tripId: string; name: string; count: number };
type ViewMode = 'all' | 'location' | 'time' | 'trip';

export default function SnapPage() {
  return <AuthGuard><SnapContent /></AuthGuard>;
}

function SnapContent() {
  const router = useRouter();
  const { snaps, snapsLoading, fetchSnaps, logs, logsLoading, fetchLogs } = useSnapStore();
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [byLocation, setByLocation] = useState<Dimension[]>([]);
  const [byTime, setByTime] = useState<Dimension[]>([]);
  const [byTrip, setByTrip] = useState<TripDimension[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<{ tripId: string; name: string } | null>(null);
  const [tripGenerating, setTripGenerating] = useState(false);
  const [tripGenStatus, setTripGenStatus] = useState('');
  const [tripGenProgress, setTripGenProgress] = useState(0);
  const [tripGenPostId, setTripGenPostId] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [multiGen, setMultiGen] = useState(false);
  const [multiGenStatus, setMultiGenStatus] = useState('');
  const [multiGenProgress, setMultiGenProgress] = useState(0);
  const [multiGenPostId, setMultiGenPostId] = useState<string | null>(null);
  const [previewItems, setPreviewItems] = useState<any[] | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchSnaps();
    fetchLogs();
  }, [fetchSnaps, fetchLogs]);

  useEffect(() => {
    apiClient.get('/posts/classified/dimensions').then((res) => {
      if (res.data?.success) {
        setByLocation(res.data.data.byLocation || []);
        setByTime((res.data.data.byTime || []).map((d: any) => ({ name: d.month, count: d.count })));
        setByTrip(res.data.data.byTrip || []);
      }
    }).catch(() => {});
  }, []);

  // 行程一键生成游记：提交 → 轮询进度 → 完成
  const startTripGeneration = async () => {
    if (!selectedTrip || tripGenerating) return;
    setTripGenerating(true);
    setTripGenPostId(null);
    setTripGenStatus('正在提交生成任务...');
    setTripGenProgress(0);
    try {
      const { jobId } = await generateTravelogueByTrip({
        tripId: selectedTrip.tripId,
        style: '游记',
        tone: '温暖',
        length: '标准',
      });
      const timer = setInterval(async () => {
        try {
          const job = await getTravelogueJob(jobId);
          setTripGenProgress(job.progress || 0);
          setTripGenStatus(statusLabel(job.status, job.progress));
          if (job.status === 'DONE' || job.status === 'ERROR') {
            clearInterval(timer);
            setTripGenerating(false);
            if (job.status === 'DONE') {
              setTripGenPostId(job.postId || null);
              toast.success('游记生成完成，已保存到我的游记');
            } else {
              toast.error(job.error || '游记生成失败');
            }
          }
        } catch {
          clearInterval(timer);
          setTripGenerating(false);
          toast.error('查询生成进度失败');
        }
      }, 1500);
    } catch {
      setTripGenerating(false);
      toast.error('游记生成提交失败，请重试');
    }
  };

  // 多选闪拍 → AI 生成一篇日记：提交 → 轮询 → 完成
  const startMultiDiary = async () => {
    if (selectedIds.size === 0 || multiGen) return;
    setMultiGen(true);
    setMultiGenPostId(null);
    setMultiGenStatus('正在提交...');
    setMultiGenProgress(0);
    try {
      const { jobId } = await generateDiaryBatch({
        snapIds: Array.from(selectedIds),
        style: '温柔治愈',
        tone: '温暖',
        length: '标准',
      });
      const timer = setInterval(async () => {
        try {
          const job = await getAiJob(jobId);
          setMultiGenProgress(job.progress || 0);
          setMultiGenStatus(statusLabel(job.status, job.progress));
          if (job.status === 'DONE' || job.status === 'ERROR') {
            clearInterval(timer);
            setMultiGen(false);
            if (job.status === 'DONE') {
              setMultiGenPostId(job.postId || null);
              setSelectMode(false);
              setSelectedIds(new Set());
              toast.success('日记生成完成，已保存到我的日记');
            } else {
              toast.error(job.error || '日记生成失败');
            }
          }
        } catch {
          clearInterval(timer);
          setMultiGen(false);
          toast.error('查询生成进度失败');
        }
      }, 1500);
    } catch {
      setMultiGen(false);
      toast.error('日记生成提交失败，请重试');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // 按天分组（时间线）：全部/按时间 视图下按日期分块展示
  const groupByDay = (items: any[]) => {
    const map = new Map<string, any[]>();
    for (const item of items) {
      const d = new Date(item.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const list = map.get(key) || [];
      list.push(item);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  };

  const dayLabel = (key: string) => {
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const today = fmt(new Date());
    const yesterday = fmt(new Date(Date.now() - 86400000));
    if (key === today) return '今天';
    if (key === yesterday) return '昨天';
    const [y, m, d] = key.split('-').map(Number);
    return `${y}年${m}月${d}日`;
  };

  const statusLabel = (status: string, progress?: number) => {
    switch (status) {
      case 'QUEUED': return '排队中...';
      case 'ANALYZING': return '分析行程素材...';
      case 'GENERATING': return `AI 写作中 ${progress ?? 0}%`;
      case 'DONE': return '生成完成';
      case 'ERROR': return '生成失败';
      default: return status || '处理中...';
    }
  };

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

  const renderCard = (item: any) => {
    const meta = (() => {
      try {
        return typeof item.vrMetadata === 'string' ? JSON.parse(item.vrMetadata) : (item.vrMetadata || {});
      } catch { return {}; }
    })();
    const image = getMediaImage(item);
    const isLog = item._type === 'LOG';
    const isSelected = selectedIds.has(item.id);

    return (
      <div
        key={item.id}
        className={`group relative aspect-square cursor-pointer overflow-hidden rounded-xl border transition-all ${
          isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-primary/40'
        }`}
        onClick={() => (selectMode ? toggleSelect(item.id) : openPreview(item))}
      >
        {image ? (
          <img src={image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <FileText className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute left-1.5 top-1.5 flex gap-1">
          {isLog && <Badge className="border bg-black/50 text-[10px] text-white backdrop-blur-sm">日志</Badge>}
          {meta.hasDiary && (
            <Badge className="border bg-black/50 text-[10px] text-white backdrop-blur-sm">
              <Check className="h-2.5 w-2.5" />日记
            </Badge>
          )}
        </div>
        {selectMode && (
          <div className={`absolute bottom-1.5 right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white ${isSelected ? 'border-primary bg-primary text-white' : 'border-slate-300 text-transparent'}`}>
            {isSelected && <Check className="h-3 w-3" />}
          </div>
        )}
      </div>
    );
  };

  // 合并闪拍+日志，按时间排序
  const allItems = [
    ...snaps.map((s: any) => ({ ...s, _type: 'SNAPSHOT' })),
    ...logs.map((l: any) => ({ ...l, _type: 'LOG' })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // 按筛选条件过滤
  const filteredItems = (() => {
    if (viewMode === 'trip') {
      if (!selectedTrip) return allItems.filter((item: any) => !!item.tripId);
      return allItems.filter((item: any) => item.tripId === selectedTrip.tripId);
    }
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

  const dayGroups = viewMode === 'location' || viewMode === 'trip' ? null : groupByDay(filteredItems);

  // 相册式全屏预览（点击照片墙某张 → 全屏大图，左右切换）
  const openPreview = (item: any) => {
    const idx = filteredItems.findIndex((i: any) => i.id === item.id);
    setPreviewItems(filteredItems);
    setPreviewIndex(idx >= 0 ? idx : 0);
  };
  const closePreview = () => { setPreviewItems(null); setPreviewIndex(null); };
  const prevPreview = () => {
    if (previewItems) setPreviewIndex((p) => (p === null ? p : (p - 1 + previewItems.length) % previewItems.length));
  };
  const nextPreview = () => {
    if (previewItems) setPreviewIndex((p) => (p === null ? p : (p + 1) % previewItems.length));
  };

  // 键盘：ESC 关闭，←/→ 切换
  useEffect(() => {
    if (previewIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePreview();
      if (e.key === 'ArrowLeft') prevPreview();
      if (e.key === 'ArrowRight') nextPreview();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [previewIndex, previewItems]);

  const loading = snapsLoading || logsLoading;
  const totalCount = allItems.length;

  const viewModes: { id: ViewMode; label: string }[] = [
    { id: 'all', label: '全部' },
    { id: 'location', label: '按地点' },
    { id: 'time', label: '按时间' },
    { id: 'trip', label: '按行程' },
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
            variant={selectMode ? 'default' : 'outline'}
            onClick={() => { setSelectMode(!selectMode); setSelectedIds(new Set()); }}
          >
            {selectMode ? '完成' : '多选'}
          </Button>
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
              onClick={() => { setViewMode(m.id); setSelectedFilter(null); setSelectedTrip(null); }}
            >
              {m.label}
            </Button>
          ))}
        </div>

        {/* 筛选芯片 */}
        {(filters.length > 0 || (viewMode === 'trip' && byTrip.length > 0)) && (
          <div className="flex flex-wrap gap-1.5">
            {viewMode === 'trip' ? (
              <>
                <button
                  onClick={() => setSelectedTrip(null)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                    !selectedTrip ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
                >
                  全部行程 ({byTrip.reduce((s, t) => s + t.count, 0)})
                </button>
                {byTrip.map((t) => (
                  <button
                    key={t.tripId}
                    onClick={() => setSelectedTrip(selectedTrip?.tripId === t.tripId ? null : { tripId: t.tripId, name: t.name })}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                      selectedTrip?.tripId === t.tripId ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-muted'
                    }`}
                  >
                    <FolderOpen className="h-3 w-3" />
                    {t.name}
                    <span className="text-muted-foreground">{t.count}</span>
                  </button>
                ))}
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        )}

        {/* 行程选中态：AI 生成游记 */}
        {viewMode === 'trip' && selectedTrip && (
          <div className="rounded-xl border bg-card p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">已选行程：{selectedTrip.name}</div>
                <div className="text-xs text-muted-foreground">{tripGenStatus || `共 ${filteredItems.length} 张素材`}</div>
              </div>
              {!tripGenerating && !tripGenPostId && (
                <Button
                  size="sm"
                  onClick={startTripGeneration}
                  disabled={filteredItems.length === 0}
                  className="shrink-0 gap-1.5 bg-gradient-to-r from-teal-500 to-orange-400 text-white hover:from-teal-600 hover:to-orange-500"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  AI 生成游记
                </Button>
              )}
              {tripGenerating && (
                <span className="shrink-0 text-xs text-muted-foreground">{tripGenStatus}</span>
              )}
              {tripGenPostId && (
                <Button size="sm" variant="outline" onClick={() => router.push('/journeys')} className="shrink-0">
                  查看游记 →
                </Button>
              )}
            </div>
            {tripGenerating && (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-orange-400 transition-all"
                  style={{ width: `${tripGenProgress}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 列表 */}
      {loading ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl bg-muted" />
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
      ) : dayGroups ? (
        <div className="space-y-6">
          {dayGroups.map(([key, items]) => (
            <div key={key}>
              <div className="mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">{dayLabel(key)}</span>
                <Badge variant="secondary" className="text-[10px]">{items.length} 张</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {items.map(renderCard)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {filteredItems.map(renderCard)}
        </div>
      )}

      {/* 多选底部操作栏 */}
      {selectMode && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">已选 {selectedIds.size} 张</span>
            <div className="flex items-center gap-2">
              {multiGenPostId ? (
                <Button size="sm" onClick={() => router.push('/diaries')} className="shrink-0">查看日记 →</Button>
              ) : (
                <Button
                  size="sm"
                  onClick={startMultiDiary}
                  disabled={selectedIds.size === 0 || multiGen}
                  className="shrink-0 gap-1.5 bg-gradient-to-r from-teal-500 to-orange-400 text-white hover:from-teal-600 hover:to-orange-500"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  AI 写日记
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => { setSelectMode(false); setSelectedIds(new Set()); setMultiGenStatus(''); }}>
                取消
              </Button>
            </div>
          </div>
          {(multiGen || multiGenStatus) && (
            <div className="mx-auto mt-2 max-w-4xl">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-orange-400 transition-all"
                  style={{ width: `${multiGenProgress}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{multiGenStatus}</div>
            </div>
          )}
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
