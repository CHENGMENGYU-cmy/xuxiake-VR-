'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, Sparkles, Camera, PenLine, FileText, Loader2,
  Globe, Lock, Check, Wand2, RefreshCw, Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AuthGuard } from '@/components/auth-guard';
import { generateDiaryBatch, getAiJob, getPostDetail, saveDiary } from '@/lib/snap-api';
import { deletePost } from '@/lib/post-api';
import { ALL_DIARY_STYLES, type DiaryStyle } from '@/types/snap';
import { toast } from 'sonner';

export default function BatchGeneratePage() {
  return <AuthGuard><BatchContent /></AuthGuard>;
}

const styleMeta: Record<string, { emoji: string; desc: string; grad: string }> = {
  '温柔治愈风': { emoji: '🕊️', desc: '温暖抚慰，如沐春风', grad: 'from-amber-400 to-orange-400' },
  '生活碎片风': { emoji: '🧩', desc: '细碎日常，真实可爱', grad: 'from-sky-400 to-teal-400' },
  '成长复盘风': { emoji: '🌱', desc: '反思总结，向内生长', grad: 'from-emerald-400 to-teal-500' },
  '诗意散文风': { emoji: '🪶', desc: '散文诗般，意境悠远', grad: 'from-teal-400 to-cyan-500' },
  '轻松口语风': { emoji: '☕', desc: '轻松随性，像老朋友', grad: 'from-orange-400 to-amber-500' },
};

/** 兼容旧草稿里可能存的无"风"后缀风格名 */
function normalizeStyle(s?: string): DiaryStyle {
  if (s && (ALL_DIARY_STYLES as string[]).includes(s)) return s as DiaryStyle;
  const withSuffix = s ? `${s}风` : '';
  if (withSuffix && (ALL_DIARY_STYLES as string[]).includes(withSuffix)) return withSuffix as DiaryStyle;
  return '温柔治愈风';
}

function getMediaImage(item: any) {
  if (item?.mediaItems?.length > 0) {
    const img = item.mediaItems[0];
    return img.thumbnailUrl || img.url;
  }
  try {
    const meta = typeof item?.vrMetadata === 'string' ? JSON.parse(item.vrMetadata) : item?.vrMetadata;
    if (meta?.image) return meta.image;
  } catch {}
  return null;
}

function statusLabel(status: string, progress?: number) {
  switch (status) {
    case 'QUEUED': return '排队中...';
    case 'ANALYZING': return '分析行程素材...';
    case 'GENERATING': return `AI 写作中 ${progress ?? 0}%`;
    case 'DONE': return '生成完成';
    case 'ERROR': return '生成失败';
    default: return status || '处理中...';
  }
}

function BatchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ids = (searchParams.get('ids') || '').split(',').filter(Boolean);
  const urlPostId = searchParams.get('postId') || '';

  const [snaps, setSnaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [genStatus, setGenStatus] = useState('');
  const [postId, setPostId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [insight, setInsight] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [style, setStyle] = useState<DiaryStyle>('温柔治愈风');
  const [createdAt, setCreatedAt] = useState('');
  const [mood, setMood] = useState('');
  const [saving, setSaving] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadDraft = async (pid: string) => {
    const post = await getPostDetail(pid).catch(() => null);
    if (post) {
      const meta = typeof post.vrMetadata === 'string' ? JSON.parse(post.vrMetadata) : (post.vrMetadata || {});
      setTitle(post.title || '');
      setContent(post.content || '');
      setInsight(meta.insight || '');
      setTags(meta.generatorTags || []);
      setStyle(normalizeStyle(meta.style || ''));
      setCreatedAt(post.createdAt || '');
      setMood(meta.mood || '');
      setPostId(pid);
    }
  };

  // 加载选中素材
  useEffect(() => {
    if (ids.length === 0) { setLoading(false); return; }
    Promise.all(ids.map((id) => getPostDetail(id).catch(() => null)))
      .then((list) => setSnaps(list.filter(Boolean)))
      .finally(() => setLoading(false));
  }, []);

  // 已有草稿直接加载；否则停留在「选择风格」等待用户开始生成
  useEffect(() => {
    if (urlPostId) {
      loadDraft(urlPostId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlPostId]);

  // 卸载时清理轮询
  useEffect(() => () => {
    if (pollRef.current) clearInterval(pollRef.current);
  }, []);

  const startGeneration = async (targetStyle?: DiaryStyle) => {
    if (generating || ids.length === 0) return;
    const finalStyle = targetStyle ?? style;
    setGenerating(true);
    setPostId(null);
    setTitle('');
    setContent('');
    setInsight('');
    setTags([]);
    setCreatedAt('');
    setMood('');
    setGenStatus('正在提交生成任务...');
    setProgress(0);
    try {
      const { jobId } = await generateDiaryBatch({
        snapIds: ids,
        style: finalStyle,
        tone: '温暖',
        length: '标准',
      });
      const timer = setInterval(async () => {
        try {
          const job = await getAiJob(jobId);
          setProgress(job.progress || 0);
          setGenStatus(statusLabel(job.status, job.progress));
          if (job.status === 'DONE' || job.status === 'ERROR') {
            clearInterval(timer);
            pollRef.current = null;
            setGenerating(false);
            if (job.status === 'DONE' && job.postId) {
              await loadDraft(job.postId);
              toast.success('日记草稿已生成，可编辑后保存');
            } else {
              toast.error(job.error || '日记生成失败');
            }
          }
        } catch {
          clearInterval(timer);
          pollRef.current = null;
          setGenerating(false);
          toast.error('查询生成进度失败');
        }
      }, 1500);
      pollRef.current = timer;
    } catch {
      setGenerating(false);
      toast.error('日记生成提交失败，请重试');
    }
  };

  const handleStyleChange = async (next: DiaryStyle) => {
    if (generating) return;
    setStyle(next);
    if (!postId) return; // 尚未生成，仅记录所选风格
    // 已有草稿：换风格重写，先清理旧草稿再重新生成
    try { await deletePost(postId); } catch { /* 忽略删除失败 */ }
    setPostId(null);
    await startGeneration(next);
  };

  const handleSave = async (status: 'draft' | 'private' | 'public') => {
    if (!postId) { toast.error('草稿尚未生成，请稍候'); return; }
    if (!content.trim()) { toast.error('日记内容不能为空'); return; }
    setSaving(true);
    try {
      await saveDiary({
        diaryId: postId,
        title,
        content,
        insight,
        style,
        tags,
        status,
      });
      if (status === 'draft') {
        toast.success('草稿已保存');
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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
        <span className="ml-2 text-sm text-muted-foreground">正在加载素材...</span>
      </div>
    );
  }

  if (ids.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
          <Camera className="h-8 w-8 text-muted-foreground/30" />
        </div>
        <p className="mt-4 text-sm font-medium text-muted-foreground">未选择素材</p>
        <Button variant="ghost" className="mt-3" onClick={() => router.push('/snap')}>
          <ArrowLeft className="mr-1 h-4 w-4" />返回素材库
        </Button>
      </div>
    );
  }

  const showEditor = !!postId || generating;
  const editorCover = snaps.length > 0 ? getMediaImage(snaps[0]) : null;

  return (
    <div className="mx-auto max-w-4xl px-2 pb-24">
      {/* 顶部栏 */}
      <div className="sticky top-0 z-20 -mx-2 mb-4 border-b bg-background/85 px-2 py-3 backdrop-blur-lg">
        <div className="flex items-center gap-2.5">
          <Button variant="ghost" size="icon" onClick={() => router.push('/snap')} className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-orange-400 text-white shadow-md shadow-teal-500/20">
            <PenLine className="h-4.5 w-4.5" />
          </span>
          <div>
            <h1 className="text-base font-bold leading-tight">批量日记创作</h1>
            <p className="text-[11px] leading-tight text-muted-foreground">从 {ids.length} 张素材智能生成一篇日记</p>
          </div>
        </div>
      </div>

      {/* 素材墙 */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">已选素材</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {snaps.map((s) => (
            <div key={s.id} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-muted">
              {getMediaImage(s) ? (
                <img src={getMediaImage(s)} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <FileText className="h-5 w-5 text-muted-foreground/40" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-1">
                <p className="truncate text-[10px] text-white">{s.locationName || '未标注地点'}</p>
              </div>
            </div>
          ))}
          {snaps.length < ids.length && (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed">
              <span className="text-[10px] text-muted-foreground">加载失败</span>
            </div>
          )}
        </div>
      </div>

      {/* 风格选择 */}
      <div className="mb-4 rounded-2xl border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-amber-400 text-white shadow-sm">
            <Wand2 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">选择日记风格</p>
            <p className="text-[11px] leading-tight text-muted-foreground">决定日记的语气与气质，生成后可切换重写</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {ALL_DIARY_STYLES.map((s) => {
            const active = s === style;
            const meta = styleMeta[s] || { emoji: '✨', desc: '', grad: 'from-teal-400 to-cyan-500' };
            return (
              <button
                key={s}
                type="button"
                onClick={() => handleStyleChange(s)}
                disabled={generating}
                className={`group flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all duration-200 ${
                  active
                    ? `border-transparent bg-gradient-to-r ${meta.grad} bg-origin-border text-white shadow-md`
                    : 'border-border/60 hover:border-teal-300 hover:bg-teal-50/50 dark:hover:bg-teal-950/30'
                } ${generating ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base ${active ? 'bg-white/25' : 'bg-muted'}`}>
                  {meta.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-sm ${active ? 'font-semibold' : 'font-medium'}`}>{s}</span>
                  <span className={`block truncate text-[10px] ${active ? 'text-white/80' : 'text-muted-foreground/70'}`}>{meta.desc}</span>
                </span>
                {active && <Check className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>

        {!generating && !postId && (
          <Button
            className="mt-3 w-full gap-1.5 bg-gradient-to-r from-teal-500 to-orange-400 text-white shadow-md shadow-teal-500/25 hover:from-teal-600 hover:to-orange-500"
            onClick={() => startGeneration()}
          >
            <Sparkles className="h-4 w-4" />
            用「{style}」生成日记
          </Button>
        )}
        {!generating && postId && (
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <RefreshCw className="h-3.5 w-3.5 text-teal-500" />
            点击其他风格可换风格重新生成
          </p>
        )}
      </div>

      {/* 生成进度 */}
      {generating && (
        <div className="mb-4 rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
            <span>{genStatus}</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-orange-400 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* 编辑器 */}
      {showEditor && !generating && (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="border-b border-border/60 px-6 py-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="给这篇日记起个标题..."
              className="border-0 bg-transparent px-0 text-xl font-bold tracking-tight placeholder:text-muted-foreground/30 focus-visible:ring-0"
            />
          </div>
          <div className="px-6 py-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="AI 已为你写好初稿，可以自由润色..."
              className="min-h-[280px] resize-none border-0 bg-transparent px-0 text-[15px] leading-8 text-foreground/90 placeholder:text-muted-foreground/30 focus-visible:ring-0"
            />
          </div>
          <div className="border-t border-border/60 bg-muted/30 px-6 py-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-orange-400" />
              <Input
                value={insight}
                onChange={(e) => setInsight(e.target.value)}
                placeholder="写下一句感悟..."
                className="border-0 bg-transparent px-0 text-sm italic text-foreground/70 placeholder:text-muted-foreground/40 focus-visible:ring-0"
              />
            </div>
            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tags.map((t, i) => (
                  <span key={i} className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
                    {t}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-teal-500" />
              AI 已根据 {snaps.length} 张素材生成草稿，编辑满意后再保存
            </div>
          </div>
        </div>
      )}

      {/* 底部保存栏 */}
      {postId && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/90 backdrop-blur-lg">
          <div className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-3">
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="ghost" size="sm"
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="h-9 gap-1.5 text-xs text-muted-foreground"
              >
                <FileText className="h-3.5 w-3.5" />存草稿
              </Button>
              <Button
                variant="outline" size="sm"
                onClick={() => handleSave('private')}
                disabled={saving}
                className="h-9 gap-1.5 text-xs text-amber-600"
              >
                <Lock className="h-3.5 w-3.5" />存为私密
              </Button>
              <Button
                size="sm"
                onClick={() => handleSave('public')}
                disabled={saving}
                className="h-9 gap-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 px-5 text-xs font-medium shadow-md shadow-teal-500/25 hover:from-teal-600 hover:to-emerald-600"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
                发布
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
