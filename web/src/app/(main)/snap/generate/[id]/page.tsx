'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Sparkles, RefreshCw, BookOpen, Camera, MapPin, Clock,
  Edit3, Save, Globe, Lock, FileText, Brain, Check,
  Loader2, ImageIcon, Tag, Heart, ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
      <div className="flex items-center justify-center py-32">
        <div className="text-center space-y-5">
          <div className="relative mx-auto">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
            <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-orange-500" />
          </div>
          <div>
            <p className="text-base font-medium">{snapLoading ? '加载闪拍记录...' : 'AI 正在生成日记'}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {snapLoading ? '正在从服务器获取数据' : '正在分析你的闪拍内容，生成个性化日记'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!snap) {
    return (
      <div className="flex flex-col items-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
          <Camera className="h-8 w-8 text-muted-foreground/30" />
        </div>
        <p className="mt-4 text-sm font-medium text-muted-foreground">闪拍记录不存在</p>
        <Button variant="ghost" className="mt-3" onClick={() => router.push('/snap')}>
          <ArrowLeft className="h-4 w-4 mr-1" />返回闪拍列表
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/snap')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">AI 日记生成</h1>
            <p className="text-xs text-muted-foreground">从闪拍生成个性化日记，可编辑后保存或发布</p>
          </div>
        </div>
        {generatedDiary && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="gap-1.5"
            >
              <FileText className="h-4 w-4" />
              草稿
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave('private')}
              disabled={saving}
              className="gap-1.5"
            >
              <Lock className="h-4 w-4" />
              私密
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave('public')}
              disabled={saving}
              className="gap-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
              发布
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[240px_1fr_240px]">
        {/* 左栏：原始闪拍 */}
        <Card className="h-fit border-0 bg-muted/40 shadow-none lg:sticky lg:top-20">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30">
                <Camera className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm font-semibold">原始闪拍</span>
            </div>

            {snapImage ? (
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted shadow-sm">
                <img src={snapImage} alt="" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-background border">
                <ImageIcon className="h-8 w-8 text-muted-foreground/25" />
              </div>
            )}

            <p className="text-sm leading-relaxed">{snap.content || '(无内容)'}</p>

            <div className="space-y-2 text-xs text-muted-foreground">
              {snap.location?.name && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{snap.location.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                {new Date(snap.createdAt).toLocaleString('zh-CN')}
              </div>
              {mood && (
                <div className="flex items-center gap-2">
                  <Heart className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                  情绪：{mood}
                </div>
              )}
              {scene && (
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 shrink-0" />
                  场景：{scene}
                </div>
              )}
            </div>

            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {keywords.map((kw: string) => (
                  <Badge key={kw} variant="outline" className="text-[10px]">{kw}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 中栏：日记编辑器 */}
        <Card className="shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30">
                <Edit3 className="h-3.5 w-3.5" />
              </span>
              <h2 className="font-semibold">日记内容</h2>
              {generatedDiary && (
                <Badge className="ml-auto" variant="secondary">
                  {generatedDiary.style}
                </Badge>
              )}
            </div>

            {generatedDiary ? (
              <>
                {/* 标题 */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">标题</label>
                  <Input
                    value={generatedDiary.title}
                    onChange={(e) => editGeneratedDiary({ title: e.target.value })}
                    className="text-base font-semibold border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                  />
                </div>

                {/* 正文 */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">正文</label>
                  <Textarea
                    value={generatedDiary.content}
                    onChange={(e) => editGeneratedDiary({ content: e.target.value })}
                    className="min-h-[300px] leading-relaxed text-sm resize-y border-0 rounded-none px-0 focus-visible:ring-0 bg-transparent"
                  />
                </div>

                {/* 感悟 */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />一句感悟
                  </label>
                  <Input
                    value={generatedDiary.insight}
                    onChange={(e) => editGeneratedDiary({ insight: e.target.value })}
                    className="text-sm italic border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary text-muted-foreground"
                  />
                </div>

                {/* 标签 */}
                {generatedDiary.tags.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Tag className="h-3 w-3" />标签
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {generatedDiary.tags.map((t, i) => (
                        <Badge key={i} variant="secondary" className="text-xs px-2 py-0.5">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Sparkles className="h-10 w-10 text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground">等待 AI 生成...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 右栏：风格 + 回忆 */}
        <div className="space-y-3 lg:sticky lg:top-20">
          {/* 风格选择 */}
          <Card className="shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-semibold">选择风格</span>
              </div>
              <div className="space-y-1">
                {ALL_DIARY_STYLES.map((style) => (
                  <button
                    key={style}
                    onClick={() => handleStyleChange(style)}
                    disabled={generating}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                      style === currentStyle
                        ? 'bg-orange-50 text-orange-700 border-2 border-orange-200 shadow-sm dark:bg-orange-950/20 dark:text-orange-300 dark:border-orange-700'
                        : 'border-2 border-transparent hover:bg-muted/60 hover:border-muted-foreground/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {style === currentStyle && <Check className="h-3.5 w-3.5 shrink-0 text-orange-500" />}
                      <span className={style === currentStyle ? 'font-medium' : ''}>{style}</span>
                    </div>
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5"
                onClick={handleRegenerate}
                disabled={generating}
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                重新生成
              </Button>
            </CardContent>
          </Card>

          {/* 回忆反差 */}
          {memorySnap && (
            <Card className="border-purple-200 bg-purple-50/50 shadow-sm dark:border-purple-800 dark:bg-purple-950/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-100 text-purple-600 dark:bg-purple-900/50">
                    <Brain className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">回忆反差</span>
                </div>
                <p className="text-xs text-purple-600/70 dark:text-purple-400/70 leading-relaxed">
                  找到一条相似的旧日回忆。加入后 AI 会更深刻地对比如今的你和过去的你。
                </p>
                <div className="rounded-lg bg-white/70 dark:bg-black/20 p-2.5 text-xs text-muted-foreground line-clamp-2 border border-purple-100 dark:border-purple-800/50">
                  {memorySnap.text || '(无内容)'}
                  <div className="text-[10px] mt-1 text-purple-500">
                    {memorySnap.createdAt ? new Date(memorySnap.createdAt).toLocaleDateString('zh-CN') : ''}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={includeMemory ? 'default' : 'outline'}
                  className={`w-full gap-1.5 ${includeMemory ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                  onClick={handleMemoryToggle}
                >
                  {includeMemory ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> 已加入
                    </>
                  ) : (
                    <>
                      <Brain className="h-3.5 w-3.5" /> 加入回忆反差
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
