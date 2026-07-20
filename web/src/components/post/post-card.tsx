'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, Eye, MoreHorizontal, Play, Volume2, Globe, MapPin, FileText, Map, Compass, BookOpen, MessageSquare, Clock, TrendingUp, Pencil, Trash2, Copy, Bookmark, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MediaViewer } from './media-viewer';
import { EditPostDialog } from './edit-post-dialog';
import { ShareSheet } from './share-sheet';
import { InlineComment } from './inline-comment';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Post } from '@/types';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { usePostStore } from '@/stores/post-store';
import { likePost, unlikePost, incrementViewCount } from '@/lib/post-api';
import { toast } from 'sonner';


const vrFormatLabels: Record<string, string> = {
  VR360: 'VR 360°',
  VR180: 'VR 180°',
  SPATIAL: '空间视频',
  STANDARD: '标准',
};

const mediaTypeIcons: Record<string, React.ReactNode> = {
  VIDEO: <Play className="h-3 w-3" />,
  AUDIO: <Volume2 className="h-3 w-3" />,
};

const postTypeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  NOTE: { label: '笔记', icon: <FileText className="h-3 w-3" />, color: 'bg-primary/10 text-primary' },
  VR_MEDIA: { label: 'VR', icon: <Play className="h-3 w-3" />, color: 'bg-violet-500/10 text-violet-500' },
  ROUTE: { label: '路线', icon: <Map className="h-3 w-3" />, color: 'bg-emerald-500/10 text-emerald-500' },
  JOURNEY: { label: '旅程', icon: <Compass className="h-3 w-3" />, color: 'bg-amber-500/10 text-amber-500' },
  GUIDE: { label: '攻略', icon: <BookOpen className="h-3 w-3" />, color: 'bg-blue-500/10 text-blue-500' },
  MOMENT: { label: '动态', icon: <MessageSquare className="h-3 w-3" />, color: 'bg-pink-500/10 text-pink-500' },
};

const difficultyLabels: Record<string, string> = { EASY: '简单', MODERATE: '中等', HARD: '困难', EXPERT: '专家' };
const difficultyColors: Record<string, string> = {
  EASY: 'bg-green-500/10 text-green-600',
  MODERATE: 'bg-yellow-500/10 text-yellow-600',
  HARD: 'bg-orange-500/10 text-orange-600',
  EXPERT: 'bg-red-500/10 text-red-600',
};
const routeTypeLabels: Record<string, string> = { HIKE: '🥾徒步', BIKE: '🚴骑行', DRIVE: '🚗自驾', PADDLE: '🛶皮划艇', CLIMB: '🧗攀岩' };
const guideCategoryLabels: Record<string, string> = { FOOD: '🍜美食', STAY: '🏨住宿', TRANSPORT: '🚗交通', TICKET: '🎫门票', TIPS: '💡攻略' };
const budgetLabels: Record<string, string> = { BUDGET: '💰穷游', MID: '💳中等', LUXURY: '💎高端' };

interface PostCardProps {
  post: Post;
  onLikeChange?: (isLiked: boolean, likeCount: number) => void;
}

export function PostCard({ post, onLikeChange }: PostCardProps) {
  const { user: currentUser } = useAuthStore();
  const removePost = usePostStore((s) => s.removePost);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showShare, setShowShare] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = currentUser?.id === post.author.id;

  // 浏览量计数：帖子卡片进入视口时计数一次
  const cardRef = useRef<HTMLDivElement>(null);
  const viewCountedRef = useRef(false);
  useEffect(() => {
    const el = cardRef.current;
    if (!el || viewCountedRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !viewCountedRef.current) {
          viewCountedRef.current = true;
          incrementViewCount(post.id).catch(() => {});
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [post.id]);

  // 如果帖子作者是当前用户，使用 authStore 中的最新头像
  const authorAvatarUrl = currentUser && post.author.username === currentUser.username
    ? currentUser.avatarUrl
    : post.author.avatarUrl;

  const likeAnimRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [likeAnimation, setLikeAnimation] = useState(false);

  const handleLike = async () => {
    if (!currentUser) {
      toast.error('请先登录');
      return;
    }
    const wasLiked = isLiked;
    const prevCount = likeCount;
    // 乐观更新
    setIsLiked(!wasLiked);
    setLikeCount(wasLiked ? prevCount - 1 : prevCount + 1);
    // 触发动画
    setLikeAnimation(true);
    if (likeAnimRef.current) clearTimeout(likeAnimRef.current);
    likeAnimRef.current = setTimeout(() => setLikeAnimation(false), 400);
    try {
      if (wasLiked) {
        await unlikePost(post.id);
      } else {
        await likePost(post.id);
      }
      onLikeChange?.(!wasLiked, wasLiked ? prevCount - 1 : prevCount + 1);
    } catch {
      setIsLiked(wasLiked);
      setLikeCount(prevCount);
      toast.error('操作失败，请重试');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    toast.success('链接已复制');
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await removePost(post.id);
      setShowDeleteConfirm(false);
      toast.success('已删除');
    } catch {
      toast.error('删除失败，请重试');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card ref={cardRef} className="overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      {/* 作者信息头 */}
      <div className="flex items-center gap-3 p-4">
        <Link href={`/profile/${post.author.username}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={authorAvatarUrl} alt={post.author.displayName} />
            <AvatarFallback>{post.author.displayName[0]}</AvatarFallback>
          </Avatar>
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${post.author.username}`}
              className="truncate text-sm font-semibold hover:underline"
            >
              {post.author.displayName}
            </Link>
            {post.postType && post.postType !== 'NOTE' && postTypeConfig[post.postType] && (
              <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${postTypeConfig[post.postType].color}`}>
                {postTypeConfig[post.postType].icon}
                {postTypeConfig[post.postType].label}
              </span>
            )}
            {post.vrMetadata && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {typeof post.vrMetadata.device === 'string' ? post.vrMetadata.device : 'VR'}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{formatRelativeTime(post.createdAt)}</span>
            {post.visibility === 'PUBLIC' && (
              <>
                <span>·</span>
                <Globe className="h-3 w-3" />
              </>
            )}
            {post.location && (
              <>
                <span>·</span>
                <MapPin className="h-3 w-3" />
                <span className="truncate">{post.location.name}</span>
              </>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwner ? (
              <>
                <DropdownMenuItem onClick={() => setShowEdit(true)}>
                  <Pencil className="h-3.5 w-3.5 mr-2" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  删除
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Copy className="h-3.5 w-3.5 mr-2" />
                  复制链接
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem>
                  <Bookmark className="h-3.5 w-3.5 mr-2" />
                  保存
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Copy className="h-3.5 w-3.5 mr-2" />
                  复制链接
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <AlertTriangle className="h-3.5 w-3.5 mr-2" />
                  举报
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 文字内容 */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {post.content}
          </p>
        </div>
      )}

      {/* 标签和话题 */}
      {((post.tags && post.tags.length > 0) || (post.topics && post.topics.length > 0)) && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-2">
          {post.tags?.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted/80 cursor-pointer"
            >
              {tag.icon} {tag.name}
            </span>
          ))}
          {post.topics?.map((topic) => (
            <Link
              key={topic.id}
              href={`/topics/${topic.id}`}
              className="inline-flex items-center rounded-full bg-primary/5 px-2 py-0.5 text-xs text-primary hover:bg-primary/10"
            >
              #{topic.name}
            </Link>
          ))}
        </div>
      )}

      {/* 路线详情 */}
      {post.postType === 'ROUTE' && post.routeDetail && (
        <div className="mx-4 mb-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
          <div className="flex flex-wrap gap-3 text-xs">
            {post.routeDetail.distanceKm && (
              <div className="flex items-center gap-1">
                <Map className="h-3.5 w-3.5 text-emerald-500" />
                <span className="font-medium">{post.routeDetail.distanceKm} km</span>
              </div>
            )}
            {post.routeDetail.durationMinutes && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-emerald-500" />
                <span className="font-medium">{post.routeDetail.durationMinutes >= 60 ? `${Math.floor(post.routeDetail.durationMinutes / 60)}h${post.routeDetail.durationMinutes % 60}m` : `${post.routeDetail.durationMinutes}分钟`}</span>
              </div>
            )}
            {post.routeDetail.elevationGainM && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                <span className="font-medium">+{post.routeDetail.elevationGainM}m</span>
              </div>
            )}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${difficultyColors[post.routeDetail.difficulty]}`}>
              {difficultyLabels[post.routeDetail.difficulty]}
            </span>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-600">
              {routeTypeLabels[post.routeDetail.routeType]}
            </span>
          </div>
        </div>
      )}

      {/* 旅程详情 */}
      {post.postType === 'JOURNEY' && post.journey && (
        <div className="mx-4 mb-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Compass className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium">{post.journey.title}</span>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {post.journey.destination && <span>📍 {post.journey.destination}</span>}
            {post.journey.startDate && <span>📅 {post.journey.startDate}{post.journey.endDate ? ` ~ ${post.journey.endDate}` : ''}</span>}
            {post.journey.stopCount > 0 && <span>📌 {post.journey.stopCount} 站</span>}
          </div>
        </div>
      )}

      {/* 攻略详情 */}
      {post.postType === 'GUIDE' && post.guideDetail && (
        <div className="mx-4 mb-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-blue-500/10 text-blue-600">
              {guideCategoryLabels[post.guideDetail.category]}
            </span>
            {post.guideDetail.destination && (
              <span className="text-muted-foreground">📍 {post.guideDetail.destination}</span>
            )}
            {post.guideDetail.bestSeason && (
              <span className="text-muted-foreground">🗓️ {post.guideDetail.bestSeason}</span>
            )}
            <span className="text-muted-foreground">{budgetLabels[post.guideDetail.budgetLevel]}</span>
          </div>
        </div>
      )}

      {/* 媒体内容 */}
      {post.mediaItems.length > 0 && (
        <MediaViewer items={post.mediaItems} />
      )}

      {/* 互动数据行 */}
      <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Heart className="h-3.5 w-3.5 text-accent" />
          <span>{likeCount}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{commentCount} 条评论</span>
          <span>{post.viewCount} 次浏览</span>
        </div>
      </div>

      {/* 互动按钮行 */}
      <div className="flex border-t px-2 py-1">
        <Button
          variant="ghost"
          className={cn(
            'flex-1 gap-2 text-sm text-muted-foreground hover:bg-accent/10',
            isLiked && 'text-accent hover:text-accent'
          )}
          onClick={handleLike}
        >
          <Heart className={cn('h-4 w-4 transition-colors', isLiked && 'fill-current text-accent', likeAnimation && 'animate-[heartBeat_0.4s_ease-in-out]')} />
          赞
        </Button>
        <Link href={`/post/${post.id}`} className="flex-1">
          <Button variant="ghost" className="w-full gap-2 text-sm text-muted-foreground hover:bg-primary/10">
            <MessageCircle className="h-4 w-4" />
            评论
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="flex-1 gap-2 text-sm text-muted-foreground hover:bg-teal-50 dark:hover:bg-teal-900/20"
          onClick={() => setShowShare(true)}
        >
          <Share2 className="h-4 w-4" />
          分享
        </Button>
      </div>

      {/* 分享面板 */}
      <ShareSheet open={showShare} onOpenChange={setShowShare} post={post} />

      {/* 编辑弹窗 */}
      {showEdit && (
        <EditPostDialog
          post={post}
          open={showEdit}
          onOpenChange={setShowEdit}
        />
      )}

      {/* 删除确认弹窗 */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>删除内容</DialogTitle>
            <DialogDescription>确定要删除这条内容吗？删除后无法恢复。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? '删除中...' : '删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays < 7) return `${diffDays} 天前`;
  return date.toLocaleDateString('zh-CN');
}
