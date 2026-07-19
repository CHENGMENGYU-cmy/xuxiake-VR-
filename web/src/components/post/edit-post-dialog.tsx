'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { updatePost } from '@/lib/post-api';
import { usePostStore } from '@/stores/post-store';
import type { Post } from '@/types';

const MAX_CONTENT_LENGTH = 500;

interface EditPostDialogProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPostDialog({ post, open, onOpenChange }: EditPostDialogProps) {
  const [content, setContent] = useState(post.content || '');
  const [saving, setSaving] = useState(false);
  const updatePostInList = usePostStore((s) => s.updatePostInList);

  useEffect(() => {
    if (open) {
      setContent(post.content || '');
    }
  }, [open, post.content]);

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CONTENT_LENGTH;
  const canSave = content.trim().length > 0 && !isOverLimit && !saving && content !== (post.content || '');

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const updated = await updatePost(post.id, { content: content.trim() });
      updatePostInList(post.id, updated);
      onOpenChange(false);
      toast.success('修改成功');
    } catch {
      toast.error('修改失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>编辑内容</DialogTitle>
        </DialogHeader>

        <Textarea
          value={content}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CONTENT_LENGTH) {
              setContent(e.target.value);
            }
          }}
          placeholder="输入内容..."
          className="min-h-[120px] resize-none"
          disabled={saving}
          autoFocus
        />

        <div className="flex items-center justify-between">
          <span className={`text-xs ${charCount > 450 ? 'text-orange-500' : 'text-muted-foreground'}`}>
            {charCount}/{MAX_CONTENT_LENGTH}
          </span>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />保存中...</> : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
