'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Sparkles, RefreshCw, MapPin, Clock,
  Edit3, Save, Globe, Lock, FileText, Brain, Check,
  Loader2, Heart, PenLine, X, Wand2, ImagePlus, Type,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AuthGuard } from '@/components/auth-guard';
import { useSnapStore } from '@/stores/snap-store';
import { ALL_DIARY_STYLES, type DiaryStyle } from '@/types/snap';
import { getPostDetail } from '@/lib/snap-api';
import { toast } from 'sonner';

export default function GeneratePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AuthGuard>
      <GenerateContent snapId={id} />
    </AuthGuard>
  );
}

const styleEmoji: Record<string, string> = {
  '温柔治愈风': '🕊️',
  '生活碎片风': '🧩',
  '成长复盘风': '🌱',
  '诗意散文风': '🪶',
  '轻松口语风': '☕',
};
const styleDesc: Record<string, string> = {
  '温柔治愈风': '温暖抚慰，如微风',
  '生活碎片风': '记录细碎日常',
  '成长复盘风': '反思与总结',
  '诗意散文风': '散文诗般优美',
  '轻松口语风': '轻松随性的口吻',
};

function GenerateContent({ snapId }: { snapId: string }) {
  const router = useRouter();
  const {
    generatedDiary, generating, currentStyle, memorySnap, includeMemory,
    generateDiary, setStyle, setIncludeMemory, editGeneratedDiary, saveDiary, resetGeneration,
  } = useSnapStore();

  const [snap, setSnap] = useState<any>(null);
  const [snapLoading, setSnapLoading] = useState(true);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSnapLoading(true);
    getPostDetail(snapId)
      .then(setSnap)
      .catch(() => toast.error('加载闪拍失败'))
      .finally(() => setSnapLoading(false));
    return () => { resetGeneration(); };
  }, [snapId]);

  useEffect(() => {
    if (snap && !hasGenerated) {
      setHasGenerated(true);
      generateDiary(snapId);
    }
  }, [snap, hasGenerated]);

  const snapMeta = (() => {
    try {
      if (!snap?.vrMetadata) return {};
      return typeof snap.vrMetadata === 'string' ? JSON.parse(snap.vrMetadata) : snap.vrMetadata;
    } catch { return {}; }
  })();

  const keywords: string[] = snapMeta.keywords || [];
  const mood = snapMeta.mood || '';
  const scene = snapMeta.scene || '';

  const snapImage = snap?.mediaItems?.length > 0
    ? (snap.mediaItems[0].thumbnailUrl || snap.mediaItems[0].url)
    : snapMeta.image || null;

  const handleRegenerate = () => {
    generateDiary(snapId, currentStyle, includeMemory);
  };

  const handleStyleChange = (style: DiaryStyle) => {
    setStyle(style);
    generateDiary(snapId, style, includeMemory);
  };

  const handleMemoryToggle = () => {
    const next = !includeMemory;
    setIncludeMemory(next);
    generateDiary(snapId, currentStyle, next);
  };

  const handleSave = async (status: 'draft' | 'private' | 'public') => {
    if (!generatedDiary) return;
    setSaving(true);
    try {
      await saveDiary({
        snapId,
        title: generatedDiary.title,
        content: generatedDiary.content,
        insight: generatedDiary.insight,
        style: generatedDiary.style,
        tags: generatedDiary.tags,
        status,
        image: snapImage || undefined,
      });

      const statusMsg = status === 'draft' ? '草稿已保存' : status === 'private' ? '已保存为私密日记' : '已发布到日记广场';
      toast.success(statusMsg);

      if (status === 'public') {
        router.push('/snap/square');
      } else {
        router.push('/diaries');
      }
    } catch {
      toast.error('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (snapLoading || generating) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-5">
          <div className="relative mx-auto h-16 w-16">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-500" />
            <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-indigo-500" />
          </div>
          <div>
            <p className="text-base font-medium">
              {snapLoading ? '正在加载闪拍记录' : 'AI 正在为你撰写日记'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {snapLoading ? '从服务器获取素材...' : '分析闪拍内容，融入你的心情与感悟...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!snap) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
          <Camera className="h-8 w-8 text-muted-foreground/30" />
        </div>
        <p className="mt-4 text-sm font-medium text-muted-foreground">闪拍记录不存在</p>
        <Button variant="ghost" className="mt-3" onClick={() => router.push('/snap')}>
          <ArrowLeft className="mr-1 h-4 w-4" />返回闪拍列表
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* 顶部栏 */}
      <div className="sticky top-0 z-20 -mx-4 mb-6 border-b bg-background/80 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push('/snap')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-base font-bold">AI 创作日记</h1>
              <p className="text-[11px] text-muted-foreground">从闪拍素材智能生成 · 可自由编辑</p>
            </div>
          </div>

          {generatedDiary && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="gap-1.5 text-muted-foreground"
              >
                <FileText className="h-4 w-4" />草稿
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSave('private')}
                disabled={saving}
                className="gap-1.5 text-amber-600"
              >
                <Lock className="h-4 w-4" />私密
              </Button>
              <Button
                size="sm"
                onClick={() => handleSave('public')}
                disabled={saving}
                className="gap-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 shadow-md shadow-indigo-500/20"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                发布
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr_260px]">
        {/* 左栏：素材卡片 */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30">
              <ImagePlus className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-semibold">素材</span>
            <Badge variant="outline" className="ml-auto text-[10px]">闪拍</Badge>
          </div>

          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            {snapImage ? (
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img src={snapImage} alt="" className="h-full w-full object-cover" />
                {scene && (
                  <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
                    {scene}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-muted/40">
                <span className="text-4xl">📷</span>
              </div>
            )}

            <div className="space-y-3 p-4">
              <p className="text-sm leading-relaxed">{snap.content || '(无内容)'}</p>

              <div className="space-y-1.5 text-xs text-muted-foreground">
                {snap.location?.name && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 shrink-0" />{snap.location.name}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 shrink-0" />
                  {new Date(snap.createdAt).toLocaleString('zh-CN')}
                </div>
                {mood && (
                  <div className="flex items-center gap-1.5">
                    <Heart className="h-3 w-3 shrink-0 text-rose-400" />
                    <span>心情：{mood}</span>
                  </div>
                )}
              </div>

              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {keywords.map((kw: string) => (
                    <span key={kw} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                      #{kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 回忆反差 */}
          {memorySnap && (
            <div className="mt-3 rounded-2xl border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-800 dark:bg-purple-950/20">
              <div className="flex items-center gap-1.5">
                <Brain className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">回忆反差</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-purple-600/70">
                找到一条相似回忆，加入后日记会更深刻地对比过去与现在
              </p>
              <div className="mt-2 line-clamp-2 rounded-lg bg-white/70 p-2 text-xs text-muted-foreground dark:bg-black/20">
                {memorySnap.text || '(无内容)'}
              </div>
              <Button
                size="sm"
                variant={includeMemory ? 'default' : 'outline'}
                className={`mt-2 w-full gap-1 ${includeMemory ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                onClick={handleMemoryToggle}
              >
                {includeMemory ? <Check className="h-3.5 w-3.5" /> : <Brain className="h-3.5 w-3.5" />}
                {includeMemory ? '已加入' : '加入回忆反差'}
              </Button>
            </div>
          )}
        </div>

        {/* 中栏：编辑器 */}
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          {generatedDiary ? (
            <div className="flex flex-col">
              {/* 标题区 */}
              <div className="border-b px-6 py-4">
                <Input
                  value={generatedDiary.title}
                  onChange={(e) => editGeneratedDiary({ title: e.target.value })}
                  placeholder="给日记起个标题..."
                  className="border-0 bg-transparent px-0 text-xl font-bold placeholder:text-muted-foreground/40 focus-visible:ring-0"
                />
              </div>

              {/* 正文区 */}
              <div className="flex-1 px-6 py-5">
                <Textarea
                  value={generatedDiary.content}
                  onChange={(e) => editGeneratedDiary({ content: e.target.value })}
                  placeholder="AI 已为你生成初稿，可以自由修改..."
                  className="min-h-[360px] resize-none border-0 bg-transparent px-0 leading-relaxed text-[15px] focus-visible:ring-0"
                />
              </div>

              {/* 底部：感悟 + 标签 */}
              <div className="border-t px-6 py-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                  <Input
                    value={generatedDiary.insight}
                    onChange={(e) => editGeneratedDiary({ insight: e.target.value })}
                    placeholder="一句话感悟（可选）..."
                    className="border-0 bg-transparent px-0 text-sm italic text-muted-foreground focus-visible:ring-0"
                  />
                </div>

                {generatedDiary.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <PenLine className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                    {generatedDiary.tags.map((t, i) => (
                      <span key={i} className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs text-indigo-600 dark:bg-indigo-950/40">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
              <Wand2 className="h-10 w-10 text-muted-foreground/20" />
              <p className="mt-3 text-sm text-muted-foreground">等待 AI 生成...</p>
            </div>
          )}
        </div>

        {/* 右栏：风格选择 */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30">
              <Type className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-semibold">写作风格</span>
          </div>

          <div className="rounded-2xl border bg-card p-3 shadow-sm">
            <div className="space-y-1.5">
              {ALL_DIARY_STYLES.map((style) => {
                const active = style === currentStyle;
                return (
                  <button
                    key={style}
                    onClick={() => handleStyleChange(style)}
                    disabled={generating}
                    className={`flex w-full items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-all duration-200 ${
                      active
                        ? 'border-indigo-500 bg-indigo-50/70 shadow-sm dark:bg-indigo-950/30'
                        : 'border-transparent hover:border-muted-foreground/10 hover:bg-muted/40'
                    }`}
                  >
                    <span className="text-xl">{styleEmoji[style]}</span>
                    <div className="min-w-0 flex-1">
                      <span className={`block text-sm ${active ? 'font-medium text-indigo-700 dark:text-indigo-300' : ''}`}>
                        {style}
                      </span>
                      <span className="block truncate text-[10px] text-muted-foreground/70">
                        {styleDesc[style]}
                      </span>
                    </div>
                    {active && <Check className="h-4 w-4 shrink-0 text-indigo-500" />}
                  </button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full gap-1.5"
              onClick={handleRegenerate}
              disabled={generating}
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              换风格重写
            </Button>

            {generating && (
              <div className="mt-2 flex items-center justify-center gap-2 text-xs text-indigo-600">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                正在重写...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
