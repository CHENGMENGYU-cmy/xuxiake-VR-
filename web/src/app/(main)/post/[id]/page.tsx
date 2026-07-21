'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PostCard } from '@/components/post/post-card';
import { CommentSection } from '@/components/post/comment-section';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { getPostById } from '@/lib/post-api';
import type { Post } from '@/types';

export default function PostDetailPage() {
  const params = useParams();
  const postId = params?.id as string || '';
  return <PostDetailContent postId={postId} />;
}

function BackButton() {
  const router = useRouter();
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" className="gap-1" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        返回
      </Button>
    </div>
  );
}

function PostDetailContent({ postId }: { postId: string }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    if (!postId) return;
    let cancelled = false;
    getPostById(postId).then((data) => {
      if (!cancelled) {
        setPost(data);
        setCommentCount(data.commentCount);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [postId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center text-muted-foreground">
        帖子不存在或已被删除
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <BackButton />
      <PostCard post={post} />
      <CommentSection
        postId={postId}
        initialCount={commentCount}
        onCountChange={(delta) => setCommentCount((prev) => prev + delta)}
      />
    </div>
  );
}
