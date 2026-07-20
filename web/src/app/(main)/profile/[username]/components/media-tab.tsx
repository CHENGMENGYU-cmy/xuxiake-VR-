'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Heart, MessageCircle, Loader2, Image as ImageIcon, Video, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import apiClient from '@/lib/api-client';

interface MediaItem {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  url: string;
  thumbnailUrl: string | null;
  vrFormat: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  post: {
    id: string;
    content: string | null;
    likeCount: number;
    commentCount: number;
  } | null;
}

const mediaTypeFilters = [
  { value: '', label: '全部', icon: null },
  { value: 'IMAGE', label: '图片', icon: <ImageIcon className="h-3.5 w-3.5" /> },
  { value: 'VIDEO', label: '视频', icon: <Video className="h-3.5 w-3.5" /> },
];

interface MediaTabProps {
  username: string;
}

export function MediaTab({ username }: MediaTabProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [activeType, setActiveType] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const observerRef = useRef<HTMLDivElement>(null);

  const fetchMedia = useCallback(async (type: string, cursor?: string) => {
    const params: Record<string, string> = { limit: '30' };
    if (type) params.type = type;
    if (cursor) params.cursor = cursor;

    const res = await apiClient.get(`/users/${username}/media`, { params });
    if (res.data.success) {
      return res.data;
    }
    return { data: [], nextCursor: null, hasMore: false };
  }, [username]);

  // 首次加载或类型切换
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMedia([]);
    setNextCursor(null);
    setHasMore(false);

    fetchMedia(activeType).then((res) => {
      if (!cancelled) {
        setMedia(res.data);
        setNextCursor(res.nextCursor);
        setHasMore(res.hasMore);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [activeType, fetchMedia]);

  // 无限滚动加载更多
  useEffect(() => {
    if (!hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true);
          fetchMedia(activeType, nextCursor || undefined).then((res) => {
            setMedia((prev) => [...prev, ...res.data]);
            setNextCursor(res.nextCursor);
            setHasMore(res.hasMore);
            setLoadingMore(false);
          }).catch(() => setLoadingMore(false));
        }
      },
      { threshold: 0.1 }
    );

    const el = observerRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [hasMore, loadingMore, activeType, nextCursor, fetchMedia]);

  const handleLightboxPrev = () => {
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
  };

  const handleLightboxNext = () => {
    setLightboxIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
  };

  const currentMedia = media[lightboxIndex];

  return (
    <div className="space-y-4">
      {/* 类型筛选栏 */}
      <div className="flex gap-1">
        {mediaTypeFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={activeType === filter.value ? 'default' : 'outline'}
            size="sm"
            className="flex-shrink-0 gap-1 rounded-full text-xs"
            onClick={() => setActiveType(filter.value)}
          >
            {filter.icon}
            {filter.label}
          </Button>
        ))}
      </div>

      {/* 媒体网格 */}
      {loading ? (
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      ) : media.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
            {media.map((item, idx) => (
              <div
                key={item.id}
                className="group relative aspect-square cursor-pointer overflow-hidden bg-muted"
                onClick={() => {
                  setLightboxIndex(idx);
                  setLightboxOpen(true);
                }}
              >
                <Image
                  src={item.thumbnailUrl || item.url}
                  alt=""
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  unoptimized
                />
                {/* 视频标识 */}
                {item.type === 'VIDEO' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
                    <div className="rounded-full bg-white/90 p-2 shadow-lg">
                      <Play className="h-4 w-4 fill-foreground" />
                    </div>
                  </div>
                )}
                {/* VR 标识 */}
                {item.vrFormat && item.vrFormat !== 'STANDARD' && (
                  <Badge className="absolute left-1.5 top-1.5 bg-black/70 text-[10px] text-white hover:bg-black/70">
                    VR
                  </Badge>
                )}
                {/* Hover 互动数据 */}
                {item.post && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex items-center gap-3 text-[10px] text-white">
                      <span className="flex items-center gap-0.5">
                        <Heart className="h-3 w-3" /> {item.post.likeCount}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <MessageCircle className="h-3 w-3" /> {item.post.commentCount}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {loadingMore && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {hasMore && <div ref={observerRef} className="h-4" />}
        </>
      ) : (
        <div className="py-12 text-center text-muted-foreground">
          <ImageIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
          <p>还没有媒体内容</p>
        </div>
      )}

      {/* Lightbox 全屏预览 */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl border-0 bg-black/95 p-0">
          <div className="relative flex items-center justify-center" style={{ minHeight: '60vh' }}>
            {/* 关闭按钮 */}
            <button
              className="absolute right-3 top-3 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>

            {/* 左右切换 */}
            {media.length > 1 && (
              <>
                <button
                  className="absolute left-3 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                  onClick={handleLightboxPrev}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  className="absolute right-3 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                  onClick={handleLightboxNext}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* 媒体内容 */}
            {currentMedia && (
              <>
                {currentMedia.type === 'VIDEO' ? (
                  <video
                    src={currentMedia.url}
                    poster={currentMedia.thumbnailUrl ?? undefined}
                    controls
                    autoPlay
                    className="max-h-[70vh] w-full object-contain"
                  />
                ) : (
                  <Image
                    src={currentMedia.url}
                    alt=""
                    width={currentMedia.width || 1200}
                    height={currentMedia.height || 900}
                    className="max-h-[70vh] w-full object-contain"
                    unoptimized
                  />
                )}
              </>
            )}

            {/* 底部信息 */}
            {currentMedia?.post && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/80 line-clamp-1">
                    {currentMedia.post.content || '无文字内容'}
                  </p>
                  <Link
                    href={`/post/${currentMedia.post.id}`}
                    className="ml-4 flex-shrink-0 text-xs text-white/60 hover:text-white"
                  >
                    查看帖子
                  </Link>
                </div>
              </div>
            )}

            {/* 计数器 */}
            {media.length > 1 && (
              <div className="absolute top-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white/80">
                {lightboxIndex + 1} / {media.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
