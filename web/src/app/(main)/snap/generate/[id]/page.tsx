'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Sparkles, RefreshCw, BookOpen, Camera, MapPin, Clock,
  Tag, Edit3, Save, Globe, Lock, FileText, Brain, Check, ChevronRight,
  Loader2, ImageIcon,
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

  // 加载闪拍详情
  useEffect(() => {
    setSnapLoading(true);
    getPostDetail(snapId)
      .then(setSnap)
      .catch(() => toast.error('加载闪拍失败'))
      .finally(() => setSnapLoading(false));

    return () => { resetGeneration(); };
  }, [snapId]);

  // 自动生成
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
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm text-muted-foreground">
            {snapLoading ? '加载闪拍记录...' : 'AI 正在生成日记...'}
          </p>
        </div>
      </div>
    );
  }

  if (!snap) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">闪拍记录不存在</p>
        <Button variant="ghost" className="mt-3" onClick={() => router.push('/snap')}>
          <ArrowLeft className="h-4 w-4 mr-1" />返回闪拍列表
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 顶部导航 */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/snap')}>
          <ArrowLeft className="h-4 w-4 mr-1" />返回
        </Button>
        <h1 className="text-lg font-bold">生成日记</h1>
      </div>

      {/* 三栏布局 */}
      <div className="grid gap-4 lg:grid-cols-[280px_1fr_260px]">
        {/* 左栏：原始闪拍 */}
        <Card className="h-fit lg:sticky lg:top-20">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Camera className="h-4 w-4" />
              原始闪拍
            </div>

            {/* 图片 */}
            {snapImage && (
              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                <img src={snapImage} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            {/* 文字 */}
            <p className="text-sm leading-relaxed">{snap.content || '(无内容)'}</p>

            {/* 信息 */}
            <div className="space-y-2 text-xs text-muted-foreground">
              {snap.location?.name && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  {snap.location.name}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                {new Date(snap.createdAt).toLocaleString('zh-CN')}
              </div>
              {mood && (
                <div className="flex items-center gap-2">
                  <span className="text-base">😊</span>
                  情绪：{mood}
                </div>
              )}
              {scene && (
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5" />
                  场景：{scene}
                </div>
              )}
            </div>

            {/* 关键词 */}
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {keywords.map((kw: string) => (
                  <Badge key={kw} variant="outline" className="text-[10px]">
                    {kw}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 中栏：日记编辑区 */}
        <Card className="min-h-[500px]">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-indigo-500" />
              <h2 className="font-semibold">日记内容</h2>
              {generatedDiary && (
                <Badge variant="secondary" className="text-xs ml-auto">
                  {generatedDiary.style}
                </Badge>
              )}
            </div>

            {generatedDiary ? (
              <>
                {/* 标题 */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">标题</label>
                  <Input
                    value={generatedDiary.title}
                    onChange={(e) => editGeneratedDiary({ title: e.target.value })}
                    className="font-semibold text-lg"
                  />
                </div>

                {/* 正文 */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">正文</label>
                  <Textarea
                    value={generatedDiary.content}
                    onChange={(e) => editGeneratedDiary({ content: e.target.value })}
                    className="min-h-[280px] leading-relaxed text-sm resize-y"
                  />
                </div>

                {/* 感悟 + 标签 */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">一句感悟</label>
                    <Input
                      value={generatedDiary.insight}
                      onChange={(e) => editGeneratedDiary({ insight: e.target.value })}
                      className="text-sm italic"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">标签</label>
                    <div className="flex flex-wrap gap-1">
                      {generatedDiary.tags.map((t, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSave('draft')}
                    disabled={saving}
                    className="gap-1.5"
                  >
                    <FileText className="h-4 w-4" />
                    保存草稿
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSave('private')}
                    disabled={saving}
                    className="gap-1.5"
                  >
                    <Lock className="h-4 w-4" />
                    保存为私密
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSave('public')}
                    disabled={saving}
                    className="gap-1.5 ml-auto bg-indigo-600 hover:bg-indigo-700"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                    发布到广场
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-16 text-center text-sm text-muted-foreground">
                准备生成...
              </div>
            )}
          </CardContent>
        </Card>

        {/* 右栏：风格推荐 + 辅助 */}
        <div className="space-y-3 lg:sticky lg:top-20">
          {/* 风格选择 */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Sparkles className="h-4 w-4 text-orange-500" />
                推荐风格
              </div>
              <div className="space-y-1.5">
                {ALL_DIARY_STYLES.map((style) => (
                  <button
                    key={style}
                    onClick={() => handleStyleChange(style)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      style === currentStyle
                        ? 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800'
                        : 'hover:bg-muted/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {style === currentStyle && <Check className="h-3.5 w-3.5 shrink-0" />}
                      <span className={style === currentStyle ? '' : 'ml-[22px]'}>{style}</span>
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
            <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-900 dark:bg-purple-950/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-purple-700 dark:text-purple-300">
                  <Brain className="h-4 w-4" />
                  回忆反差
                </div>
                <p className="text-xs text-purple-600/80 dark:text-purple-400/80">
                  系统找到一条相似回忆：你之前也记录过类似的情绪或场景。是否加入这段回忆反差？
                </p>
                <div className="p-2 rounded bg-white/70 dark:bg-black/20 text-xs text-muted-foreground line-clamp-2">
                  {memorySnap.text || '(无内容)'}
                  <div className="text-[10px] mt-1">
                    {memorySnap.createdAt ? new Date(memorySnap.createdAt).toLocaleDateString('zh-CN') : ''}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={includeMemory ? 'default' : 'outline'}
                  className="w-full gap-1.5"
                  onClick={handleMemoryToggle}
                >
                  {includeMemory ? (
                    <>
                      <Check className="h-4 w-4" />
                      已加入回忆反差
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      加入回忆反差
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
