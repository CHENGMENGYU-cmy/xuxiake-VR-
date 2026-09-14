'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Image as ImageIcon, Loader2, Music, Video, FileSearch } from 'lucide-react';
import { AuthGuard } from '@/components/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MediaCard } from '@/components/media/media-card';
import { getContentHierarchy } from '@/lib/post-api';
import type { MediaType, Post } from '@/types';

type MediaFilter = 'IMAGE' | 'VIDEO' | 'AUDIO';

const filters: { value: MediaFilter; label: string; icon: React.ReactNode }[] = [
  { value: 'IMAGE', label: '图片', icon: <ImageIcon className="h-4 w-4" /> },
  { value: 'VIDEO', label: '视频', icon: <Video className="h-4 w-4" /> },
  { value: 'AUDIO', label: '音频', icon: <Music className="h-4 w-4" /> },
];

export default function MediaPage() {
  return (
    <AuthGuard>
      <MediaContent />
    </AuthGuard>
  );
}

function MediaContent() {
  const initialType = useMemo<MediaFilter>(() => {
    if (typeof window === 'undefined') return 'IMAGE';
    const type = new URLSearchParams(window.location.search).get('type');
    return type === 'VIDEO' || type === 'AUDIO' ? type : 'IMAGE';
  }, []);
  const [mediaType, setMediaType] = useState<MediaFilter>(initialType);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getContentHierarchy({ mediaType, limit: 30 })
      .then((res) => setPosts(res.posts || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [mediaType]);

  const title = filters.find((item) => item.value === mediaType)?.label || '媒体';

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">媒体发现</h1>
        <p className="mt-1 text-sm text-muted-foreground">按图片、视频和语音记录浏览素材内容。</p>
      </div>

      <Tabs value={mediaType} onValueChange={(value) => setMediaType(value as MediaFilter)}>
        <TabsList className="grid w-full grid-cols-3">
          {filters.map((item) => (
            <TabsTrigger key={item.value} value={item.value} className="gap-1.5">
              {item.icon}
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>加载{title}内容中...</span>
        </div>
      ) : posts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <FileSearch className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">暂时没有{title}内容</p>
            <p className="mt-1 text-xs text-muted-foreground/70">可以从素材库上传后再回来查看。</p>
            <Link href="/snap">
              <Button className="mt-4" variant="outline">去素材库</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <MediaCard key={post.id} post={post} mediaType={mediaType as MediaType} />
          ))}
        </div>
      )}
    </div>
  );
}
