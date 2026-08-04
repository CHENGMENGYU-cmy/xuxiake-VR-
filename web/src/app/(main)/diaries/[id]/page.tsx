'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Lock, MapPin, Calendar, Trash2, Edit3, Save, X, Globe, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getPostById, updatePost, deletePost } from '@/lib/post-api';
import { useAuthStore } from '@/stores/auth-store';
import { AuthGuard } from '@/components/auth-guard';
import type { Post } from '@/types';

export default function DiaryDetailPage() {
  return (
    <AuthGuard>
      <DiaryDetailContent />
    </AuthGuard>
  );
}

function DiaryDetailContent() {
  const params = useParams();
  const router = useRouter();
  const postId = params?.id as string || '';
  const { user } = useAuthStore();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!postId) return;
    getPostById(postId).then((data) => {
      setPost(data);
      setEditContent(data.content || '');
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [postId]);

  // 权限检查：私密日记只能查看自己的，公开日记所有人可查看
  if (post && user && post.author?.id !== user.id && post.visibility === 'PRIVATE') {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center text-muted-foreground">
        无权访问此日记
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updatePost(postId, { content: editContent });
      setPost(updated);
      setEditing(false);
      toast.success('日记已更新');
    } catch {
      toast.error('保存失败');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('确定删除这篇日记？此操作不可恢复。')) return;
    setDeleting(true);
    try {
      await deletePost(postId);
      toast.success('日记已删除');
      router.push('/diaries');
    } catch {
      toast.error('删除失败');
    }
    setDeleting(false);
  };

  const handleCancel = () => {
    setEditContent(post?.content || '');
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center text-muted-foreground">
        日记不存在或已被删除
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* 返回按钮 */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => router.push('/diaries')}>
          <ArrowLeft className="h-4 w-4" />
          返回日记列表
        </Button>
        <div className="flex gap-2">
          {!editing && (
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setEditing(true)}>
              <Edit3 className="h-4 w-4" />
              编辑
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-red-500 hover:text-red-600"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            删除
          </Button>
        </div>
      </div>

      {/* 私密提示 */}
      <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/30 px-3 py-2">
        <Lock className="h-4 w-4 text-indigo-500 shrink-0" />
        <p className="text-xs text-indigo-600 dark:text-indigo-400">
          这是你的私密日记，仅自己可见
        </p>
      </div>

      {/* 日记内容卡片 */}
      <div className="rounded-lg border bg-card p-6">
        {/* 元信息 */}
        <div className="mb-4 flex items-center gap-3 text-sm text-muted-foreground">
          {post.location?.name && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>{post.location.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(post.createdAt).toLocaleString('zh-CN')}</span>
          </div>
        </div>

        {/* 内容区 */}
        {editing ? (
          <div className="space-y-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[300px] text-base leading-relaxed"
              placeholder="写下你的感想..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
                <X className="mr-1 h-4 w-4" />
                取消
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving || !editContent.trim()}>
                {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
                保存
              </Button>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap text-base leading-relaxed">{post.content}</p>
          </div>
        )}

        {/* 媒体附件 */}
        {post.mediaItems && post.mediaItems.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-2">
            {post.mediaItems.map((media, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-lg">
                {media.type === 'IMAGE' && (
                  <img src={media.url} alt="" className="h-full w-full object-cover" />
                )}
                {media.type === 'VIDEO' && (
                  <video src={media.url} className="h-full w-full object-cover" controls />
                )}
                {media.type === 'AUDIO' && (
                  <div className="flex h-full items-center justify-center bg-muted">
                    <audio src={media.url} controls className="w-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 话题标签 */}
        {post.topics && post.topics.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.topics.map((topic) => (
              <Badge key={topic.id} variant="secondary">#{topic.name}</Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
