'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Loader2, Eye, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getContentHierarchy } from '@/lib/post-api';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { AuthGuard } from '@/components/auth-guard';
import { toast } from 'sonner';
import type { Post } from '@/types';

const STYLES = ['游记', '日记'];
const TONES = ['纪实', '温暖', '轻松'];
const LENGTHS = ['简短', '标准', '详细'];

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
  const [generating, setGenerating] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  // 加载种子内容
  useEffect(() => {
    getContentHierarchy({ level: 'DIARY', userId: user?.id, limit: 20 }).then((r) => {
      setSeedPosts(r.posts || []);
      // URL参数可预选
      const ids = searchParams.get('ids')?.split(',') || [];
      if (ids.length > 0) setSelected(new Set(ids));
    }).catch(() => {});
  }, [user]);

  // 轮询任务状态
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

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/journeys')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">AI 游记生成</h1>
        </div>
      </div>

      {/* 步骤1: 选择素材 */}
      <Card><CardContent className="p-5 space-y-3">
        <h2 className="font-semibold">选择素材</h2>
        <p className="text-sm text-muted-foreground">选择你的日记或瞬间作为游记素材</p>
        {seedPosts.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-3">还没有日记，先写日记吧</p>
            <Button size="sm" onClick={() => router.push('/upload')}>写日记</Button>
          </div>
        ) : (
          <div className="grid gap-2 max-h-64 overflow-y-auto">
            {seedPosts.map((p) => (
              <button
                key={p.id}
                onClick={() => toggleSelect(p.id)}
                className={`text-left rounded-lg border p-3 transition-colors ${
                  selected.has(p.id) ? 'border-primary bg-primary/5' : 'hover:bg-accent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium line-clamp-1">{p.content?.slice(0, 60) || '(无内容)'}</span>
                  <Badge variant={selected.has(p.id) ? 'default' : 'outline'} className="shrink-0 ml-2">
                    {selected.has(p.id) ? '已选' : '可选'}
                  </Badge>
                </div>
                <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                  {p.location?.name && <span>{p.location.name}</span>}
                  <span>{new Date(p.createdAt).toLocaleDateString('zh-CN')}</span>
                </div>
              </button>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">已选 {selected.size} 篇</p>
      </CardContent></Card>

      {/* 步骤2: 风格设置 */}
      <Card><CardContent className="p-5 space-y-4">
        <h2 className="font-semibold">风格设置</h2>
        <div className="grid grid-cols-3 gap-2">
          {STYLES.map((s) => (
            <Button key={s} variant={style === s ? 'default' : 'outline'} size="sm" onClick={() => setStyle(s)}>{s}</Button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {TONES.map((t) => (
            <Button key={t} variant={tone === t ? 'default' : 'outline'} size="sm" onClick={() => setTone(t)}>{t}</Button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {LENGTHS.map((l) => (
            <Button key={l} variant={length === l ? 'default' : 'outline'} size="sm" onClick={() => setLength(l)}>{l}</Button>
          ))}
        </div>
      </CardContent></Card>

      {/* 生成按钮 */}
      {!jobId ? (
        <Button onClick={handleGenerate} disabled={generating || selected.size === 0} className="w-full gap-2" size="lg">
          {generating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
          {generating ? '提交中...' : '开始生成'}
        </Button>
      ) : (
        <Card><CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">生成中...</h3>
            <Badge variant={status === 'DONE' ? 'default' : status === 'ERROR' ? 'destructive' : 'secondary'}>
              {status}
            </Badge>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-muted-foreground">{progress}%</p>
          {result && (
            <div className="space-y-3">
              <div className="rounded-lg bg-muted p-4 max-h-64 overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap">{result}</p>
              </div>
              <Button onClick={() => router.push('/journeys')} className="w-full gap-2">
                <Eye className="h-4 w-4" /> 查看我的游记
              </Button>
            </div>
          )}
        </CardContent></Card>
      )}
    </div>
  );
}
