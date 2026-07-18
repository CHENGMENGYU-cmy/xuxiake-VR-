'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/post/post-card';
import { getTopicById, getTopicPosts } from '@/lib/post-api';
import type { Topic, Post } from '@/types';

export default function TopicDetailPage() {
  const params = useParams();
  const topicId = params.id as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'latest' | 'hot'>('latest');
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!topicId) return;
    getTopicById(topicId).then(setTopic).catch(() => {});
  }, [topicId]);

  useEffect(() => {
    if (!topicId) return;
    setLoading(true);
    setPage(1);
    getTopicPosts(topicId, { page: 1, limit: 10, sort })
      .then((res) => {
        setPosts(res.posts);
        setHasMore(res.hasMore);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [topicId, sort]);

  const loadMore = () => {
    const nextPage = page + 1;
    getTopicPosts(topicId, { page: nextPage, limit: 10, sort })
      .then((res) => {
        setPosts((prev) => [...prev, ...res.posts]);
        setHasMore(res.hasMore);
        setPage(nextPage);
      })
      .catch(() => {});
  };

  return (
    <div className="space-y-4">
      <Link href="/topics" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        话题广场
      </Link>

      {topic && (
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{topic.icon || '#'}</span>
            <div>
              <h1 className="text-xl font-bold">#{topic.name}</h1>
              <p className="text-sm text-muted-foreground">{topic.postCount} 篇内容</p>
            </div>
          </div>
          {topic.description && (
            <p className="mt-3 text-sm text-muted-foreground">{topic.description}</p>
          )}
        </div>
      )}

      <div className="flex gap-1">
        <Button
          variant={sort === 'latest' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSort('latest')}
          className="gap-1.5"
        >
          <Clock className="h-3.5 w-3.5" />
          最新
        </Button>
        <Button
          variant={sort === 'hot' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSort('hot')}
          className="gap-1.5"
        >
          <TrendingUp className="h-3.5 w-3.5" />
          最热
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {hasMore && (
            <div className="flex justify-center py-4">
              <Button variant="outline" onClick={loadMore}>
                加载更多
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="py-16 text-center text-muted-foreground">
          暂无相关内容
        </div>
      )}
    </div>
  );
}
