'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Loader2, ChevronRight, PackageOpen, BookmarkMinus, Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PostCard } from '@/components/post/post-card';
import { getCollections, getCollectionPosts, removePostFromCollection, updateCollection } from '@/lib/post-api';
import { toast } from 'sonner';
import type { Collection, Post } from '@/types';

export function CollectionsTab() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const startEdit = (col: Collection) => {
    setEditingId(col.id);
    setEditName(col.name || col.title || '');
  };

  const saveEdit = async (col: Collection) => {
    if (!editName.trim() || editName.trim() === (col.name || col.title)) {
      setEditingId(null);
      return;
    }
    try {
      await updateCollection(col.id, { name: editName.trim() });
      setCollections((prev) => prev.map((c) => c.id === col.id ? { ...c, name: editName.trim(), title: editName.trim() } : c));
      toast.success('已重命名');
    } catch {
      toast.error('重命名失败');
    } finally {
      setEditingId(null);
    }
  };

  useEffect(() => {
    getCollections(1)
      .then((res) => setCollections(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = async (col: Collection) => {
    if (expandedId === col.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(col.id);
    setPostsLoading(true);
    try {
      const result = await getCollectionPosts(col.id, 1);
      setPosts(result.posts || []);
    } catch {
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-muted-foreground">
        <PackageOpen className="h-12 w-12 opacity-30" />
        <p className="mt-3">还没有收藏夹</p>
        <p className="mt-1 text-sm">浏览内容时点击「...」→「收藏」即可创建</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {collections.map((col) => (
        <Card key={col.id} className="overflow-hidden">
          <button
            onClick={() => toggleExpand(col)}
            className="flex w-full items-center gap-3 p-4 text-left hover:bg-accent/50 transition-colors"
          >
            <Bookmark className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{col.title}</p>
              <p className="text-xs text-muted-foreground">
                {col.postCount || 0} 条内容
                {col.description && ` · ${col.description}`}
              </p>
            </div>
            <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expandedId === col.id ? 'rotate-90' : ''}`} />
          </button>

          {expandedId === col.id && (
            <CardContent className="border-t p-3">
              {postsLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : posts.length > 0 ? (
                <div className="space-y-3">
                  {posts.map((post) => (
                    <div key={post.id} className="relative">
                      <PostCard post={post} />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-2 top-2 h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={async () => {
                          try {
                            await removePostFromCollection(col.id, post.id);
                            setPosts((prev) => prev.filter((p) => p.id !== post.id));
                            toast.success('已取消收藏');
                          } catch { toast.error('操作失败'); }
                        }}
                      >
                        <BookmarkMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">收藏夹为空</p>
              )}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
