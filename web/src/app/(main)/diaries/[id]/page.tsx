'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Lock, MapPin, Calendar, Trash2, Edit3, Save, X, Globe, User, Sparkles, PenLine, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getPostById, updatePost, deletePost, publishPost } from '@/lib/post-api';
import { useAuthStore } from '@/stores/auth-store';
import { AuthGuard } from '@/components/auth-guard';
import type { Post, MoodType, WeatherType } from '@/types';
import { MoodEmoji, WeatherEmoji, MoodLabel, WeatherLabel } from '@/types';

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
  const [changing, setChanging] = useState(false);

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

  const changeVisibility = async (visibility: 'PRIVATE' | 'PUBLIC' | 'FOLLOWERS') => {
    if (!post || changing) return;
    setChanging(true);
    try {
      await publishPost(post.id, undefined, visibility);
      setPost({ ...post, visibility });
      toast.success(visibility === 'PRIVATE' ? '已转为私密' : visibility === 'PUBLIC' ? '已转为公开' : '已设为关注可见');
    } catch {
      toast.error('切换可见性失败，请重试');
    } finally {
      setChanging(false);
    }
  };

  const continueEdit = () => {
    if (!post) return;
    const meta = post.vrMetadata || {};
    if (Array.isArray(meta.sourceSnapIds) && meta.sourceSnapIds.length > 1) {
      router.push(`/snap/generate/batch?ids=${meta.sourceSnapIds.join(',')}&postId=${post.id}`);
    } else if (post.parentPostId) {
      router.push(`/snap/generate/${post.parentPostId}`);
    } else {
      router.push(`/upload?edit=${post.id}`);
    }
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

  const isOwner = user && post.author?.id === user.id;
  const isDraft = post.vrMetadata?.status === 'draft';

  // 统一完整卡片所需的元数据（手写/AI 两种来源都能提取）
  const diaryMeta = (() => {
    try {
      if (!post.vrMetadata) return {};
      return typeof post.vrMetadata === 'string' ? JSON.parse(post.vrMetadata) : post.vrMetadata;
    } catch { return {}; }
  })();
  const mood = diaryMeta.mood as MoodType | undefined;
  const weather = diaryMeta.weather as WeatherType | undefined;
  const insight = diaryMeta.insight as string | undefined;
  const style = diaryMeta.style as string | undefined;
  const firstImage = post.mediaItems?.find((m) => m.type === 'IMAGE');
  const coverImage = firstImage
    ? (firstImage.thumbnailUrl || firstImage.url)
    : (diaryMeta.coverImage || null);
  const displayTitle = post.title || '日记';

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* 返回按钮 */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => router.push(isOwner ? '/diaries' : '/discover?tab=diary')}>
          <ArrowLeft className="h-4 w-4" />
          {isOwner ? '返回日记列表' : '返回日记广场'}
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

      {/* 可见性提示 */}
      {post.visibility === 'PUBLIC' ? (
        <div className="flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 dark:border-teal-900 dark:bg-teal-950/30 px-3 py-2">
          <Globe className="h-4 w-4 text-teal-500 shrink-0" />
          <p className="text-xs text-teal-600 dark:text-teal-400">
            这是一篇公开日记
            {!isOwner && post.author && (
              <span className="ml-1">来自 <span className="font-medium">{post.author.displayName}</span></span>
            )}
          </p>
        </div>
      ) : isOwner ? (
        <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/30 px-3 py-2">
          <Lock className="h-4 w-4 text-indigo-500 shrink-0" />
          <p className="text-xs text-indigo-600 dark:text-indigo-400">
            这是你的私密日记，仅自己可见
          </p>
        </div>
      ) : null}

      {/* 日记内容卡片：统一完整卡片（标题+时间+天气+心情+内容+图片） */}
      <div className="overflow-hidden rounded-lg border bg-card">
        {/* 封面图 */}
        {coverImage && (
          <div className="aspect-[16/9] bg-muted">
            <img src={coverImage} alt="" className="h-full w-full object-cover" />
          </div>
        )}

        <div className="p-6">
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
            <>
              {/* 标题 */}
              <h1 className="mb-2 text-2xl font-bold tracking-tight">{displayTitle}</h1>

              {/* 元信息：时间 + 天气 + 心情 + 地点 + 风格 */}
              <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(post.createdAt).toLocaleString('zh-CN')}
                </span>
                {weather && (
                  <span className="flex items-center gap-1">
                    <span className="text-base">{WeatherEmoji[weather]}</span>
                    {WeatherLabel[weather]}
                  </span>
                )}
                {mood && (
                  <span className="flex items-center gap-1">
                    {MoodEmoji[mood as MoodType] && <span className="text-base">{MoodEmoji[mood as MoodType]}</span>}
                    {MoodLabel[mood as MoodType] || mood}
                  </span>
                )}
                {post.location?.name && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {post.location.name}
                  </span>
                )}
                {style && <Badge variant="secondary" className="text-[10px]">{style}</Badge>}
              </div>

              {/* 正文 */}
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="whitespace-pre-wrap text-base leading-relaxed">{post.content}</p>
              </div>

              {/* 感悟 */}
              {insight && (
                <blockquote className="mt-5 border-l-2 border-indigo-300 pl-3 text-sm italic text-indigo-700/80 dark:border-indigo-800 dark:text-indigo-400/80">
                  {insight}
                </blockquote>
              )}
            </>
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

      {/* 所有者操作区：草稿引导继续写；已发布则切换可见性 + 升华为游记 */}
      {isOwner && (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          {isDraft ? (
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">这是一篇未发布的草稿</p>
              <Button size="sm" className="gap-1.5 shrink-0" onClick={continueEdit}>
                <PenLine className="h-4 w-4" />继续写
              </Button>
            </div>
          ) : (
            <>
              <div>
                <p className="mb-2 text-sm font-medium">可见性</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={post.visibility === 'PUBLIC' ? 'default' : 'outline'}
                    onClick={() => changeVisibility('PUBLIC')}
                    disabled={changing}
                    className="gap-1.5"
                  >
                    <Globe className="h-3.5 w-3.5" />公开
                  </Button>
                  <Button
                    size="sm"
                    variant={post.visibility === 'PRIVATE' ? 'default' : 'outline'}
                    onClick={() => changeVisibility('PRIVATE')}
                    disabled={changing}
                    className="gap-1.5 text-amber-600"
                  >
                    <Lock className="h-3.5 w-3.5" />私密
                  </Button>
                  <Button
                    size="sm"
                    variant={post.visibility === 'FOLLOWERS' ? 'default' : 'outline'}
                    onClick={() => changeVisibility('FOLLOWERS')}
                    disabled={changing}
                    className="gap-1.5"
                  >
                    <Users className="h-3.5 w-3.5" />关注可见
                  </Button>
                </div>
              </div>
              <div className="border-t border-border/50 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-purple-600"
                  onClick={() => router.push(`/journeys/generate?ids=${post.id}`)}
                >
                  <Sparkles className="h-3.5 w-3.5" />升华为游记
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
