'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Loader2, Eye, ArrowLeft, Check, FileText, BookOpen, Wind, Thermometer, Clock, Hash, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { getContentHierarchy } from '@/lib/post-api';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { AuthGuard } from '@/components/auth-guard';
import { toast } from 'sonner';
import type { Post } from '@/types';

const STYLES = [
  { value: '游记', icon: BookOpen, desc: '按时间线和地点推进，注重行程完整性', color: 'blue' },
  { value: '日记', icon: FileText, desc: '第一人称内心体验，注重情感反思', color: 'violet' },
];
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

  const [seedPosts, setSeedPosts] = useState<Post[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [style, setStyle] = useState('游记');
  const [tone, setTone] = useState('温暖');
  const [length, setLength] = useState('标准');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    getContentHierarchy({ level: 'DIARY', userId: user?.id, limit: 50 }).then((r) => {
      setSeedPosts(r.posts || []);
      const ids = searchParams.get('ids')?.split(',') || [];
      if (ids.length > 0) setSelected(new Set(ids));
    }).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!jobId) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await apiClient.get(`/posts/ai/jobs/${jobId}`);
        if (res.data?.success) {
          const j = res.data.data;
          setStatus(j.status); setProgress(j.progress);
          if (j.status === 'DONE') {
            setResult(j.result || '游记已生成！');
            clearInterval(pollRef.current);
          } else if (j.status === 'ERROR') {
            toast.error(j.error || '生成失败');
            clearInterval(pollRef.current);
          }
        }
      } catch { clearInterval(pollRef.current); }
    }, 1000);
    return () => clearInterval(pollRef.current);
  }, [jobId]);

  const handleGenerate = async () => {
    if (selected.size === 0) { toast.error('请至少选择一篇日记作为素材'); return; }
    setGenerating(true); setResult(null);
    try {
      const res = await apiClient.post('/posts/ai/generate', {
        seedPostIds: [...selected], style, tone, length,
      });
      if (res.data?.success) {
        setJobId(res.data.data.jobId);
        setStatus('QUEUED'); setProgress(0);
      }
    } catch { toast.error('提交失败'); setGenerating(false); }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const filtered = seedPosts.filter(p =>
      !searchQuery || (p.content || '').includes(searchQuery) || (p.location?.name || '').includes(searchQuery)
    );
    setSelected(new Set(filtered.map(p => p.id)));
  };
  const deselectAll = () => setSelected(new Set());

  const filteredPosts = seedPosts.filter(p =>
    !searchQuery || (p.content || '').includes(searchQuery) || (p.location?.name || '').includes(searchQuery)
  );

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
            <p className="text-xs text-muted-foreground">选择日记素材，选择风格和语气，AI 帮你写游记</p>
          </div>
        </div>
      </div>

      {/* 步骤1：选择素材 */}
      <Card className="shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-3.5 w-3.5" />
              </span>
              <div>
                <h2 className="font-semibold text-sm">选择素材</h2>
                <p className="text-xs text-muted-foreground">选择你的日记作为游记的素材来源</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={selectAll}>全选</Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={deselectAll}>清空</Button>
            </div>
          </div>

          {seedPosts.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <FileText className="h-10 w-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm text-muted-foreground">还没有日记，先写一篇吧</p>
              <Button size="sm" className="mt-3" onClick={() => router.push('/snap')}>去写日记</Button>
            </div>
          ) : (
            <>
              {/* 搜索框 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="搜索日记..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border bg-muted/40 py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid gap-2 max-h-72 overflow-y-auto">
                {filteredPosts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => toggleSelect(p.id)}
                    className={`flex items-center gap-3 text-left rounded-xl border-2 p-3 transition-all duration-200 ${
                      selected.has(p.id)
                        ? 'border-primary/50 bg-primary/5 shadow-sm'
                        : 'border-transparent hover:bg-muted/60 hover:border-muted-foreground/10'
                    }`}
                  >
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                      selected.has(p.id) ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
                    }`}>
                      {selected.has(p.id) && <Check className="h-3 w-3" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm line-clamp-1">{p.content?.slice(0, 80) || '(无内容)'}</span>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        {p.location?.name && <span>{p.location.name}</span>}
                        <span>{new Date(p.createdAt).toLocaleDateString('zh-CN')}</span>
                      </div>
                    </div>
                    {p.mediaItems?.[0]?.thumbnailUrl && (
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <img src={p.mediaItems[0].thumbnailUrl} alt="" className="h-full w-full object-cover" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm">
                <Badge variant="secondary">已选 {selected.size} 篇</Badge>
                {filteredPosts.length < seedPosts.length && (
                  <span className="text-xs text-muted-foreground">共 {seedPosts.length} 篇，筛选出 {filteredPosts.length} 篇</span>
                )}
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
              <p className="text-xs text-muted-foreground">选择文体、语气和篇幅，AI 会据此调整写作风格</p>
            </div>
          </div>

          {/* 文体 */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">文体</label>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map(({ value, icon: Icon, desc, color }) => (
                <button
                  key={value}
                  onClick={() => setStyle(value)}
                  className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-all duration-200 ${
                    style === value
                      ? `${colorMap[color]} border-current shadow-sm`
                      : 'border-transparent hover:bg-muted/60'
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${style === value ? '' : 'text-muted-foreground'}`} />
                  <div>
                    <span className="text-sm font-medium block">{value}</span>
                    <span className="text-[11px] opacity-70">{desc}</span>
                  </div>
                </button>
              ))}
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

      {/* 生成 */}
      {!jobId ? (
        <Button
          onClick={handleGenerate}
          disabled={generating || selected.size === 0}
          className="w-full gap-2 h-12 text-base font-medium bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 shadow-lg shadow-primary/20"
        >
          {generating ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> AI 正在思考...</>
          ) : (
            <><Sparkles className="h-5 w-5" /> 开始 AI 生成</>
          )}
        </Button>
      ) : (
        <Card className="shadow-sm border-primary/20">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {status === 'DONE' ? '游记已生成' : status === 'ERROR' ? '生成失败' : 'AI 正在创作...'}
              </h3>
              <Badge variant={
                status === 'DONE' ? 'default' :
                status === 'ERROR' ? 'destructive' : 'secondary'
              }>
                {status === 'DONE' ? '完成' : status === 'ERROR' ? '失败' : status}
              </Badge>
            </div>

            {/* 进度条 */}
            {status !== 'DONE' && status !== 'ERROR' && (
              <div className="space-y-2">
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{status === 'ANALYZING' ? '分析素材中...' : '生成文本中...'}</span>
                  <span>{progress}%</span>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="rounded-xl border bg-muted/30 p-5 max-h-96 overflow-y-auto">
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
                    {result}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => router.push('/journeys')} className="flex-1 gap-2" variant="outline">
                    <Eye className="h-4 w-4" /> 查看我的游记
                  </Button>
                  <Button onClick={() => { setJobId(null); setResult(null); setGenerating(false); }} variant="ghost" size="icon">
                    <Sparkles className="h-4 w-4" />
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
