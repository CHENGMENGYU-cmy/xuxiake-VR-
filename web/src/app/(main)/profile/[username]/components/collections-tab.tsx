'use client';

import { useState, useEffect } from 'react';
import { Bookmark, Loader2, PackageOpen, BookmarkMinus, Pencil, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PostCard } from '@/components/post/post-card';
import { getCollectionPosts, removePostFromCollection, updateCollection, createCollection, deleteCollection } from '@/lib/post-api';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import type { Collection, Post } from '@/types';

export function CollectionsTab() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    apiClient.get('/posts/collections?mine=1&limit=50')
      .then((res) => setCollections(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selectCollection = async (col: Collection) => {
    if (activeId === col.id) { setActiveId(null); return; }
    setActiveId(col.id);
    setPostsLoading(true);
    try {
      const result = await getCollectionPosts(col.id, 1);
      setPosts(result.posts || []);
    } catch { setPosts([]); }
    finally { setPostsLoading(false); }
  };

  const handleRemovePost = async (colId: string, postId: string) => {
    try {
      await removePostFromCollection(colId, postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setCollections((prev) => prev.map((c) => c.id === colId ? { ...c, postCount: Math.max(0, (c.postCount || 1) - 1) } : c));
      toast.success('已取消收藏');
    } catch { toast.error('操作失败'); }
  };

  const startEdit = (col: Collection) => {
    setEditingId(col.id);
    setEditName(col.name || '');
  };

  const saveEdit = async (col: Collection) => {
    if (!editName.trim() || editName.trim() === col.name) { setEditingId(null); return; }
    try {
      await updateCollection(col.id, { name: editName.trim() });
      setCollections((prev) => prev.map((c) => c.id === col.id ? { ...c, name: editName.trim() } : c));
      toast.success('已重命名');
    } catch (err: any) {
      toast.error(err?.response?.status === 404 ? '无权操作或收藏夹不存在' : '重命名失败');
    } finally { setEditingId(null); }
  };

  const handleCreate = async () => {
    const name = prompt('收藏夹名称：');
    if (!name?.trim()) return;
    try {
      const col = await createCollection({ name: name.trim() });
      setCollections((prev) => [{ ...col, name: name.trim() }, ...prev]);
      toast.success('已创建');
    } catch { toast.error('创建失败'); }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
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

  const activeCol = collections.find((c) => c.id === activeId);

  return (
    <div className="space-y-4">
      {/* 标签行 */}
      <div className="flex flex-wrap gap-2">
        {collections.map((col) => (
          <button
            key={col.id}
            onClick={() => selectCollection(col)}
            className={`group inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
              activeId === col.id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card hover:bg-accent'
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${activeId === col.id ? 'text-primary' : 'text-muted-foreground'}`} />
            {editingId === col.id ? (
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => saveEdit(col)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(col); if (e.key === 'Escape') setEditingId(null); }}
                className="h-5 w-20 text-xs"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="max-w-32 truncate">{col.name}</span>
            )}
            <span className="text-xs text-muted-foreground">{col.postCount || 0}</span>
            <span
              onClick={(e) => { e.stopPropagation(); startEdit(col); }}
              className="ml-0.5 cursor-pointer rounded p-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground"
              role="button"
            >
              <Pencil className="h-3 w-3" />
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`确定删除「${col.name}」？`)) {
                  deleteCollection(col.id).then(() => {
                    setCollections((prev) => prev.filter((c) => c.id !== col.id));
                    if (activeId === col.id) setActiveId(null);
                    toast.success('已删除');
                  }).catch(() => toast.error('删除失败'));
                }
              }}
              className="cursor-pointer rounded p-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive"
              role="button"
            >
              <Trash2 className="h-3 w-3" />
            </span>
          </button>
        ))}
        {/* 新建按钮 */}
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-muted-foreground/30 px-3 py-1.5 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          新建
        </button>
      </div>

      {/* 选中收藏夹的内容 */}
      {activeId && activeCol && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <h3 className="font-medium">{activeCol.name}</h3>
            <span className="text-xs text-muted-foreground">{activeCol.postCount || 0} 条</span>
          </div>
          {postsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map((post) => (
                <div key={post.id} className="relative">
                  <PostCard post={post} />
                  <Button
                    size="icon" variant="ghost"
                    className="absolute right-2 top-2 h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemovePost(activeId, post.id)}
                  >
                    <BookmarkMinus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">收藏夹为空</p>
          )}
        </div>
      )}
    </div>
  );
}
