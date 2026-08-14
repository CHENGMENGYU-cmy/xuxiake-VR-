'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Loader2, ArrowLeft, Check, FileText, Wind, Thermometer, Hash, Search, Layers, RefreshCw, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { getUserSnaps, getUserDiaries, generateTravelogue, getTravelogueJob } from '@/lib/snap-api';
import { useAuthStore } from '@/stores/auth-store';
import { AuthGuard } from '@/components/auth-guard';
import { toast } from 'sonner';

interface SourceItem {
  id: string;
  content: string | null;
  location?: { name?: string } | null;
  locationName?: string | null;
  createdAt: string;
  mediaItems?: { thumbnailUrl?: string | null; url?: string }[];
  title?: string | null;
  type: 'SNAPSHOT' | 'DIARY';
}

const TONES = [
  { value: '纪实', icon: Thermometer, desc: '客观如实记录', color: 'slate' },
  { value: '温暖', icon: Wind, desc: '温馨治愈有温度', color: 'amber' },
  { value: '轻松', icon: Sparkles, desc: '口语化轻松愉快', color: 'emerald' },
];
const LENGTHS = [
  { value: '简短', desc: '约500字', color: 'blue' },
  { value: '标准', desc: '约1000字', color: 'violet' },
  { value: '详细', desc: '约2000字', color: 'orange' },
];

const colorMap: Record<string, string> = {
  blue: 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300',
  violet: 'border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300',
  amber: 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
  emerald: 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300',
  slate: 'border-slate-500 bg-slate-50 text-slate-700 dark:bg-slate-950/30 dark:text-slate-300',
  orange: 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300',
};

export default function GeneratePage() {
  return <AuthGuard><GenerateContent /></AuthGuard>;
}

function GenerateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const [items, setItems] = useState<SourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tone, setTone] = useState('温暖');
  const [length, setLength] = useState('标准');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [postId, setPostId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // 加载素材：闪拍 + 日记
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([getUserSnaps(), getUserDiaries()])
      .then(([snaps, diaries]) => {
        const snapItems: SourceItem[] = (snaps || []).map((s: any) => ({
          id: s.id, content: s.content, location: s.location, locationName: s.locationName,
          createdAt: s.createdAt, mediaItems: s.mediaItems, title: s.title, type: 'SNAPSHOT',
        }));
        const diaryItems: SourceItem[] = (diaries || []).map((d: any) => ({
          id: d.id, content: d.content, location: d.location, locationName: d.locationName,
          createdAt: d.createdAt, mediaItems: d.mediaItems, title: d.title, type: 'DIARY',
        }));
        const all = [...logItems, ...diaryItems]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setItems(all);

        // URL 参数预选
        const ids = searchParams.get('ids')?.split(',') || [];
        if (ids.length > 0) setSelected(new Set(ids));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, searchParams]);

  // 轮询任务状态
  useEffect(() => {
    if (!jobId) return;
    pollRef.current = setInterval(async () => {
      try {
        const job = await getTravelogueJob(jobId);
        setStatus(job.status); setProgress(job.progress);
        if (job.postId) setPostId(job.postId);
        if (job.status === 'DONE') {
          setResult(job.result || '游记已生成！');
          clearInterval(pollRef.current);
          setGenerating(false);
          toast.success('游记生成完成');
        } else if (job.status === 'ERROR') {
          toast.error(job.error || '生成失败');
          clearInterval(pollRef.current);
          setGenerating(false);
        }
      } catch {
        clearInterval(pollRef.current);
        setGenerating(false);
      }
    }, 1000);
    return () => clearInterval(pollRef.current);
  }, [jobId]);

  const selectedLogIds = items.filter(i => selected.has(i.id) && i.type === 'LOG').map(i => i.id);
  const selectedDiaryIds = items.filter(i => selected.has(i.id) && i.type === 'DIARY').map(i => i.id);

  const handleGenerate = async (overrideTone?: string, overrideLength?: string, overridePrompt?: string) => {
    if (selected.size === 0) { toast.error('请至少选择一条日志或日记作为素材'); return; }
    setGenerating(true); setResult(null);
    try {
      const { jobId: newJobId } = await generateTravelogue({
        logIds: selectedLogIds,
        diaryIds: selectedDiaryIds,
        prompt: overridePrompt !== undefined ? overridePrompt : prompt,
        style: '游记',
        tone: overrideTone || tone,
        length: overrideLength || length,
      });
      setJobId(newJobId);
      setStatus('QUEUED'); setProgress(0);
    } catch {
      toast.error('提交失败，请重试');
      setGenerating(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const filtered = items.filter(i =>
      !searchQuery || (i.content || '').includes(searchQuery) || (i.location?.name || i.locationName || '').includes(searchQuery)
    );
    setSelected(new Set(filtered.map(i => i.id)));
  };
  const deselectAll = () => setSelected(new Set());

  const filteredItems = items.filter(i =>
    !searchQuery || (i.content || '').includes(searchQuery) || (i.location?.name || i.locationName || '').includes(searchQuery)
  );

  const logCount = items.filter(i => i.type === 'LOG').length;
  const diaryCount = items.filter(i => i.type === 'DIARY').length;

  // 生成结果后显示风格切换
  const showRegenerate = !!result && !generating;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/journeys')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">AI 游记生成</h1>
            <p className="text-xs text-muted-foreground">从你的日志和日记中，由 AI 综合生成一篇游记</p>
          </div>
        </div>
      </div>

      {/* 步骤1：选择素材 */}
      <Card className="shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Layers className="h-3.5 w-3.5" />
              </span>
              <div>
                <h2 className="font-semibold text-sm">选择素材</h2>
                <p className="text-xs text-muted-foreground">
                  日志 <Badge variant="secondary" className="text-[10px]">{logCount}</Badge> · 日记 <Badge variant="secondary" className="text-[10px]">{diaryCount}</Badge>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={selectAll}>全选</Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={deselectAll}>清空</Button>
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">加载素材中...</div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <FileText className="h-10 w-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm text-muted-foreground">还没有日志和日记素材</p>
              <Button size="sm" className="mt-3" onClick={() => router.push('/snap')}>去记录闪拍</Button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="搜索素材..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border bg-muted/40 py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid gap-2 max-h-72 overflow-y-auto">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleSelect(item.id)}
                    className={`flex items-center gap-3 text-left rounded-xl border-2 p-3 transition-all duration-200 ${
                      selected.has(item.id)
                        ? 'border-primary/50 bg-primary/5 shadow-sm'
                        : 'border-transparent hover:bg-muted/60 hover:border-muted-foreground/10'
                    }`}
                  >
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                      selected.has(item.id) ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
                    }`}>
                      {selected.has(item.id) && <Check className="h-3 w-3" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {item.type === 'LOG' ? (
                          <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-900">日志</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] bg-indigo-100 text-indigo-600 dark:bg-indigo-950">日记</Badge>
                        )}
                        {item.title && <span className="text-xs text-muted-foreground truncate">{item.title}</span>}
                      </div>
                      <span className="text-sm line-clamp-1">{item.content?.slice(0, 80) || '(无内容)'}</span>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        {item.location?.name || item.locationName && <span>{item.location?.name || item.locationName}</span>}
                        <span>{new Date(item.createdAt).toLocaleDateString('zh-CN')}</span>
                      </div>
                    </div>
                    {item.mediaItems?.[0]?.thumbnailUrl && (
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <img src={item.mediaItems[0].thumbnailUrl} alt="" className="h-full w-full object-cover" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <Badge variant="secondary">已选 {selected.size} 条（日志{selectedLogIds.length} · 日记{selectedDiaryIds.length}）</Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 步骤2：风格设置 */}
      <Card className="shadow-sm">
        <CardContent className="p-5 space-y-5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <div>
              <h2 className="font-semibold text-sm">风格设置</h2>
              <p className="text-xs text-muted-foreground">选择语气和篇幅，AI 会据此调整写作风格</p>
            </div>
          </div>

          {/* 语气 */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">语气</label>
            <div className="grid grid-cols-3 gap-2">
              {TONES.map(({ value, icon: Icon, desc, color }) => (
                <button
                  key={value}
                  onClick={() => setTone(value)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all duration-200 ${
                    tone === value
                      ? `${colorMap[color]} border-current shadow-sm`
                      : 'border-transparent hover:bg-muted/60'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${tone === value ? '' : 'text-muted-foreground'}`} />
                  <span className="text-sm font-medium">{value}</span>
                  <span className="text-[10px] opacity-70">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 篇幅 */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">篇幅</label>
            <div className="flex gap-2">
              {LENGTHS.map(({ value, desc, color }) => (
                <button
                  key={value}
                  onClick={() => setLength(value)}
                  className={`flex-1 rounded-xl border-2 py-2.5 text-center transition-all duration-200 ${
                    length === value
                      ? `${colorMap[color]} border-current shadow-sm font-medium`
                      : 'border-transparent hover:bg-muted/60'
                  }`}
                >
                  <span className="text-sm block">{value}</span>
                  <span className="text-[10px] opacity-70">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 提示词 */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Hash className="h-3 w-3" />写作提示（可选）
            </label>
            <Textarea
              placeholder="比如：重点写漓江日出的过程，加入对摄影和等待的思考..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[60px] text-sm resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* 生成 / 结果区 */}
      {!result ? (
        <Button
          onClick={() => handleGenerate()}
          disabled={generating || selected.size === 0}
          className="w-full gap-2 h-12 text-base font-medium bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 shadow-lg shadow-primary/20"
        >
          {generating ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> AI 正在创作中...</>
          ) : (
            <><Sparkles className="h-5 w-5" /> 开始 AI 生成</>
          )}
        </Button>
      ) : (
        <Card className="shadow-sm border-primary/20">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">生成的游记</h3>
              <Badge variant={status === 'DONE' ? 'default' : status === 'ERROR' ? 'destructive' : 'secondary'}>
                {status === 'DONE' ? '完成' : status === 'ERROR' ? '失败' : status}
              </Badge>
            </div>

            {/* 生成中进度 */}
            {generating && (
              <div className="space-y-2">
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{status === 'ANALYZING' ? '分析素材中...' : '生成文本中...'}</span>
                  <span>{progress}%</span>
                </div>
              </div>
            )}

            {result && (
              <div className="rounded-xl border bg-muted/30 p-5 max-h-96 overflow-y-auto">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{result}</div>
              </div>
            )}

            {/* 重新生成区域 */}
            {showRegenerate && (
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <RefreshCw className="h-4 w-4 text-primary" />
                  <span className="font-medium">换种风格重新生成</span>
                </div>

                {/* 语气快速切换 */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-muted-foreground">语气:</span>
                  {TONES.map(({ value, color }) => (
                    <button
                      key={value}
                      onClick={() => setTone(value)}
                      className={`rounded-full border px-3 py-1 text-xs transition-all ${
                        tone === value
                          ? `${colorMap[color]} border-current font-medium`
                          : 'hover:bg-muted'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>

                {/* 篇幅快速切换 */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-muted-foreground">篇幅:</span>
                  {LENGTHS.map(({ value, color }) => (
                    <button
                      key={value}
                      onClick={() => setLength(value)}
                      className={`rounded-full border px-3 py-1 text-xs transition-all ${
                        length === value
                          ? `${colorMap[color]} border-current font-medium`
                          : 'hover:bg-muted'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>

                {/* 提示词编辑 */}
                <Textarea
                  placeholder="输入新的写作方向，覆盖之前的提示词..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[50px] text-sm resize-none"
                />

                <div className="flex flex-col gap-2">
                  <Button onClick={() => handleGenerate(tone, length, prompt)} disabled={generating} className="gap-2 bg-gradient-to-r from-primary to-violet-500">
                    {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    用当前风格重新生成
                  </Button>

                  {/* 编辑发布：落入章节式游记编辑器 */}
                  <Button
                    onClick={() => postId && router.push(`/upload/journey-creator?edit=${postId}`)}
                    disabled={!postId}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <PenLine className="h-4 w-4" />去编辑游记并发布
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
