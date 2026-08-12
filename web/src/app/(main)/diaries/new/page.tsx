'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, PenLine, Lock, Globe, FileText, Loader2,
  Sparkles, Image as ImageIcon, ChevronDown, X, Upload,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AuthGuard } from '@/components/auth-guard';
import type { UploadedImage } from '@/components/upload/multi-image-uploader';
import { SnapPickerDialog } from '@/components/diary/snap-picker';
import { getPostDetail, saveDiary } from '@/lib/snap-api';
import { uploadImage, getImageDimensions } from '@/lib/media-api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { MoodType, WeatherType } from '@/types';
import { MoodEmoji, WeatherEmoji, MoodLabel, WeatherLabel } from '@/types';

export default function DiaryNewPage() {
  return (
    <AuthGuard>
      <DiaryEditor />
    </AuthGuard>
  );
}

function DiaryEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit') || '';
  const urlSnapIds = (searchParams.get('snapIds') || '').split(',').filter(Boolean);

  // 表单状态
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [insight, setInsight] = useState('');
  const [mood, setMood] = useState<MoodType | ''>('');
  const [weather, setWeather] = useState<WeatherType | ''>('');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [snapIds, setSnapIds] = useState<string[]>(urlSnapIds);
  const [metaOpen, setMetaOpen] = useState(true);

  // 加载状态
  const [loading, setLoading] = useState(!!editId || urlSnapIds.length > 0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 编辑模式：回填字段
  const loadExistingDiary = useCallback(async (postId: string) => {
    try {
      const post = await getPostDetail(postId);
      if (!post) {
        toast.error('日记不存在');
        router.replace('/diaries');
        return;
      }
      setTitle(post.title || '');
      setContent(post.content || '');
      const meta = typeof post.vrMetadata === 'string'
        ? JSON.parse(post.vrMetadata || '{}')
        : (post.vrMetadata || {});
      setInsight(meta.insight || '');
      setMood((meta.mood as MoodType) || '');
      setWeather((meta.weather as WeatherType) || '');
      // 回填配图
      if (post.mediaItems?.length > 0) {
        setImages(post.mediaItems
          .filter((m: any) => m.type === 'IMAGE')
          .map((m: any, i: number) => ({
            id: m.id || `existing-${i}`,
            url: m.url,
            width: m.width || 0,
            height: m.height || 0,
            originalName: '',
            size: 0,
            isCover: i === 0,
          })));
      }
      // 回填关联素材 ID
      if (Array.isArray(meta.sourceSnapIds)) {
        setSnapIds(meta.sourceSnapIds);
      }
    } catch {
      toast.error('加载日记失败');
      router.replace('/diaries');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // 从 URL snapIds 加载素材图片（用作封面配图）
  const loadSnapImages = useCallback(async (ids: string[]) => {
    if (ids.length === 0) { setLoading(false); return; }
    try {
      const posts = await Promise.all(ids.map(id => getPostDetail(id).catch(() => null)));
      const imgs: UploadedImage[] = [];
      posts.filter(Boolean).forEach((post: any) => {
        post.mediaItems?.forEach((m: any) => {
          if (m.type === 'IMAGE' && imgs.length < 9) {
            imgs.push({
              id: m.id || `snap-${m.url}`,
              url: m.url,
              width: m.width || 0,
              height: m.height || 0,
              originalName: '',
              size: 0,
              isCover: imgs.length === 0,
              snapId: post.id,
            });
          }
        });
      });
      if (imgs.length > 0) setImages(imgs);
    } catch {
      // 加载失败不阻断写日记
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (editId) {
      loadExistingDiary(editId);
    } else if (urlSnapIds.length > 0) {
      loadSnapImages(urlSnapIds);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 本地上传图片
  const handleLocalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const remaining = 9 - images.length;
    if (remaining <= 0) {
      toast.warning('最多上传 9 张图片');
      return;
    }
    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      const results = await Promise.all(
        toUpload.map(async (file) => {
          const uploaded = await uploadImage(file);
          let { width, height } = uploaded;
          if (!width || !height) {
            try {
              const dims = await getImageDimensions(uploaded.url);
              width = dims.width;
              height = dims.height;
            } catch { /* ignore */ }
          }
          return {
            id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            url: uploaded.url,
            width,
            height,
            originalName: uploaded.originalName,
            size: uploaded.size,
            isCover: false,
          } as UploadedImage;
        })
      );
      setImages((prev) => {
        const next = [...prev, ...results];
        // 第一张自动设为封面
        if (next.length > 0) {
          next.forEach((img, i) => { img.isCover = i === 0; });
        }
        return next;
      });
      toast.success(`已上传 ${results.length} 张图片`);
    } catch {
      toast.error('图片上传失败');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // 删除图片
  const removeImage = (idx: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length > 0) next[0].isCover = true;
      return next;
    });
  };

  // 设为封面
  const setCover = (idx: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isCover: i === idx }))
    );
  };

  // 素材选择器回调 — 从素材库加载的图片与本地上传的图片共存
  const handleSnapConfirm = async (ids: string[]) => {
    setPickerOpen(false);
    if (ids.length === 0) {
      // 清空素材库选择，只保留本地上传的图片
      setImages((prev) => {
        const locals = prev.filter((img) => !img.snapId);
        if (locals.length > 0) locals[0].isCover = true;
        return locals;
      });
      setSnapIds([]);
      return;
    }
    setSnapIds(ids);
    // 从素材加载图片，与已有的本地图片合并
    try {
      const posts = await Promise.all(ids.map((id) => getPostDetail(id).catch(() => null)));
      const snapImgs: UploadedImage[] = [];
      posts.filter(Boolean).forEach((post: any) => {
        post.mediaItems?.forEach((m: any) => {
          if (m.type === 'IMAGE' && snapImgs.length < 9) {
            snapImgs.push({
              id: `snap-${post.id}-${m.id || m.url}`,
              url: m.thumbnailUrl || m.url,
              width: m.width || 0,
              height: m.height || 0,
              originalName: '',
              size: 0,
              isCover: false,
              snapId: post.id,
            });
          }
        });
      });
      setImages((prev) => {
        const locals = prev.filter((img) => !img.snapId); // 保留本地上传的
        const merged = [...snapImgs, ...locals].slice(0, 9);
        if (merged.length > 0) merged[0].isCover = true;
        return merged;
      });
    } catch {
      toast.error('加载素材图片失败');
    }
  };

  // 保存
  const handleSave = async (status: 'draft' | 'private' | 'public') => {
    if (!content.trim() && !title.trim()) {
      toast.warning('请写点什么再保存');
      return;
    }
    setSaving(true);
    try {
      const coverImage = images[0]?.url || undefined;
      const result = await saveDiary({
        diaryId: editId || undefined,
        snapId: snapIds[0] || undefined,
        title: title.trim() || '日记',
        content: content.trim(),
        insight: insight.trim() || undefined,
        mood: mood || undefined,
        weather: weather || undefined,
        status,
        image: coverImage,
      });
      const savedId = result?.id || editId;

      if (status === 'draft') {
        toast.success('草稿已保存');
        // 草稿留在当前页面继续编辑；新创建的草稿需更新 URL
        if (!editId && savedId) {
          router.replace(`/diaries/new?edit=${savedId}`, { scroll: false });
        }
      } else if (status === 'private') {
        toast.success('已保存为私密日记');
        router.push('/diaries');
      } else {
        toast.success('已发布到日记广场');
        if (savedId) {
          router.push(`/diaries/${savedId}`);
        } else {
          router.push('/diaries');
        }
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        toast.error('登录已过期，请重新登录后再试');
        router.push('/login');
      } else {
        toast.error('保存失败，请重试');
      }
    } finally {
      setSaving(false);
    }
  };

  // 加载中
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-500" />
          <p className="mt-3 text-sm text-muted-foreground">
            {editId ? '正在加载日记...' : '正在加载素材...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28">
      {/* 顶部栏 */}
      <div className="sticky top-0 z-20 -mx-4 mb-6 border-b bg-background/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost" size="icon"
            onClick={() => router.push('/diaries')}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-sm">
            <PenLine className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-base font-bold leading-tight">
              {editId ? '编辑日记' : '写日记'}
            </h1>
            <p className="text-[11px] leading-tight text-muted-foreground">
              {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
            </p>
          </div>
        </div>
      </div>

      {/* 主内容卡片 */}
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        {/* 配图区域 */}
        <div className="border-b border-border/40 p-4">
          {/* 图片网格 */}
          {images.length > 0 && (
            <div className="mb-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
              {images.map((img, i) => (
                <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                  {img.isCover && (
                    <span className="absolute top-0 left-0 rounded-br-lg bg-indigo-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                      封面
                    </span>
                  )}
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-bl-lg bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <X className="h-3 w-3" />
                  </button>
                  {!img.isCover && (
                    <button type="button" onClick={() => setCover(i)}
                      className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-0.5 bg-black/50 py-0.5 text-[9px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <Star className="h-2.5 w-2.5" />封面
                    </button>
                  )}
                </div>
              ))}

              {/* 添加：电脑上传 */}
              {images.length < 9 && (
                <button type="button" disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="group/add flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border/60 text-muted-foreground transition-colors hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30">
                  {uploading
                    ? <Loader2 className="h-5 w-5 animate-spin" />
                    : <Upload className="h-5 w-5" />
                  }
                  <span className="text-[10px] font-medium">
                    {uploading ? '上传中' : '电脑上传'}
                  </span>
                </button>
              )}

              {/* 添加：素材库 */}
              {images.length < 9 && (
                <button type="button"
                  onClick={() => setPickerOpen(true)}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border/60 text-muted-foreground transition-colors hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30">
                  <ImageIcon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">素材库</span>
                </button>
              )}
            </div>
          )}

          {/* 空状态：两个选择入口 */}
          {images.length === 0 && (
            <div className="grid grid-cols-2 gap-3">
              <button type="button" disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2.5 rounded-xl border-2 border-dashed border-border/60 py-7 text-muted-foreground transition-all hover:border-indigo-300 hover:bg-indigo-50/30 hover:text-indigo-600">
                {uploading
                  ? <Loader2 className="h-8 w-8 animate-spin" />
                  : <Upload className="h-8 w-8" />
                }
                <div className="text-center">
                  <p className="text-sm font-medium">{uploading ? '上传中...' : '电脑上传'}</p>
                  <p className="mt-0.5 text-[11px] opacity-60">选择本地图片文件</p>
                </div>
              </button>
              <button type="button"
                onClick={() => setPickerOpen(true)}
                className="flex flex-col items-center gap-2.5 rounded-xl border-2 border-dashed border-border/60 py-7 text-muted-foreground transition-all hover:border-indigo-300 hover:bg-indigo-50/30 hover:text-indigo-600">
                <ImageIcon className="h-8 w-8" />
                <div className="text-center">
                  <p className="text-sm font-medium">从素材库选择</p>
                  <p className="mt-0.5 text-[11px] opacity-60">使用已上传的拍摄素材</p>
                </div>
              </button>
            </div>
          )}

          {images.length > 0 && (
            <p className="text-center text-[11px] text-muted-foreground">
              {images.length}/9 张配图 · 第一张为封面 · 可同时使用电脑上传和素材库
            </p>
          )}
        </div>

        <div className="p-6">
          {/* 标题 */}
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="给这篇日记起个标题..."
            className="mb-4 border-0 bg-transparent px-0 text-2xl font-bold tracking-tight placeholder:text-muted-foreground/30 focus-visible:ring-0"
          />

          {/* 正文 */}
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下今天的所见所闻、所思所想..."
            className="min-h-[300px] resize-none border-0 bg-transparent px-0 text-[15px] leading-8 text-foreground/90 placeholder:text-muted-foreground/30 focus-visible:ring-0"
          />

          {/* 字数统计 */}
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{content.length} 字</span>
            {snapIds.length > 0 && (
              <span className="flex items-center gap-1">
                <ImageIcon className="h-3 w-3" />
                关联 {snapIds.length} 张素材
              </span>
            )}
          </div>
        </div>

        {/* 更多日记信息（可折叠） */}
        <div className="border-t border-border/40">
          <button
            type="button"
            onClick={() => setMetaOpen(!metaOpen)}
            className="flex w-full items-center justify-between px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/30"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              更多日记信息
            </span>
            <ChevronDown className={cn('h-4 w-4 transition-transform', metaOpen && 'rotate-180')} />
          </button>

          {metaOpen && (
            <div className="space-y-5 px-6 pb-6">
              {/* 感悟 */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-100 dark:bg-indigo-900">
                    <span className="text-xs">💭</span>
                  </span>
                  一句话感悟
                </label>
                <Input
                  value={insight}
                  onChange={(e) => setInsight(e.target.value)}
                  placeholder="写下此刻最想说的一句话..."
                  className="border-border/60 bg-muted/20 text-sm italic placeholder:text-muted-foreground/40"
                />
              </div>

              {/* 心情 */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-100 dark:bg-indigo-900">
                    <span className="text-xs">😊</span>
                  </span>
                  今天的心情
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(MoodEmoji).map(([key, emoji]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setMood(mood === key ? '' : key as MoodType)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-all',
                        mood === key
                          ? 'border-2 border-indigo-500 bg-indigo-100 shadow-sm dark:bg-indigo-900'
                          : 'border-2 border-transparent bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      <span>{emoji}</span>
                      <span className="font-medium">{MoodLabel[key as MoodType]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 天气 */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-100 dark:bg-indigo-900">
                    <span className="text-xs">🌤</span>
                  </span>
                  今天的天气
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(WeatherEmoji).map(([key, emoji]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setWeather(weather === key ? '' : key as WeatherType)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-all',
                        weather === key
                          ? 'border-2 border-indigo-500 bg-indigo-100 shadow-sm dark:bg-indigo-900'
                          : 'border-2 border-transparent bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      <span>{emoji}</span>
                      <span className="font-medium">{WeatherLabel[key as WeatherType]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 素材选择器 */}
      <SnapPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        initialIds={snapIds}
        max={9}
        onConfirm={handleSnapConfirm}
      />

      {/* 底部固定操作栏 */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span>默认私密</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost" size="sm"
              onClick={() => handleSave('draft')}
              disabled={saving || (!content.trim() && !title.trim())}
              className="h-9 gap-1.5 text-xs text-muted-foreground"
            >
              <FileText className="h-3.5 w-3.5" />
              存草稿
            </Button>
            <Button
              variant="outline" size="sm"
              onClick={() => handleSave('private')}
              disabled={saving || (!content.trim() && !title.trim())}
              className="h-9 gap-1.5 text-xs text-indigo-600"
            >
              <Lock className="h-3.5 w-3.5" />
              存为私密
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave('public')}
              disabled={saving || (!content.trim() && !title.trim())}
              className="h-9 gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 px-5 text-xs font-medium text-white shadow-md shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-600"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
              发布
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
