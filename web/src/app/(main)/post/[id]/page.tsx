import { notFound } from 'next/navigation';
import { PostCard } from '@/components/post/post-card';
import { mockPosts } from '@/lib/mock-data';

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // 简化处理，直接使用 mock 数据
  const post = mockPosts[0];
  if (!post) notFound();

  return (
    <div className="space-y-4">
      <PostCard post={post} />

      {/* 评论区占位 */}
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">评论功能即将上线</p>
        <p className="mt-1 text-xs text-muted-foreground/70">你可以在这里看到和发表评论</p>
      </div>
    </div>
  );
}
