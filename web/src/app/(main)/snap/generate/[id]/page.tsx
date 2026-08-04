'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Sparkles, RefreshCw, MapPin, Clock,
  Globe, Lock, FileText, Brain, Check,
  Loader2, Heart, X, Wand2, Camera, PenLine, Layers, ChevronRight,
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

const styleMeta: Record<string, { emoji: string; desc: string; grad: string }> = {
  '温柔治愈风': { emoji: '🕊️', desc: '温暖抚慰，如沐春风', grad: 'from-amber-400 to-orange-400' },
  '生活碎片风': { emoji: '🧩', desc: '细碎日常，真实可爱', grad: 'from-sky-400 to-teal-400' },
  '成长复盘风': { emoji: '🌱', desc: '反思总结，向内生长', grad: 'from-emerald-400 to-teal-500' },
  '诗意散文风': { emoji: '🪶', desc: '散文诗般，意境悠远', grad: 'from-teal-400 to-cyan-500' },
  '轻松口语风': { emoji: '☕', desc: '轻松随性，像老朋友', grad: 'from-orange-400 to-amber-500' },
};

function GenerateContent({ snapId }: { snapId: string }) {
  const router = useRouter();
  const {
    generatedDiary, generating, currentStyle, memorySnap, includeMemory, existingDraftId,
    generateDiary, setStyle, setIncludeMemory, editGeneratedDiary, saveDiary,
    fetchDiaryDraft, resetGeneration,
  } = useSnapStore();

  const [snap, setSnap] = useState<any>(null);
  const [snapLoading, setSnapLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);

  // 初始化：加载素材 + 检查已有草稿
  useEffect(() => {
    setSnapLoading(true);
    Promise.all([
      getPostDetail(snapId).catch(() => null),
      fetchDiaryDraft(snapId).catch(() => false),
    ])
      .then(([snapData, hasDraft]) => {
        if (snapData) {
          setSnap(snapData);
        } else {
          toast.error('加载闪拍失败');
        }
        // 如果没有草稿，标记需要自动生成
        if (!hasDraft) {
          setInitialized(false);
        } else {
          setInitialized(true);
          toast.info('已恢复上次保存的草稿');
        }
      })
      .finally(() => setSnapLoading(false));
    return () => { resetGeneration(); };
  }, [snapId]);

  // 如果没有草稿，自动 AI 生成
  useEffect(() => {
    if (snap && !initialized && !generating && !generatedDiary) {
      setInitialized(true);
      generateDiary(snapId);
    }
  }, [snap, initialized, generating, generatedDiary]);

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

      if (status === 'draft') {
        toast.success('草稿已保存');
        // 草稿保存后留在当前页面继续编辑
      } else if (status === 'private') {
        toast.success('已保存为私密日记');
        router.push('/diaries');
      } else {
        toast.success('已发布到日记广场');
        router.push('/snap/square');
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
        <div className="text-center">
          <div className="relative mx-auto h-20 w-20">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-teal-100 border-t-teal-500 dark:border-teal-900/40" />
            <div className="absolute inset-2 animate-spin rounded-full border-4 border-orange-100 border-b-orange-400 dark:border-orange-900/40" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            <Wand2 className="absolute inset-0 m-auto h-7 w-7 text-teal-600" />
          </div>
          <p className="mt-5 text-base font-semibold">
            {snapLoading ? '正在加载闪拍记录' : 'AI 正在撰写你的日记'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {snapLoading ? '从服务器获取素材...' : '读懂你的心情，把瞬间写成文字...'}
          </p>
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
    <div className="mx-auto max-w-5xl px-2 pb-24">
      {/* 顶部栏：只留返回 + 标题 */}
      <div className="sticky top-0 z-20 -mx-2 mb-6 border-b bg-background/85 px-2 py-3 backdrop-blur-lg">
        <div className="flex items-center gap-2.5">
          <Button variant="ghost" size="icon" onClick={() => router.push('/snap')} className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-orange-400 text-white shadow-md shadow-teal-500/20">
            <PenLine className="h-4.5 w-4.5" />
          </span>
          <div>
            <h1 className="text-base font-bold leading-tight">AI 日记创作</h1>
            <p className="text-[11px] leading-tight text-muted-foreground">从闪拍素材智能生成</p>
          </div>
        </div>
      </div>

      {/* 布局：左素材 | 中编辑 | 右风格 */}
      <div className="grid gap-4 xl:grid-cols-[170px_minmax(0,1fr)_190px] lg:grid-cols-[150px_minmax(0,1fr)_170px]">
        {/* 左栏：素材 */}
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            {/* 素材封面 */}
            <div className="relative">
              {snapImage ? (
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img src={snapImage} alt="" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-muted to-muted/40">
                  <Camera className="h-10 w-10 text-muted-foreground/20" />
                </div>
              )}
              {/* 底部渐变遮罩 */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <div className="flex items-center gap-1.5">
                  <Badge className="border-0 bg-white/20 text-white backdrop-blur-sm">📷 闪拍素材</Badge>
                  {scene && <Badge className="border-0 bg-white/20 text-white backdrop-blur-sm">{scene}</Badge>}
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4">
              <p className="text-sm leading-relaxed text-foreground/90">{snap.content || '(无内容)'}</p>

              <div className="space-y-1.5 text-xs text-muted-foreground">
                {snap.location?.name && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-teal-500" />
                    <span className="truncate">{snap.location.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-orange-400" />
                  {new Date(snap.createdAt).toLocaleString('zh-CN')}
                </div>
                {mood && (
                  <div className="flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 shrink-0 fill-rose-400 text-rose-400" />
                    <span>心情：{mood}</span>
                  </div>
                )}
              </div>

              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {keywords.map((kw: string) => (
                    <span key={kw} className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-700 dark:bg-teal-950/50 dark:text-teal-400">
                      #{kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 回忆反差 */}
          {memorySnap && (
            <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50/50 p-4 dark:border-orange-900/50 dark:from-orange-950/20 dark:to-transparent">
              <div className="flex items-center gap-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/40">
                  <Brain className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold text-orange-800 dark:text-orange-300">回忆反差</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-orange-700/70 dark:text-orange-400/70">
                找到一条相似的旧日回忆，加入后让今天的自己与过去对话
              </p>
              <div className="mt-2 rounded-xl bg-white/70 p-2.5 text-xs leading-relaxed text-muted-foreground line-clamp-2 dark:bg-black/20">
                {memorySnap.text || '(无内容)'}
              </div>
              <Button
                size="sm"
                variant={includeMemory ? 'default' : 'outline'}
                className={`mt-2.5 w-full gap-1.5 ${includeMemory ? 'bg-orange-500 hover:bg-orange-600' : 'text-orange-600 hover:text-orange-700'}`}
                onClick={handleMemoryToggle}
              >
                {includeMemory ? <Check className="h-3.5 w-3.5" /> : <Brain className="h-3.5 w-3.5" />}
                {includeMemory ? '已加入回忆' : '加入回忆反差'}
              </Button>
            </div>
          )}
        </div>

        {/* 中栏：日记编辑器 */}
        <div className="min-w-0 overflow-hidden rounded-2xl border bg-card shadow-sm">
          {generatedDiary ? (
            <>
              {/* 标题 */}
              <div className="border-b border-border/60 px-6 py-5">
                <Input
                  value={generatedDiary.title}
                  onChange={(e) => editGeneratedDiary({ title: e.target.value })}
                  placeholder="给这篇日记起个标题..."
                  className="border-0 bg-transparent px-0 text-2xl font-bold tracking-tight placeholder:text-muted-foreground/30 focus-visible:ring-0"
                />
              </div>

              {/* 正文 */}
              <div className="px-6 py-5">
                <Textarea
                  value={generatedDiary.content}
                  onChange={(e) => editGeneratedDiary({ content: e.target.value })}
                  placeholder="AI 已为你写好初稿，可以自由润色..."
                  className="min-h-[320px] resize-none border-0 bg-transparent px-0 text-[15px] leading-8 text-foreground/90 placeholder:text-muted-foreground/30 focus-visible:ring-0"
                />
              </div>

              {/* 底部：感悟 + 标签 + 保存 */}
              <div className="border-t border-border/60 bg-muted/30 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 shrink-0 text-orange-400" />
                  <Input
                    value={generatedDiary.insight}
                    onChange={(e) => editGeneratedDiary({ insight: e.target.value })}
                    placeholder="写下一句感悟..."
                    className="border-0 bg-transparent px-0 text-sm italic text-foreground/70 placeholder:text-muted-foreground/40 focus-visible:ring-0"
                  />
                </div>

                {generatedDiary.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 shrink-0 text-teal-500" />
                    {generatedDiary.tags.map((t, i) => (
                      <span key={i} className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-orange-100 text-3xl dark:from-teal-900/30 dark:to-orange-900/30">
                ✨
              </div>
              <p className="mt-4 text-sm text-muted-foreground">正在为你的瞬间创作文字...</p>
            </div>
          )}
        </div>

        {/* 右栏：风格选择 */}
        <div>
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-amber-400 text-white shadow-sm">
                <Wand2 className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight">选择风格</p>
                <p className="text-[11px] leading-tight text-muted-foreground">决定日记的语气与气质</p>
              </div>
            </div>

            <div className="space-y-1.5">
              {ALL_DIARY_STYLES.map((style) => {
                const active = style === currentStyle;
                const meta = styleMeta[style] || { emoji: '✨', desc: '', grad: 'from-teal-400 to-cyan-500' };
                return (
                  <button
                    key={style}
                    onClick={() => handleStyleChange(style)}
                    disabled={generating}
                    className={`group flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-all duration-200 ${
                      active
                        ? `border-transparent bg-gradient-to-r ${meta.grad} bg-origin-border text-white shadow-md`
                        : 'border-border/60 hover:border-teal-300 hover:bg-teal-50/50 dark:hover:bg-teal-950/30'
                    }`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base ${active ? 'bg-white/25' : 'bg-muted'}`}>
                      {meta.emoji}
                    </span>
                    <span className={`min-w-0 flex-1 truncate text-sm ${active ? 'font-semibold' : 'font-medium'}`}>
                      {style}
                    </span>
                    {active && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 border-t border-border/50 pt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 border-teal-200 text-teal-700 hover:bg-teal-50 dark:border-teal-900 dark:text-teal-400 dark:hover:bg-teal-950/40"
                onClick={handleRegenerate}
                disabled={generating}
              >
                {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                换风格重写
                <ChevronRight className="h-3.5 w-3.5 ml-auto" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 底部固定操作栏（移动端式） */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/90 backdrop-blur-lg">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground/70 sm:block">
              {generating ? 'AI 正在生成...' : generatedDiary
                ? (existingDraftId ? '草稿已保存，可继续编辑或发布' : '修改满意后即可保存发布')
                : '正在准备...'}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSave('draft')}
                disabled={saving || !generatedDiary}
                className="h-9 gap-1.5 text-xs text-muted-foreground"
              >
                <FileText className="h-3.5 w-3.5" />{existingDraftId ? '更新草稿' : '存草稿'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSave('private')}
                disabled={saving || !generatedDiary}
                className="h-9 gap-1.5 text-xs text-amber-600"
              >
                <Lock className="h-3.5 w-3.5" />存为私密
              </Button>
              <Button
                size="sm"
                onClick={() => handleSave('public')}
                disabled={saving || !generatedDiary}
                className="h-9 gap-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 px-5 text-xs font-medium shadow-md shadow-teal-500/25 hover:from-teal-600 hover:to-emerald-600"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
                发布
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
