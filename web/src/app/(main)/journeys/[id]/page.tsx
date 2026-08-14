'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Globe, Lock, MapPin, Calendar, Trash2, Edit3, Eye, EyeOff, MapPinned, ChevronLeft, ChevronRight, Sparkles, Lightbulb, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getPostById, deletePost, publishPost, unpublishPost } from '@/lib/post-api';
import { useAuthStore } from '@/stores/auth-store';
import { AuthGuard } from '@/components/auth-guard';
import type { Post } from '@/types';

export default function JourneyDetailPage() {
  return (
    <AuthGuard>
      <JourneyDetailContent />
    </AuthGuard>
  );
}

function JourneyDetailContent() {
  const params = useParams();
  const router = useRouter();
  const postId = params?.id as string || '';
  const { user } = useAuthStore();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [locationPrecision, setLocationPrecision] = useState<'hidden' | 'city' | 'exact'>('city');
  const [showAiSource, setShowAiSource] = useState(false);

  useEffect(() => {
    if (!postId) return;
    getPostById(postId).then((data) => {
      setPost(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [postId]);

  // 权限检查
  if (post && user && post.author?.id !== user.id && post.visibility === 'PRIVATE') {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center text-muted-foreground">
        无权访问此游记
      </div>
    );
  }

  const handleDelete = async () => {
    if (!confirm('确定删除这篇游记？此操作不可恢复。')) return;
    setDeleting(true);
    try {
      await deletePost(postId);
      toast.success('游记已删除');
      router.push('/journeys');
    } catch {
      toast.error('删除失败');
    }
    setDeleting(false);
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const updated = await publishPost(postId, locationPrecision);
      setPost(updated);
      setShowPublishDialog(false);
      toast.success('游记已发布到社区');
    } catch {
      toast.error('发布失败');
    }
    setPublishing(false);
  };

  const handleUnpublish = async () => {
    if (!confirm('撤回后游记将从社区移除，但保留为你的私密内容。确定撤回？')) return;
    try {
      const updated = await unpublishPost(postId);
      setPost(updated);
      toast.success('游记已撤回');
    } catch {
      toast.error('撤回失败');
    }
  };

  const isPublic = post?.visibility === 'PUBLIC';
  const isOwner = post && user && post.author?.id === user.id;
  const isAiGenerated = !!(post?.vrMetadata && typeof post.vrMetadata === 'object' && (post.vrMetadata as Record<string, unknown>).aiGenerated);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center text-muted-foreground">
        游记不存在或已被删除
      </div>
    );
  }

  const stops = post.journey?.stops || [];
  const dayCount = stops.length || (
    post.journey?.startDate && post.journey?.endDate
      ? Math.max(1, Math.round((new Date(post.journey.endDate).getTime() - new Date(post.journey.startDate).getTime()) / 86400000) + 1)
      : null
  );

  return (
    <div className="mx-auto max-w-2xl space-y-0">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between px-1 py-2">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => router.push('/journeys')}>
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
        {isOwner && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1" onClick={() => router.push(`/upload/journey-creator?edit=${post.id}`)}>
              <Edit3 className="h-4 w-4" />
              编辑
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-red-500 hover:text-red-600"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              删除
            </Button>
          </div>
        )}
      </div>

      {/* 状态提示条 */}
      <div className={`flex items-center justify-between rounded-lg border px-4 py-2.5 mb-4 ${
        isPublic
          ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30'
          : 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30'
      }`}>
        <div className="flex items-center gap-2">
          {isPublic ? (
            <>
              <Globe className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">已发布到社区</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">私密内容</span>
            </>
          )}
        </div>
        {isOwner && (
          isPublic ? (
            <Button variant="outline" size="sm" className="gap-1" onClick={handleUnpublish}>
              <EyeOff className="h-4 w-4" />
              撤回
            </Button>
          ) : (
            <Button size="sm" className="gap-1" onClick={() => setShowPublishDialog(true)}>
              <Globe className="h-4 w-4" />
              发布
            </Button>
          )
        )}
      </div>

      {/* 发布对话框 */}
      {showPublishDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold">发布到社区</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              发布后，所有人可以在社区中看到这篇游记。请选择地点显示精度：
            </p>
            <div className="mb-4 space-y-2">
              {[
                { value: 'hidden' as const, label: '隐藏地点', desc: '不显示任何地点信息', icon: EyeOff },
                { value: 'city' as const, label: '仅城市', desc: '只显示城市名称', icon: MapPinned },
                { value: 'exact' as const, label: '具体地点', desc: '显示完整地点名称', icon: MapPin },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLocationPrecision(opt.value)}
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                    locationPrecision === opt.value ? 'border-primary bg-primary/5' : 'hover:bg-accent'
                  }`}
                >
                  <opt.icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowPublishDialog(false)} disabled={publishing}>
                取消
              </Button>
              <Button size="sm" onClick={handlePublish} disabled={publishing}>
                {publishing ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Globe className="mr-1 h-4 w-4" />}
                确认发布
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* === 携程旅拍风格 游记内容 === */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {/* Hero 封面区 */}
        {(post.journey?.coverUrl || post.mediaItems?.[0]?.url) ? (
          <div className="relative">
            <div className="aspect-[21/9] w-full overflow-hidden bg-muted">
              <img
                src={post.journey?.coverUrl || post.mediaItems[0].url}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            {/* 渐变遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {/* 叠加标题 */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h1 className="text-2xl font-bold text-white drop-shadow-lg leading-tight">
                {post.journey?.title || post.title || '我的游记'}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/80">
                <span>{post.author?.displayName || post.author?.username}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(post.createdAt).toLocaleDateString('zh-CN')}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {post.viewCount}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 pb-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {post.journey?.title || post.title || '我的游记'}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>{post.author?.displayName || post.author?.username}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(post.createdAt).toLocaleDateString('zh-CN')}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {post.viewCount}
              </span>
            </div>
          </div>
        )}

        <div className="p-5 space-y-5">
          {/* AI辅助角标 + 标题（有封面时在此处也显示） */}
          {(post.journey?.coverUrl || post.mediaItems?.[0]?.url) ? null : null}
          <div className="flex flex-wrap items-center gap-2">
            {isAiGenerated && (
              <button
                onClick={() => setShowAiSource(!showAiSource)}
                className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-600 dark:bg-violet-950/40 dark:text-violet-400 hover:bg-violet-100 transition-colors"
              >
                <Sparkles className="h-3 w-3" />
                AI辅助
              </button>
            )}
            {post.topics?.map((topic) => (
              <Badge key={topic.id} variant="secondary" className="text-xs">#{topic.name}</Badge>
            ))}
          </div>

          {/* AI 来源弹窗 */}
          {showAiSource && isAiGenerated && (
            <div className="rounded-lg border border-violet-200 bg-violet-50 p-3 text-xs text-violet-700 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-300">
              <p className="font-medium mb-1">AI 辅助生成</p>
              {post.vrMetadata && typeof post.vrMetadata === 'object' && (
                <>
                  {Array.isArray((post.vrMetadata as Record<string, unknown>).sourceSnapIds) && (
                    <p>基于 {((post.vrMetadata as Record<string, unknown>).sourceSnapIds as unknown[]).length} 条闪拍素材</p>
                  )}
                  {Array.isArray((post.vrMetadata as Record<string, unknown>).sourceDiaryIds) && (
                    <p>和 {((post.vrMetadata as Record<string, unknown>).sourceDiaryIds as unknown[]).length} 篇日记生成</p>
                  )}
                  {(post.vrMetadata as Record<string, unknown>).style && (
                    <p>风格：{(post.vrMetadata as Record<string, unknown>).style as string} · 语气：{(post.vrMetadata as Record<string, unknown>).tone as string || '温暖'}</p>
                  )}
                </>
              )}
            </div>
          )}

          {/* 精简信息仪表盘 */}
          {(post.journey?.destination || dayCount || post.journey?.budget || post.journey?.transport) && (
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-lg bg-muted/50 px-4 py-3 text-sm">
              {post.journey?.destination && (
                <>
                  <span className="text-muted-foreground">📍</span>
                  <span className="font-medium">{post.journey.destination}</span>
                </>
              )}
              {dayCount && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span>📆 {dayCount}天</span>
                </>
              )}
              {post.journey?.budget && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span>💰 {post.journey.budget}</span>
                </>
              )}
              {post.journey?.transport && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span>🚗 {post.journey.transport}</span>
                </>
              )}
              {post.journey?.theme && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span>🏷 {post.journey.theme}</span>
                </>
              )}
            </div>
          )}

          {/* 导语 */}
          {post.journey?.summary && (
            <p className="text-base italic leading-relaxed text-muted-foreground border-l-2 border-primary/30 pl-4">
              {post.journey.summary}
            </p>
          )}

          {/* 章节（Day by Day） */}
          {stops.length > 0 ? (
            <div className="space-y-8">
              {stops.map((stop) => (
                <section key={stop.id} className="space-y-3">
                  {/* 章节标题 */}
                  <h2 className="flex items-center gap-2.5 text-lg font-bold">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-bold shadow-sm">
                      D{stop.dayNumber}
                    </span>
                    <div>
                      <span>{stop.locationName || `第${stop.dayNumber}天`}</span>
                      {stop.dayDate && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">{stop.dayDate}</span>
                      )}
                    </div>
                  </h2>

                  {/* 图片区：大图 + 横滑缩略图 */}
                  {stop.mediaItems && stop.mediaItems.length > 0 && (
                    <StopGallery mediaItems={stop.mediaItems} />
                  )}

                  {/* 叙事正文 */}
                  {stop.description && (
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{stop.description}</p>
                  )}

                  {/* 推荐亮点卡片 */}
                  {stop.highlights && (
                    <div className="flex gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-800/50 dark:bg-emerald-950/20">
                      <MapPin className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-0.5">推荐亮点</p>
                        <p className="text-sm text-emerald-800 dark:text-emerald-300">{stop.highlights}</p>
                      </div>
                    </div>
                  )}

                  {/* 实用贴士卡片 */}
                  {stop.tips && (
                    <div className="flex gap-2.5 rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-800/50 dark:bg-amber-950/20">
                      <Lightbulb className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-0.5">实用贴士</p>
                        <p className="text-sm text-amber-800 dark:text-amber-300">{stop.tips}</p>
                      </div>
                    </div>
                  )}
                </section>
              ))}
            </div>
          ) : (
            /* 无结构化章节时显示纯文本 */
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{post.content}</p>
            </div>
          )}

          {/* 整体旅行贴士 */}
          {post.journey?.tips && (
            <div className="rounded-lg border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-800/50 dark:bg-sky-950/20">
              <div className="flex items-center gap-1.5 mb-2">
                <Info className="h-4 w-4 text-sky-500" />
                <h3 className="text-sm font-bold text-sky-700 dark:text-sky-400">旅行贴士</h3>
              </div>
              <p className="text-sm leading-relaxed text-sky-800 dark:text-sky-300 whitespace-pre-wrap">{post.journey.tips}</p>
            </div>
          )}

          {/* 结尾感悟 */}
          {post.journey?.insight && (
            <blockquote className="border-l-2 border-indigo-300 pl-4 text-[15px] italic leading-relaxed text-indigo-700/80 dark:border-indigo-800 dark:text-indigo-400/80">
              {post.journey.insight}
            </blockquote>
          )}
        </div>
      </div>
    </div>
  );
}

/** 章节图片画廊：大图 + 横滑缩略图 */
function StopGallery({ mediaItems }: { mediaItems: { url: string; thumbnailUrl?: string | null }[] }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (mediaItems.length === 0) return null;

  const current = mediaItems[currentIdx];

  return (
    <div className="space-y-2">
      {/* 大图 */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-muted">
        <img src={current.url} alt="" className="h-full w-full object-cover transition-opacity duration-300" />
        {mediaItems.length > 1 && (
          <>
            {currentIdx > 0 && (
              <button
                onClick={() => setCurrentIdx(currentIdx - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            {currentIdx < mediaItems.length - 1 && (
              <button
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
            {/* 图片计数 */}
            <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
              {currentIdx + 1}/{mediaItems.length}
            </div>
          </>
        )}
      </div>
      {/* 横滑缩略图 */}
      {mediaItems.length > 1 && (
        <div ref={scrollRef} className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {mediaItems.map((m, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-md transition-all ${
                i === currentIdx ? 'ring-2 ring-primary ring-offset-1' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <img src={m.thumbnailUrl || m.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
