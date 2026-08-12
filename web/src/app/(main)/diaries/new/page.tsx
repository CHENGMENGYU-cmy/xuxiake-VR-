'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, PenLine, Lock, Globe, FileText, Loader2,
  Sparkles, Image as ImageIcon, ChevronDown, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AuthGuard } from '@/components/auth-guard';
import { MultiImageUploader, type UploadedImage } from '@/components/upload/multi-image-uploader';
import { SnapPickerDialog } from '@/components/diary/snap-picker';
import { getPostDetail, saveDiary } from '@/lib/snap-api';
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
  const [pickerOpen, setPickerOpen] = useState(false);

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

  // 素材选择器回调
  const handleSnapConfirm = (ids: string[]) => {
    setSnapIds(ids);
    setPickerOpen(false);
    // 重新加载素材图片
    if (ids.length > 0 && !editId) {
      setLoading(true);
      loadSnapImages(ids);
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
      const refSnapIds = images.filter(i => i.snapId).map(i => i.snapId as string);
      await saveDiary({
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

      if (status === 'draft') {
        toast.success('草稿已保存');
      } else if (status === 'private') {
        toast.success('已保存为私密日记');
        router.push('/diaries');
      } else {
        toast.success('已发布到日记广场');
        router.push('/diaries');
      }
    } catch {
      toast.error('保存失败，请重试');
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

  const coverImage = images.length > 0 ? images[0] : null;

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
        {/* 封面图区域 */}
        <div className="border-b border-border/40">
          {coverImage ? (
            <div className="group relative">
              <div className="aspect-[16/9] bg-muted">
                <img
                  src={coverImage.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/40 via-transparent to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="text-xs text-white/80">
                  {images.length} 张配图
                </span>
                <Button
                  variant="secondary" size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => setPickerOpen(true)}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  更换配图
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="flex w-full flex-col items-center gap-2 py-8 text-muted-foreground transition-colors hover:bg-muted/40"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/20">
                <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
              </div>
              <span className="text-xs">添加封面配图（可选）</span>
            </button>
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
