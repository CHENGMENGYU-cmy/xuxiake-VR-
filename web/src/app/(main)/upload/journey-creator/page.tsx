'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Map, Loader2, Send, Plus, Trash2, Calendar,
  ImagePlus, GripVertical, X
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { usePostStore } from '@/stores/post-store';
import { uploadImage } from '@/lib/media-api';
import { CreatePostPayload } from '@/lib/post-api';
import { cn } from '@/lib/utils';

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
  const { publishPost, isPublishing } = usePostStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [stops, setStops] = useState<JourneyStop[]>([]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingStopMedia, setUploadingStopMedia] = useState<string | null>(null);

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
      visibility: 'PUBLIC',
      postType: 'JOURNEY',
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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Map className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">创建旅程</h1>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">旅程标题 *</label>
              <Input
                placeholder="给你的旅程起个名字..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">旅程描述</label>
              <Textarea
                placeholder="描述这次旅程的精彩之处..."
                className="min-h-[100px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">目的地</label>
                <Input
                  placeholder="例如：云南大理"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">封面图</label>
                <div className="flex gap-2">
                  {coverUrl ? (
                    <div className="relative flex-1 h-10 rounded-md overflow-hidden">
                      <img src={coverUrl} alt="封面" className="h-full w-full object-cover" />
                      <button
                        onClick={() => setCoverUrl('')}
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex-1 flex items-center justify-center gap-2 h-10 rounded-md border border-dashed cursor-pointer hover:bg-muted transition-colors">
                      {uploadingCover ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ImagePlus className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {uploadingCover ? '上传中...' : '选择封面'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleCoverUpload(e.target.files)}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  开始日期
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  结束日期
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* 行程站点 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">行程安排</label>
              <Button variant="outline" size="sm" onClick={addStop}>
                <Plus className="h-4 w-4 mr-1" />
                添加站点
              </Button>
            </div>

            {stops.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Map className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无行程站点</p>
                <p className="text-xs">点击"添加站点"开始规划你的旅程</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stops.map((stop, index) => (
                  <Card key={stop.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                          {stop.dayNumber}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              placeholder="地点名称"
                              value={stop.locationName}
                              onChange={(e) => updateStop(stop.id, { locationName: e.target.value })}
                            />
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                step="0.0001"
                                placeholder="纬度"
                                value={stop.locationLat || ''}
                                onChange={(e) => updateStop(stop.id, { locationLat: parseFloat(e.target.value) || undefined })}
                                className="text-xs"
                              />
                              <Input
                                type="number"
                                step="0.0001"
                                placeholder="经度"
                                value={stop.locationLng || ''}
                                onChange={(e) => updateStop(stop.id, { locationLng: parseFloat(e.target.value) || undefined })}
                                className="text-xs"
                              />
                            </div>
                          </div>
                          <Textarea
                            placeholder="描述这一天的行程..."
                            value={stop.description}
                            onChange={(e) => updateStop(stop.id, { description: e.target.value })}
                            className="min-h-[60px]"
                          />
                          {/* 站点图片 */}
                          {stop.mediaUrl ? (
                            <div className="relative rounded-lg overflow-hidden h-32">
                              <img src={stop.mediaUrl} alt="" className="h-full w-full object-cover" />
                              <button
                                onClick={() => updateStop(stop.id, { mediaUrl: undefined })}
                                className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex items-center justify-center gap-2 h-20 rounded-lg border border-dashed cursor-pointer hover:bg-muted transition-colors">
                              {uploadingStopMedia === stop.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <ImagePlus className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm text-muted-foreground">
                                {uploadingStopMedia === stop.id ? '上传中...' : '添加图片'}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleStopMediaUpload(stop.id, e.target.files)}
                              />
                            </label>
                          )}
                        </div>
                        <button
                          onClick={() => removeStop(stop.id)}
                          className="rounded-full p-1 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
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
              {isPublishing ? '发布中...' : '发布旅程'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
