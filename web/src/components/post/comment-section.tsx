'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Send, Loader2, Trash2, Reply, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/stores/auth-store';
import { getComments, createComment, deleteComment, CommentData } from '@/lib/post-api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CommentSectionProps {
  postId: string;
  initialCount: number;
  onCountChange?: (delta: number) => void;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return date.toLocaleDateString('zh-CN');
}

function CommentItem({
  comment,
  onReply,
  onDelete,
  currentUserId,
  depth = 0,
}: {
  comment: CommentData;
  onReply: (comment: CommentData) => void;
  onDelete: (commentId: string) => void;
  currentUserId?: string;
  depth?: number;
}) {
  return (
    <div className={cn('flex gap-3 py-3', depth > 0 && 'ml-10 border-l-2 border-muted pl-4')}>
      <Link href={`/profile/${comment.author.username}`}>
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.author.avatarUrl} alt={comment.author.displayName} />
          <AvatarFallback className="text-xs">{comment.author.displayName[0]}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link href={`/profile/${comment.author.username}`} className="text-sm font-medium hover:underline">
            {comment.author.displayName}
          </Link>
          <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.createdAt)}</span>
        </div>
        <p className="mt-1 text-sm leading-relaxed">{comment.content}</p>
        <div className="mt-1.5 flex gap-3">
          <button
            onClick={() => onReply(comment)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Reply className="h-3 w-3" />
            回复
          </button>
          {currentUserId === comment.author.id && (
            <button
              onClick={() => onDelete(comment.id)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
              删除
            </button>
          )}
        </div>
        {/* 嵌套回复 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 space-y-0">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onReply={onReply}
                onDelete={onDelete}
                currentUserId={currentUserId}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CommentSection({ postId, initialCount, onCountChange }: CommentSectionProps) {
  const { user: currentUser } = useAuthStore();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(initialCount);
  const [loadingMore, setLoadingMore] = useState(false);
  const [replyTo, setReplyTo] = useState<CommentData | null>(null);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 加载评论
  useEffect(() => {
    let cancelled = false;
    getComments(postId, 1).then((res) => {
      if (!cancelled) {
        setComments(res.data);
        setHasMore(res.hasMore);
        setTotal(res.total);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [postId]);

  // 加载更多
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await getComments(postId, nextPage);
      setComments((prev) => [...prev, ...res.data]);
      setHasMore(res.hasMore);
      setPage(nextPage);
    } catch {
      toast.error('加载失败');
    } finally {
      setLoadingMore(false);
    }
  };

  // 提交评论
  const handleSubmit = async () => {
    if (!content.trim() || submitting || !currentUser) return;
    setSubmitting(true);
    try {
      const newComment = await createComment(postId, content.trim(), replyTo?.id);
      if (replyTo) {
        // 回复：添加到父评论的 replies 中
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyTo.id
              ? { ...c, replies: [...(c.replies || []), newComment] }
              : c
          )
        );
      } else {
        // 新评论：添加到顶部
        setComments((prev) => [newComment, ...prev]);
      }
      setContent('');
      setReplyTo(null);
      setTotal((prev) => prev + 1);
      onCountChange?.(1);
    } catch {
      toast.error('评论失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 删除评论
  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      // 计算被删除的评论数（含子评论）
      let removedCount = 1;
      const countReplies = (c: CommentData): number => {
        let count = 0;
        if (c.replies) {
          for (const r of c.replies) {
            count += 1 + countReplies(r);
          }
        }
        return count;
      };
      // 从列表中移除
      setComments((prev) => {
        const updated: CommentData[] = [];
        for (const c of prev) {
          if (c.id === commentId) {
            removedCount += countReplies(c);
          } else {
            // 也从子回复中移除
            const filteredReplies = c.replies?.filter((r) => r.id !== commentId);
            if (filteredReplies && filteredReplies.length !== c.replies?.length) {
              removedCount += 1;
            }
            updated.push({ ...c, replies: filteredReplies });
          }
        }
        return updated;
      });
      setTotal((prev) => Math.max(0, prev - removedCount));
      onCountChange?.(-removedCount);
      toast.success('已删除');
    } catch {
      toast.error('删除失败');
    }
  };

  // 回复某条评论
  const handleReply = (comment: CommentData) => {
    setReplyTo(comment);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="rounded-lg border bg-card">
      {/* 标题 */}
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-semibold">评论 ({total})</h3>
      </div>

      {/* 评论输入框 */}
      {currentUser && (
        <div className="border-b p-4">
          {replyTo && (
            <div className="mb-2 flex items-center gap-2 rounded bg-muted/50 px-3 py-1.5 text-xs">
              <span className="text-muted-foreground">回复</span>
              <span className="font-medium">{replyTo.author.displayName}</span>
              <button
                onClick={() => setReplyTo(null)}
                className="ml-auto text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <Textarea
              ref={inputRef}
              placeholder={replyTo ? `回复 ${replyTo.author.displayName}...` : '写下你的评论...'}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              rows={1}
              className="min-h-[36px] flex-1 resize-none text-sm"
            />
            <Button
              size="sm"
              disabled={!content.trim() || submitting}
              onClick={handleSubmit}
              className="flex-shrink-0"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* 评论列表 */}
      <div className="divide-y px-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length > 0 ? (
          <>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                onDelete={handleDelete}
                currentUserId={currentUser?.id}
              />
            ))}
            {hasMore && (
              <div className="py-3 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="text-xs text-muted-foreground"
                >
                  {loadingMore ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <ChevronDown className="mr-1 h-3 w-3" />
                  )}
                  加载更多评论
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            还没有评论，快来发表第一条吧
          </div>
        )}
      </div>
    </div>
  );
}
