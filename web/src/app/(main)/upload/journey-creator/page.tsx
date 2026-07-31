'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Map, Loader2, Send, Plus, Trash2, ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { usePostStore } from '@/stores/post-store';
import { uploadImage } from '@/lib/media-api';
import { getPostById } from '@/lib/post-api';
import { CreatePostPayload } from '@/lib/post-api';
import apiClient from '@/lib/api-client';

interface JourneyStop {
  id: string;
  dayNumber: number;
  locationName: string;
  locationLat?: number;
  locationLng?: number;
  description: string;
  mediaUrl?: string;
}

export default function JourneyCreatorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const { publishPost, isPublishing } = usePostStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [stops, setStops] = useState<JourneyStop[]>([]);
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingStopMedia, setUploadingStopMedia] = useState<string | null>(null);

  // 编辑模式：加载已有游记数据
  useEffect(() => {
    if (!editId) return;
    getPostById(editId).then(post => {
      setTitle(post.journey?.title || '');
      setContent(post.content || '');
      setDestination(post.journey?.destination || '');
      setStartDate(post.journey?.startDate || '');
      setEndDate(post.journey?.endDate || '');
      setCoverUrl(post.journey?.coverUrl || '');
      if (post.journey?.stops) {
        setStops(post.journey.stops.map((s: any) => ({
          id: `stop-${Date.now()}-${Math.random()}`,
          dayNumber: s.dayNumber || 1,
          locationName: s.locationName || '',
          locationLat: s.locationLat,
          locationLng: s.locationLng,
          description: s.description || '',
          mediaUrl: s.mediaUrl,
        })));
      }
    }).catch(() => {});
  }, [editId]);

  // 上传封面
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

  // 添加行程站点
  const addStop = () => {
    const newStop: JourneyStop = {
      id: `stop-${Date.now()}`,
      dayNumber: stops.length + 1,
      locationName: '',
      description: '',
    };
    setStops([...stops, newStop]);
  };

  // 删除行程站点
  const removeStop = (id: string) => {
    const newStops = stops.filter((s) => s.id !== id).map((s, i) => ({
      ...s,
      dayNumber: i + 1,
    }));
    setStops(newStops);
  };

  // 更新行程站点
  const updateStop = (id: string, updates: Partial<JourneyStop>) => {
    setStops(stops.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  // 上传站点媒体
  const handleStopMediaUpload = async (stopId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingStopMedia(stopId);
    try {
      const result = await uploadImage(files[0]);
      updateStop(stopId, { mediaUrl: result.url });
      toast.success('图片上传成功');
    } catch {
      toast.error('图片上传失败');
    }
    setUploadingStopMedia(null);
  };

  // 发布
  const canPublish = title.trim().length > 0 && !isPublishing;

  const handlePublish = async () => {
    if (!canPublish) return;

    const payload: CreatePostPayload = {
      content: content.trim() || title.trim(),
      visibility,
      postType: 'JOURNEY',
      contentLevel: 'ESSAY',
      vrMetadata: { tab: 'JOURNEY' },
      journey: {
        title: title.trim(),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        destination: destination || undefined,
        coverUrl: coverUrl || undefined,
        stops: stops.map((s) => ({
          dayNumber: s.dayNumber,
          locationName: s.locationName,
          locationLat: s.locationLat,
          locationLng: s.locationLng,
          description: s.description,
          mediaUrl: s.mediaUrl,
        })),
      },
    };

    try {
      await publishPost(payload);
      toast.success('旅程发布成功');
      router.push('/feed');
    } catch {
      toast.error('发布失败，请重试');
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
          <h1 className="text-xl font-bold">创建游记</h1>
          <p className="text-sm text-muted-foreground">记录旅程的每一个精彩瞬间</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-6 space-y-5">
          {/* 标题+封面 */}
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

          {/* 描述+日期 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">游记正文</label>
            <Textarea placeholder="写下你的旅程故事..." className="min-h-[120px] resize-none" value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
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
          </div>

          <Separator />

          {/* 行程站点 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">行程安排</h3>
              <Button variant="outline" size="sm" onClick={addStop} className="gap-1"><Plus className="h-4 w-4" />添加站点</Button>
            </div>
            {stops.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed py-12 text-center text-muted-foreground">
                <Map className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">点击「添加站点」规划你的旅程路线</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stops.map((stop) => (
                  <div key={stop.id} className="flex gap-3 rounded-lg border bg-card p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">{stop.dayNumber}</div>
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <Input placeholder="地点名称" value={stop.locationName} onChange={(e) => updateStop(stop.id, { locationName: e.target.value })} className="flex-1" />
                        <Input type="number" step="0.0001" placeholder="纬度" value={stop.locationLat || ''} onChange={(e) => updateStop(stop.id, { locationLat: parseFloat(e.target.value) || undefined })} className="w-24 text-xs" />
                        <Input type="number" step="0.0001" placeholder="经度" value={stop.locationLng || ''} onChange={(e) => updateStop(stop.id, { locationLng: parseFloat(e.target.value) || undefined })} className="w-24 text-xs" />
                      </div>
                      <Textarea placeholder="描述这一站..." value={stop.description} onChange={(e) => updateStop(stop.id, { description: e.target.value })} className="min-h-[50px] resize-none" />
                      {stop.mediaUrl ? (
                        <div className="relative h-24 rounded-lg overflow-hidden">
                          <img src={stop.mediaUrl} alt="" className="h-full w-full object-cover" />
                          <button onClick={() => updateStop(stop.id, { mediaUrl: undefined })} className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"><X className="h-3 w-3" /></button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-1.5 h-16 rounded-lg border border-dashed cursor-pointer hover:bg-muted/50 transition-colors">
                          {uploadingStopMedia === stop.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4 text-muted-foreground" />}
                          <span className="text-xs text-muted-foreground">{uploadingStopMedia === stop.id ? '上传中' : '添加图片'}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleStopMediaUpload(stop.id, e.target.files)} />
                        </label>
                      )}
                    </div>
                    <button onClick={() => removeStop(stop.id)} className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            )}
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
                {isPublishing ? '发布中...' : '发布游记'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
