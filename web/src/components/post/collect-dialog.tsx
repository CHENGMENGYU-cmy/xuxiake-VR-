'use client';

import { useState, useEffect } from 'react';
import { Bookmark, Plus, Loader2, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { getCollectionPosts, createCollection, addPostToCollection, removePostFromCollection } from '@/lib/post-api';
import apiClient from '@/lib/api-client';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { LoginPrompt } from '@/components/login-prompt';
import { toast } from 'sonner';
import type { Collection } from '@/types';

interface CollectDialogProps {
  postId: string;
  open: boolean;
  onClose: () => void;
}

export function CollectDialog({ postId, open, onClose }: CollectDialogProps) {
  const { requireAuth, showPrompt, setShowPrompt, action } = useRequireAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open) {
      if (!requireAuth('收藏')) {
        onClose();
        return;
      }
      setSelectedIds(new Set());
      setLoading(true);
      apiClient.get('/posts/collections?mine=1&limit=50')
        .then(async (res) => {
          const cols = res.data.data || [];
          setCollections(cols);
          // 检查哪些收藏夹已包含此帖子
          const results = await Promise.allSettled(
            cols.map((c) => getCollectionPosts(c.id, 1))
          );
          const ids = new Set<string>();
          results.forEach((r, i) => {
            if (r.status === 'fulfilled' && r.value.posts?.some((p: any) => p.id === postId)) {
              ids.add(cols[i].id);
            }
          });
          setSelectedIds(ids);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [open, postId]);

  const toggle = async (col: Collection) => {
    const isSelected = selectedIds.has(col.id);
    try {
      if (isSelected) {
        await removePostFromCollection(col.id, postId);
        setSelectedIds((prev) => { const next = new Set(prev); next.delete(col.id); return next; });
        toast.success('已取消收藏');
      } else {
        await addPostToCollection(col.id, postId);
        setSelectedIds((prev) => new Set(prev).add(col.id));
        toast.success('已加入收藏');
      }
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        toast.error('内容不存在，可能已被删除');
      } else {
        toast.error('操作失败，请重试');
      }
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const col = await createCollection({ name: newName.trim() });
      setCollections((prev) => [...prev, col]);
      setNewName('');
      toast.success('收藏夹已创建');
    } catch {
      toast.error('创建失败');
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              收藏到
            </DialogTitle>
            <DialogDescription>选择收藏夹，将内容保存到对应位置</DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {collections.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">暂无收藏夹，创建一个吧</p>
              )}
              {collections.map((col) => {
                const isSelected = selectedIds.has(col.id);
                return (
                  <button
                    key={col.id}
                    onClick={() => toggle(col)}
                    className={`flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-accent ${
                      isSelected ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                      isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
                    }`}>
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{col.title}</p>
                      <p className="text-xs text-muted-foreground">{col.description || `${col.postCount || 0} 条内容`}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <Separator />

          {/* 新建收藏夹 */}
          <div className="flex gap-2">
            <Input
              placeholder="新建收藏夹..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
            />
            <Button size="icon" variant="outline" onClick={handleCreate} disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <LoginPrompt open={showPrompt} onOpenChange={setShowPrompt} action={action} />
    </>
  );
}
