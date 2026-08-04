'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, BookOpen, MapPin, Clock, Tag, Sparkles, Loader2, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AuthGuard } from '@/components/auth-guard';
import { useSnapStore } from '@/stores/snap-store';

export default function DiarySquarePage() {
  return (
    <AuthGuard>
      <SquareContent />
    </AuthGuard>
  );
}

function SquareContent() {
  const router = useRouter();
  const {
    squareDiaries, squareLoading, squareHasMore,
    fetchSquareDiaries,
  } = useSnapStore();

  useEffect(() => {
    fetchSquareDiaries(true);
  }, []);

  const getStyleColor = (style: string) => {
    const map: Record<string, string> = {
      '温柔治愈风': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      '生活碎片风': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      '成长复盘风': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      '诗意散文风': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      '轻松口语风': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    };
    return map[style] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  };

  const getCoverImage = (diary: any) => {
    if (diary.mediaItems?.length > 0) {
      return diary.mediaItems[0].thumbnailUrl || diary.mediaItems[0].url;
    }
    try {
      const meta = typeof diary.vrMetadata === 'string' ? JSON.parse(diary.vrMetadata) : (diary.vrMetadata || {});
      if (meta?.coverImage) return meta.coverImage;
    } catch {}
    return null;
  };

  const getStyle = (diary: any) => {
    try {
      const meta = typeof diary.vrMetadata === 'string' ? JSON.parse(diary.vrMetadata) : (diary.vrMetadata || {});
      return meta?.style || '';
    } catch { return ''; }
  };

  const getInsight = (diary: any) => {
    try {
      const meta = typeof diary.vrMetadata === 'string' ? JSON.parse(diary.vrMetadata) : (diary.vrMetadata || {});
      return meta?.insight || '';
    } catch { return ''; }
  };

  return (
    <div className="space-y-5">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-6 w-6 text-indigo-500" />
          <h1 className="text-xl font-bold">日记广场</h1>
        </div>
        <Badge variant="secondary" className="text-xs">
          {squareDiaries.length} 篇日记
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">
        浏览大家分享的日记，感受不同人的生活瞬间。
      </p>

      {/* 日记列表 */}
      {squareLoading && squareDiaries.length === 0 ? (
        <div className="py-16 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-3">加载中...</p>
        </div>
      ) : squareDiaries.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground mb-2">日记广场还没有内容</p>
            <p className="text-xs text-muted-foreground/60">
              成为第一个发布日记的人吧
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {squareDiaries.map((diary: any) => {
              const coverImage = getCoverImage(diary);
              const style = getStyle(diary);
              const insight = getInsight(diary);

              return (
                <Card
                  key={diary.id}
                  className="overflow-hidden hover:shadow-md transition-all group"
                >
                  {/* 封面图 */}
                  {coverImage && (
                    <div className="aspect-[4/3] bg-muted overflow-hidden">
                      <img
                        src={coverImage}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <CardContent className="p-4 space-y-3">
                    {/* 标题 */}
                    <h3 className="font-semibold text-sm leading-tight line-clamp-1">
                      {diary.title || '无标题'}
                    </h3>

                    {/* 摘要 */}
                    <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {diary.content || '(无内容)'}
                    </p>

                    {/* 感悟 */}
                    {insight && (
                      <p className="text-xs italic text-indigo-600/80 dark:text-indigo-400/80 border-l-2 border-indigo-300 pl-2">
                        {insight}
                      </p>
                    )}

                    {/* 风格标签 */}
                    <div className="flex items-center gap-2">
                      {style && (
                        <Badge className={`text-[10px] px-1.5 ${getStyleColor(style)}`}>
                          {style}
                        </Badge>
                      )}
                    </div>

                    {/* 底部信息 */}
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {diary.author && (
                          <>
                            <User className="h-3 w-3" />
                            <span>{diary.author.displayName}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(diary.createdAt).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* 加载更多 */}
          {squareHasMore && (
            <div className="text-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchSquareDiaries()}
                disabled={squareLoading}
                className="gap-1.5"
              >
                {squareLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                加载更多
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
