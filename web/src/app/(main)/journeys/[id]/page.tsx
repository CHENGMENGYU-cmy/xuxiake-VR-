'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Globe, Lock, MapPin, Calendar, Trash2, Edit3, Save, X, Eye, EyeOff, MapPinned } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getPostById, updatePost, deletePost, publishPost, unpublishPost } from '@/lib/post-api';
import { useAuthStore } from '@/stores/auth-store';
import { AuthGuard } from '@/components/auth-guard';
import type { Post } from '@/types';

export default function JourneyDetailPage() {
  return (
    <AuthGuard>
      <JourneyDetailContent />
    </AuthGuard>
  );
}

function JourneyDetailContent() {
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
  const [publishing, setPublishing] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [locationPrecision, setLocationPrecision] = useState<'hidden' | 'city' | 'exact'>('city');

  useEffect(() => {
    if (!postId) return;
    getPostById(postId).then((data) => {
      setPost(data);
      setEditContent(data.content || '');
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [postId]);

  // 权限检查
  if (post && user && post.author?.id !== user.id && post.visibility === 'PRIVATE') {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center text-muted-foreground">
        无权访问此游记
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updatePost(postId, { content: editContent });
      setPost(updated);
      setEditing(false);
      toast.success('游记已更新');
    } catch {
      toast.error('保存失败');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('确定删除这篇游记？此操作不可恢复。')) return;
    setDeleting(true);
    try {
      await deletePost(postId);
      toast.success('游记已删除');
      router.push('/journeys');
    } catch {
      toast.error('删除失败');
    }
    setDeleting(false);
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const updated = await publishPost(postId, locationPrecision);
      setPost(updated);
      setShowPublishDialog(false);
      toast.success('游记已发布到社区');
    } catch {
      toast.error('发布失败');
    }
    setPublishing(false);
  };

  const handleUnpublish = async () => {
    if (!confirm('撤回后游记将从社区移除，但保留为你的私密内容。确定撤回？')) return;
    try {
      const updated = await unpublishPost(postId);
      setPost(updated);
      toast.success('游记已撤回');
    } catch {
      toast.error('撤回失败');
    }
  };

  const handleCancel = () => {
    setEditContent(post?.content || '');
    setEditing(false);
  };

  const isPublic = post?.visibility === 'PUBLIC';
  const isOwner = post && user && post.author?.id === user.id;

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
        游记不存在或已被删除
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => router.push('/journeys')}>
          <ArrowLeft className="h-4 w-4" />
          返回游记列表
        </Button>
        {isOwner && (
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
        )}
      </div>

      {/* 状态提示 */}
      <div className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
        isPublic
          ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30'
          : 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30'
      }`}>
        <div className="flex items-center gap-2">
          {isPublic ? (
            <>
              <Globe className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">已发布到社区</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">私密内容</span>
            </>
          )}
        </div>
        {isOwner && (
          isPublic ? (
            <Button variant="outline" size="sm" className="gap-1" onClick={handleUnpublish}>
              <EyeOff className="h-4 w-4" />
              撤回
            </Button>
          ) : (
            <Button size="sm" className="gap-1" onClick={() => setShowPublishDialog(true)}>
              <Globe className="h-4 w-4" />
              发布到社区
            </Button>
          )
        )}
      </div>

      {/* 发布对话框 */}
      {showPublishDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold">发布到社区</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              发布后，所有人可以在社区中看到这篇游记。请选择地点显示精度：
            </p>
            <div className="mb-4 space-y-2">
              {[
                { value: 'hidden' as const, label: '隐藏地点', desc: '不显示任何地点信息', icon: EyeOff },
                { value: 'city' as const, label: '仅城市', desc: '只显示城市名称', icon: MapPinned },
                { value: 'exact' as const, label: '具体地点', desc: '显示完整地点名称', icon: MapPin },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLocationPrecision(opt.value)}
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                    locationPrecision === opt.value ? 'border-primary bg-primary/5' : 'hover:bg-accent'
                  }`}
                >
                  <opt.icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowPublishDialog(false)} disabled={publishing}>
                取消
              </Button>
              <Button size="sm" onClick={handlePublish} disabled={publishing}>
                {publishing ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Globe className="mr-1 h-4 w-4" />}
                确认发布
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 游记内容卡片 */}
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
          <div className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            <span>{post.viewCount} 浏览</span>
          </div>
        </div>

        {/* 内容区 */}
        {editing ? (
          <div className="space-y-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[400px] text-base leading-relaxed"
              placeholder="写下你的游记..."
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
          <div className="mt-6 space-y-3">
            {post.mediaItems.map((media, i) => (
              <div key={i} className="overflow-hidden rounded-lg">
                {media.type === 'IMAGE' && (
                  <img src={media.url} alt="" className="w-full rounded-lg" />
                )}
                {media.type === 'VIDEO' && (
                  <video src={media.url} className="w-full rounded-lg" controls />
                )}
                {media.type === 'AUDIO' && (
                  <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-4">
                    <audio src={media.url} controls className="w-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 旅程站点 */}
        {post.journey?.stops && post.journey.stops.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">旅程站点</h4>
            {post.journey.stops.map((stop, i) => (
              <div key={i} className="flex gap-3 rounded-lg border p-3">
                {stop.dayNumber && (
                  <Badge variant="outline" className="shrink-0">Day {stop.dayNumber}</Badge>
                )}
                <div>
                  {stop.locationName && <p className="text-sm font-medium">{stop.locationName}</p>}
                  {stop.description && <p className="text-xs text-muted-foreground">{stop.description}</p>}
                </div>
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
