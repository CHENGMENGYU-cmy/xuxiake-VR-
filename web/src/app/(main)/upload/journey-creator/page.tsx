'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Map, Loader2, Send, Plus, Trash2, ImagePlus, X, Sparkles, Calendar, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { usePostStore } from '@/stores/post-store';
import { uploadImage } from '@/lib/media-api';
import { getPostById, updatePost } from '@/lib/post-api';
import { CreatePostPayload } from '@/lib/post-api';
import { SnapPickerDialog, useSnapItems } from '@/components/diary/snap-picker';
import type { JourneyStop } from '@/types';

interface EditorStopMedia { url: string; thumbnailUrl?: string }
interface EditorStop {
  id: string;
  dayNumber: number;
  dayDate: string;
  locationName: string;
  description: string;
  highlights: string;
  tips: string;
  mediaItems: EditorStopMedia[];
}

const TRANSPORT_OPTIONS = ['飞机', '高铁', '自驾', '火车', '大巴', '徒步', '骑行', '轮渡'];
const THEME_OPTIONS = ['美食', '人文', '自然', '亲子', '冒险', '摄影', '城市', '古镇'];

export default function JourneyCreatorPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <JourneyCreatorContent />
    </Suspense>
  );
}

function JourneyCreatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const { publishPost, isPublishing } = usePostStore();
  const { items, ensureLoaded } = useSnapItems();

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transport, setTransport] = useState('');
  const [budget, setBudget] = useState('');
  const [theme, setTheme] = useState('');
  const [insight, setInsight] = useState('');
  const [journeyTips, setJourneyTips] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [stops, setStops] = useState<EditorStop[]>([]);
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingStopMedia, setUploadingStopMedia] = useState<string | null>(null);
  const [pickerForStop, setPickerForStop] = useState<string | null>(null);

  // 编辑模式：加载已有游记数据
  useEffect(() => {
    if (!editId) return;
    ensureLoaded();
    getPostById(editId).then(post => {
      setTitle(post.journey?.title || post.title || '');
      setContent(post.content || '');
      setSummary(post.journey?.summary || '');
      setDestination(post.journey?.destination || '');
      setStartDate(post.journey?.startDate || '');
      setEndDate(post.journey?.endDate || '');
      setTransport(post.journey?.transport || '');
      setBudget(post.journey?.budget || '');
      setTheme(post.journey?.theme || '');
      setInsight(post.journey?.insight || '');
      setCoverUrl(post.journey?.coverUrl || post.mediaItems?.[0]?.url || '');
      if (post.journey?.stops) {
        setStops(post.journey.stops.map((s: JourneyStop) => ({
          id: `stop-${Date.now()}-${Math.random()}`,
          dayNumber: s.dayNumber || 1,
          dayDate: s.dayDate || '',
          locationName: s.locationName || '',
          description: s.description || '',
          mediaItems: (s.mediaItems || []).map(m => ({ url: m.url, thumbnailUrl: m.thumbnailUrl || undefined })),
        })));
      }
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const handleCoverUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingCover(true);
    try {
      const result = await uploadImage(files[0]);
      setCoverUrl(result.url);
      toast.success('封面上传成功');
    } catch {
      toast.error('封面上传失败');
    }
    setUploadingCover(false);
  };

  const addStop = () => {
    const nextDay = stops.length + 1;
    setStops([...stops, {
      id: `stop-${Date.now()}`,
      dayNumber: nextDay,
      dayDate: '',
      locationName: '',
      description: '',
      mediaItems: [],
    }]);
  };

  const removeStop = (id: string) => {
    setStops(stops.filter((s) => s.id !== id).map((s, i) => ({ ...s, dayNumber: i + 1 })));
  };

  const updateStop = (id: string, updates: Partial<EditorStop>) => {
    setStops(stops.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleStopMediaUpload = async (stopId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingStopMedia(stopId);
    try {
      const result = await uploadImage(files[0]);
      const media = { url: result.url, thumbnailUrl: result.url };
      const stop = stops.find((s) => s.id === stopId);
      if (stop) updateStop(stopId, { mediaItems: [...stop.mediaItems, media] });
      toast.success('图片已添加');
    } catch {
      toast.error('图片上传失败');
    }
    setUploadingStopMedia(null);
  };

  const removeStopMedia = (stopId: string, idx: number) => {
    const stop = stops.find((s) => s.id === stopId);
    if (!stop) return;
    updateStop(stopId, { mediaItems: stop.mediaItems.filter((_, i) => i !== idx) });
  };

  // 从素材库选图加入章节
  const handlePickImages = (ids: string[]) => {
    if (!pickerForStop) return;
    const chosen = ids.map((id) => items.find((it) => it.id === id)).filter(Boolean) as { image: string | null; locationName: string }[];
    const stop = stops.find((s) => s.id === pickerForStop);
    if (!stop) return;
    const added: EditorStopMedia[] = [];
    for (const c of chosen) {
      if (c.image) added.push({ url: c.image, thumbnailUrl: c.image });
    }
    updateStop(pickerForStop, { mediaItems: [...stop.mediaItems, ...added] });
    if (!stop.locationName && chosen[0]?.locationName) {
      updateStop(pickerForStop, { locationName: chosen[0].locationName });
    }
    setPickerForStop(null);
  };

  const dayCount = startDate && endDate
    ? Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1)
    : (stops.length || null);

  const assembleContent = () => {
    let md = `# ${title.trim() || '我的游记'}\n\n`;
    if (summary.trim()) md += `> ${summary.trim()}\n\n`;
    const info = [destination, transport, budget, theme].map((v) => v.trim()).filter(Boolean).join(' · ');
    if (info) md += info + '\n\n';
    stops.forEach((s) => {
      md += `## Day ${s.dayNumber}${s.locationName ? `｜${s.locationName}` : ''}${s.dayDate ? `（${s.dayDate}）` : ''}\n\n`;
      md += `${s.description || ''}\n\n`;
    });
    if (insight.trim()) md += `## 写在最后\n\n${insight.trim()}\n`;
    return md;
  };

  const canPublish = title.trim().length > 0 && !isPublishing;

  const handlePublish = async () => {
    if (!canPublish) return;
    const journeyPayload = {
      title: title.trim(),
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      destination: destination.trim() || undefined,
      coverUrl: coverUrl || undefined,
      summary: summary.trim() || undefined,
      transport: transport || undefined,
      budget: budget.trim() || undefined,
      theme: theme || undefined,
      insight: insight.trim() || undefined,
      stops: stops.map((s) => ({
        dayNumber: s.dayNumber,
        dayDate: s.dayDate || undefined,
        locationName: s.locationName.trim() || undefined,
        description: s.description.trim() || undefined,
        mediaItems: s.mediaItems.map((m) => ({ url: m.url, thumbnailUrl: m.thumbnailUrl })),
      })),
    };

    try {
      if (editId) {
        await updatePost(editId, {
          content: assembleContent(),
          journey: journeyPayload,
        });
        toast.success('游记已更新');
        router.push(`/journeys/${editId}`);
      } else {
        const payload: CreatePostPayload = {
          content: assembleContent(),
          visibility,
          postType: 'JOURNEY',
          contentLevel: 'TRAVELOGUE',
          vrMetadata: { tab: 'JOURNEY' },
          journey: journeyPayload,
        };
        const post = await publishPost(payload);
        toast.success('旅程发布成功');
        router.push(`/journeys/${post.id}`);
      }
    } catch {
      toast.error(editId ? '保存失败，请重试' : '发布失败，请重试');
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
          <Map className="h-4 w-4 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{editId ? '编辑游记' : '写游记'}</h1>
          <p className="text-sm text-muted-foreground">标题 + 信息卡 + 按天章节（文字 & 多图）+ 结尾感悟，图文叙事式游记</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-6 space-y-5">
          {/* 标题 + 封面 */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">游记标题 *</label>
              <Input placeholder="给你的游记起个名字..." value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">封面图</label>
              {coverUrl ? (
                <div className="relative h-[72px] rounded-lg overflow-hidden border">
                  <img src={coverUrl} alt="" className="h-full w-full object-cover" />
                  <button onClick={() => setCoverUrl('')} className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white"><X className="h-3 w-3" /></button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-1 h-[72px] rounded-lg border-2 border-dashed border-muted cursor-pointer hover:border-primary/50 transition-colors">
                  {uploadingCover ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : <ImagePlus className="h-5 w-5 text-muted-foreground" />}
                  <span className="text-xs text-muted-foreground">{uploadingCover ? '上传中' : '点击上传'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCoverUpload(e.target.files)} />
                </label>
              )}
            </div>
          </div>

          {/* 导语 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">导语（一句话简介）</label>
            <Input placeholder="如：在漓江晨雾里醒来，用三天把桂林的山水与烟火装进行囊" value={summary} onChange={(e) => setSummary(e.target.value)} />
          </div>

          {/* 信息卡 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">目的地</label>
              <Input placeholder="如：云南大理" value={destination} onChange={(e) => setDestination(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">开始日期</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">结束日期</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">出行方式</label>
              <Input list="transport-options" placeholder="选择或输入出行方式" value={transport} onChange={(e) => setTransport(e.target.value)} />
              <datalist id="transport-options">
                {TRANSPORT_OPTIONS.map((t) => <option key={t} value={t} />)}
              </datalist>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">人均消费</label>
              <Input placeholder="如：3000元" value={budget} onChange={(e) => setBudget(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">旅行主题</label>
              <Input list="theme-options" placeholder="选择或输入主题" value={theme} onChange={(e) => setTheme(e.target.value)} />
              <datalist id="theme-options">
                {THEME_OPTIONS.map((t) => <option key={t} value={t} />)}
              </datalist>
            </div>
          </div>
          {dayCount && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />共 {dayCount} 天行程
            </p>
          )}

          <Separator />

          {/* 章节（按天） */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">游记正文（按天分章节）</h3>
              <Button variant="outline" size="sm" onClick={addStop} className="gap-1"><Plus className="h-4 w-4" />添加 Day</Button>
            </div>
            {stops.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed py-12 text-center text-muted-foreground">
                <Map className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">点击「添加 Day」，每天写一段文字并配上照片，组成图文并茂的游记</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stops.map((stop) => (
                  <div key={stop.id} className="flex gap-3 rounded-lg border bg-card p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">D{stop.dayNumber}</div>
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <Input type="date" value={stop.dayDate} onChange={(e) => updateStop(stop.id, { dayDate: e.target.value })} className="w-40 text-xs" />
                        <Input placeholder="地点名称" value={stop.locationName} onChange={(e) => updateStop(stop.id, { locationName: e.target.value })} className="flex-1" />
                      </div>
                      <Textarea placeholder="这一天的旅程故事、所见所感..." value={stop.description} onChange={(e) => updateStop(stop.id, { description: e.target.value })} className="min-h-[60px] resize-none" />
                      {stop.mediaItems.length > 0 && (
                        <div className="grid grid-cols-4 gap-1.5">
                          {stop.mediaItems.map((m, mi) => (
                            <div key={mi} className="relative aspect-square overflow-hidden rounded-lg">
                              <img src={m.url} alt="" className="h-full w-full object-cover" />
                              <button onClick={() => removeStopMedia(stop.id, mi)} className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"><X className="h-3 w-3" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 h-9 rounded-lg border border-dashed px-3 text-xs text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors">
                          {uploadingStopMedia === stop.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                          {uploadingStopMedia === stop.id ? '上传中' : '本地上传'}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleStopMediaUpload(stop.id, e.target.files)} />
                        </label>
                        <Button variant="ghost" size="sm" className="h-9 text-xs gap-1" onClick={() => setPickerForStop(stop.id)}>
                          <Sparkles className="h-3.5 w-3.5 text-teal-500" />从素材库选图
                        </Button>
                      </div>
                    </div>
                    <button onClick={() => removeStop(stop.id)} className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 结尾感悟 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">结尾感悟</label>
            <Textarea placeholder="给这次旅程一个温暖的收尾..." value={insight} onChange={(e) => setInsight(e.target.value)} className="min-h-[60px] resize-none" />
          </div>

          {/* 可见性 + 发布 */}
          <div className="flex items-center justify-between pt-2">
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as 'PUBLIC' | 'PRIVATE')}
              className="h-9 rounded-lg border border-border bg-background px-2 text-sm"
            >
              <option value="PUBLIC">🌐 公开发布</option>
              <option value="PRIVATE">🔒 仅自己可见</option>
            </select>
            <div className="flex gap-3">
              <Button variant="outline" size="lg" onClick={() => router.push('/journeys')}>取消</Button>
              <Button size="lg" className="gap-2" disabled={!canPublish} onClick={handlePublish}>
                {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {isPublishing ? '发布中...' : editId ? '保存修改' : '发布游记'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 素材库选图弹层 */}
      <SnapPickerDialog
        open={pickerForStop !== null}
        onOpenChange={(open) => !open && setPickerForStop(null)}
        max={12}
        onConfirm={handlePickImages}
      />
    </div>
  );
}
