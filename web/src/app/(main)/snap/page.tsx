'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, MapPin, Clock, Sparkles, ChevronRight, ImageIcon, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AuthGuard } from '@/components/auth-guard';
import { useSnapStore } from '@/stores/snap-store';

export default function SnapPage() {
  return (
    <AuthGuard>
      <SnapContent />
    </AuthGuard>
  );
}

function SnapContent() {
  const router = useRouter();
  const { snaps, snapsLoading, fetchSnaps } = useSnapStore();

  useEffect(() => {
    fetchSnaps();
  }, [fetchSnaps]);

  const getMoodColor = (mood: string) => {
    if (/开心|满足|兴奋/.test(mood)) return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400';
    if (/疲惫|累/.test(mood)) return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400';
    if (/平静/.test(mood)) return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400';
    if (/难过|低落/.test(mood)) return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400';
    return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400';
  };

  const getMediaImage = (snap: any) => {
    if (snap.mediaItems?.length > 0) {
      const img = snap.mediaItems[0];
      return img.thumbnailUrl || img.url;
    }
    try {
      const meta = typeof snap.vrMetadata === 'string' ? JSON.parse(snap.vrMetadata) : snap.vrMetadata;
      if (meta?.image) return meta.image;
    } catch {}
    return null;
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30">
              <Camera className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold">我的闪拍</h1>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">
            从闪拍 App 同步的快速记录，是生成日记的素材。选择一条记录，AI 帮你一键生成完整日记。
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {snaps.length} 条记录
        </Badge>
      </div>

      {/* 闪拍列表 */}
      {snapsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-[3/2] animate-pulse bg-muted" />
              <CardContent className="p-4 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : snaps.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
              <Camera className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="mt-4 text-sm font-medium text-muted-foreground">暂无闪拍记录</p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              使用闪拍 App 记录生活中的瞬间，记录将自动同步到这里
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {snaps.map((snap) => {
            const snapMeta = (() => {
              try {
                return typeof snap.vrMetadata === 'string' ? JSON.parse(snap.vrMetadata) : (snap.vrMetadata || {});
              } catch { return {}; }
            })();

            const image = getMediaImage(snap);
            const keywords: string[] = snapMeta.keywords || [];
            const mood = snapMeta.mood || '';
            const scene = snapMeta.scene || '';

            return (
              <Card
                key={snap.id}
                className="group overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer"
                onClick={() => router.push(`/snap/generate/${snap.id}`)}
              >
                {/* 有图的闪拍 */}
                {image ? (
                  <>
                    <div className="relative aspect-[3/2] bg-muted overflow-hidden">
                      <img
                        src={image}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      {mood && (
                        <Badge className={`absolute left-3 top-3 border ${getMoodColor(mood)}`}>
                          {mood}
                        </Badge>
                      )}
                      {scene && (
                        <Badge variant="secondary" className="absolute right-3 top-3 bg-white/80 backdrop-blur-sm text-xs dark:bg-black/50">
                          {scene}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <p className="text-sm leading-relaxed line-clamp-2">{snap.content || '(无内容)'}</p>
                      <div className="flex flex-wrap gap-1">
                        {keywords.slice(0, 4).map((kw: string) => (
                          <Badge key={kw} variant="outline" className="text-[10px]">{kw}</Badge>
                        ))}
                      </div>
                      <SnapFooter snap={snap} />
                      <Button
                        className="w-full gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-xs font-medium"
                        size="sm"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        AI 生成日记
                        <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                      </Button>
                    </CardContent>
                  </>
                ) : (
                  /* 纯文字闪拍 */
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-950/30">
                        <FileText className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-relaxed">{snap.content || '(无内容)'}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {mood && (
                            <Badge className={`text-[10px] border ${getMoodColor(mood)}`}>{mood}</Badge>
                          )}
                          {scene && (
                            <Badge variant="secondary" className="text-[10px]">{scene}</Badge>
                          )}
                          {keywords.slice(0, 3).map((kw: string) => (
                            <Badge key={kw} variant="outline" className="text-[10px]">{kw}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <SnapFooter snap={snap} />
                    <Button
                      className="w-full gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                      size="sm"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      AI 生成日记
                      <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                    </Button>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SnapFooter({ snap }: { snap: any }) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      {snap.location?.name && (
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span className="truncate max-w-[120px]">{snap.location.name}</span>
        </span>
      )}
      <span className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {new Date(snap.createdAt).toLocaleDateString('zh-CN')}
      </span>
    </div>
  );
}
