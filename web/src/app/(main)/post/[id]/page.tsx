'use client';

import { useState, useEffect, use } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PostCard } from '@/components/post/post-card';
import { CommentSection } from '@/components/post/comment-section';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { getPostById } from '@/lib/post-api';
import type { Post } from '@/types';

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <PostDetailContent postId={id} />;
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
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* 返回按钮 */}
      <BackButton />

      {/* 帖子内容 */}
      <PostCard post={post} />

      {/* 评论区 */}
      <CommentSection
        postId={postId}
        initialCount={commentCount}
        onCountChange={(delta) => setCommentCount((prev) => prev + delta)}
      />
    </div>
  );
}
