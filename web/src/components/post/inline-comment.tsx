'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Send, Loader2, Trash2, ChevronRight, Reply, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth-store';
import { getComments, createComment, deleteComment, CommentData } from '@/lib/post-api';
import { toast } from 'sonner';

interface InlineCommentProps {
  postId: string;
  commentCount: number;
  onCountChange?: (delta: number) => void;
}

function formatShortTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 30) return `${diffDays}天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

export function InlineComment({ postId, commentCount, onCountChange }: InlineCommentProps) {
  const { user: currentUser } = useAuthStore();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<CommentData | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    getComments(postId, 1, 3).then((res) => {
      if (!cancelled) {
        setComments(res.data);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [postId]);

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
        setComments((prev) => [newComment, ...prev.slice(0, 2)]);
      }
      setContent('');
      setReplyTo(null);
      onCountChange?.(1);
    } catch {
      toast.error('评论失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (comment: CommentData) => {
    setReplyTo(comment);
    setContent('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      // 从列表中移除（包括从 replies 中移除）
      setComments((prev) => {
        const result: CommentData[] = [];
        for (const c of prev) {
          if (c.id === commentId) continue;
          const filteredReplies = c.replies?.filter((r) => r.id !== commentId);
          result.push({ ...c, replies: filteredReplies });
        }
        return result;
      });
      onCountChange?.(-1);
      toast.success('已删除');
    } catch {
      toast.error('删除失败');
    }
  };

  return (
    <div className="border-t bg-muted/30">
      {/* 输入框 */}
      {currentUser && (
        <div className="border-b px-4 py-2.5">
          {/* 回复指示器 */}
          {replyTo && (
            <div className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Reply className="h-3 w-3" />
              <span>回复</span>
              <span className="font-medium text-foreground">{replyTo.author.displayName}</span>
              <button onClick={() => setReplyTo(null)} className="ml-1 hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7 flex-shrink-0">
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.displayName} />
              <AvatarFallback className="text-[10px]">{currentUser.displayName[0]}</AvatarFallback>
            </Avatar>
            <input
              ref={inputRef}
              type="text"
              placeholder={replyTo ? `回复 ${replyTo.author.displayName}...` : '写评论...'}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
                if (e.key === 'Escape') {
                  setReplyTo(null);
                }
              }}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
            />
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || submitting}
              className="flex-shrink-0 text-primary disabled:text-muted-foreground/40"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}

      {/* 最近评论 */}
      {loading ? (
        <div className="flex justify-center py-3">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length > 0 ? (
        <div className="divide-y">
          {comments.map((comment) => (
            <div key={comment.id}>
              {/* 主评论 */}
              <div className="group flex gap-2.5 px-4 py-2.5">
                <Link href={`/profile/${comment.author.username}`} className="flex-shrink-0">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={comment.author.avatarUrl} alt={comment.author.displayName} />
                    <AvatarFallback className="text-[10px]">{comment.author.displayName[0]}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5">
                    <Link href={`/profile/${comment.author.username}`} className="text-xs font-medium hover:underline">
                      {comment.author.displayName}
                    </Link>
                    <span className="text-[10px] text-muted-foreground">{formatShortTime(comment.createdAt)}</span>
                    {currentUser?.id === comment.author.id && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="ml-auto text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">{comment.content}</p>
                  <button
                    onClick={() => handleReply(comment)}
                    className="mt-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    回复
                  </button>
                </div>
              </div>

              {/* 回复列表 */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-10 border-l-2 border-muted pl-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="group flex gap-2 py-2">
                      <Link href={`/profile/${reply.author.username}`} className="flex-shrink-0">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={reply.author.avatarUrl} alt={reply.author.displayName} />
                          <AvatarFallback className="text-[9px]">{reply.author.displayName[0]}</AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-1.5">
                          <Link href={`/profile/${reply.author.username}`} className="text-xs font-medium hover:underline">
                            {reply.author.displayName}
                          </Link>
                          <span className="text-[10px] text-muted-foreground">{formatShortTime(reply.createdAt)}</span>
                          {currentUser?.id === reply.author.id && (
                            <button
                              onClick={() => handleDelete(reply.id)}
                              className="ml-auto text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs leading-relaxed">{reply.content}</p>
                        <button
                          onClick={() => handleReply(comment)}
                          className="mt-0.5 text-[10px] text-muted-foreground hover:text-foreground"
                        >
                          回复
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        !currentUser && (
          <div className="py-3 text-center text-xs text-muted-foreground">还没有评论</div>
        )
      )}

      {/* 查看全部 */}
      {commentCount > 3 && (
        <Link
          href={`/post/${postId}`}
          onClick={() => {
            try {
              sessionStorage.setItem('feed-scroll-y', String(window.scrollY));
            } catch {}
          }}
          className="flex items-center justify-center gap-1 border-t px-4 py-2 text-xs text-primary hover:bg-muted/50"
        >
          查看全部 {commentCount} 条评论
          <ChevronRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}
