'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, MapPin, Clock, Tag, Sparkles, ChevronRight, ImageIcon } from 'lucide-react';
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
    if (/开心|满足|兴奋/.test(mood)) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    if (/疲惫|累/.test(mood)) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    if (/平静/.test(mood)) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    if (/难过|低落/.test(mood)) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  };

  const getMediaImage = (snap: any) => {
    if (snap.mediaItems?.length > 0) {
      const img = snap.mediaItems[0];
      return img.thumbnailUrl || img.url;
    }
    // 从 vrMetadata 获取图片
    try {
      const meta = typeof snap.vrMetadata === 'string' ? JSON.parse(snap.vrMetadata) : snap.vrMetadata;
      if (meta?.image) return meta.image;
    } catch {}
    return null;
  };

  return (
    <div className="space-y-5">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="h-6 w-6 text-orange-500" />
          <h1 className="text-xl font-bold">我的闪拍</h1>
        </div>
        <Badge variant="secondary" className="text-xs">
          {snaps.length} 条记录
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">
        从闪拍 App 同步的快速记录，是生成日记的素材来源。选择一条闪拍，AI 帮你一键生成完整日记。
      </p>

      {/* 闪拍列表 */}
      {snapsLoading ? (
        <div className="py-16 text-center">
          <div className="text-sm text-muted-foreground">加载中...</div>
        </div>
      ) : snaps.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Camera className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground mb-2">暂无闪拍记录</p>
            <p className="text-xs text-muted-foreground/60">
              使用闪拍 App 记录生活中的瞬间，记录将自动同步到这里
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {snaps.map((snap) => {
            const snapMeta = (() => {
              try {
                return typeof snap.vrMetadata === 'string' ? JSON.parse(snap.vrMetadata) : (snap.vrMetadata || {});
              } catch { return {}; }
            })();

            const image = getMediaImage(snap);
            const keywords = snapMeta.keywords || [];
            const mood = snapMeta.mood || '';
            const scene = snapMeta.scene || '';

            return (
              <Card
                key={snap.id}
                className="overflow-hidden hover:shadow-md transition-all group cursor-pointer"
                onClick={() => router.push(`/snap/generate/${snap.id}`)}
              >
                {/* 图片区 */}
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                  {image ? (
                    <img
                      src={image}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                  )}
                  {mood && (
                    <Badge className={`absolute top-3 left-3 text-xs ${getMoodColor(mood)}`}>
                      {mood}
                    </Badge>
                  )}
                  {scene && (
                    <Badge variant="secondary" className="absolute top-3 right-3 text-xs bg-white/80 dark:bg-black/50">
                      {scene}
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* 文字内容 */}
                  <p className="text-sm leading-relaxed line-clamp-2">
                    {snap.content || '(无内容)'}
                  </p>

                  {/* 关键词 */}
                  {keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {keywords.map((kw: string) => (
                        <Badge key={kw} variant="outline" className="text-[10px] px-1.5 py-0">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* 底部信息 */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      {snap.location?.name && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {snap.location.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(snap.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <Button
                    className="w-full gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                    size="sm"
                  >
                    <Sparkles className="h-4 w-4" />
                    生成日记
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
