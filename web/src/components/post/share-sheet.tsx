'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Copy, MessageCircle, Share2, Check, X, Link2, QrCode } from 'lucide-react';
import { ShareToMessage } from '@/components/chat/share-to-message';
import { toast } from 'sonner';
import type { Post } from '@/types';
import type { ContentCardData } from '@/components/chat/content-card';

interface ShareSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post;
  anchorRef?: React.RefObject<HTMLDivElement | null>;
}

export function ShareSheet({ open, onOpenChange, post }: ShareSheetProps) {
  const [showMessageShare, setShowMessageShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/post/${post.id}`;
  const coverUrl = post.mediaItems?.[0]?.thumbnailUrl || post.mediaItems?.[0]?.url;

  const shareContent: ContentCardData = {
    type: 'POST',
    id: post.id,
    title: post.content?.slice(0, 50) || '笔记',
    description: post.content?.slice(0, 100),
    coverUrl,
    extra: { likes: post.likeCount, comments: post.commentCount },
    link: `/post/${post.id}`,
  };

  useEffect(() => {
    if (open) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onOpenChange]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('链接已复制');
      setTimeout(() => { setCopied(false); onOpenChange(false); }, 1500);
    } catch {
      toast.error('复制失败');
    }
  };

  const handleSystemShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.content?.slice(0, 50) || '分享',
          text: post.content?.slice(0, 100),
          url: shareUrl,
        });
      } catch { /* 用户取消 */ }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('链接已复制');
    }
    onOpenChange(false);
  };

  const handleShareToMessage = () => {
    onOpenChange(false);
    setTimeout(() => setShowMessageShare(true), 200);
  };

  if (!visible && !showMessageShare) return null;

  const isOpen = open;

  return (
    <>
      {/* 遮罩层 */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-colors duration-200 ${
          isOpen ? 'bg-black/40 backdrop-blur-sm' : 'bg-transparent pointer-events-none'
        }`}
        onClick={() => onOpenChange(false)}
      >
        {/* 弹窗 */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`relative mx-4 w-full max-w-sm overflow-hidden rounded-2xl bg-card shadow-2xl border transition-all duration-200 ${
            isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* 顶部预览区 */}
          <div className="bg-gradient-to-br from-muted/80 to-muted p-5">
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              {/* 缩略图 */}
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-background/50 shadow-sm">
                {coverUrl ? (
                  <img src={coverUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Link2 className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                )}
              </div>

              {/* 标题和作者 */}
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold line-clamp-2">
                  {post.content?.slice(0, 60) || '笔记'}
                </h3>
                {post.author && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {post.author.displayName}
                    {post.location?.name && ` · ${post.location.name}`}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 分享标题 */}
          <div className="px-5 pt-4 pb-2">
            <p className="text-sm font-medium">分享到</p>
          </div>

          {/* 分享选项 */}
          <div className="grid grid-cols-3 gap-3 px-5 pb-5">
            {/* 复制链接 */}
            <button
              onClick={handleCopyLink}
              className="flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-muted/80"
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                copied ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'
              }`}>
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </span>
              <span className="text-xs font-medium">{copied ? '已复制' : '复制链接'}</span>
            </button>

            {/* 发给好友 */}
            <button
              onClick={handleShareToMessage}
              className="flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-muted/80"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                <MessageCircle className="h-5 w-5" />
              </span>
              <span className="text-xs font-medium">发给好友</span>
            </button>

            {/* 系统分享 */}
            <button
              onClick={handleSystemShare}
              className="flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-muted/80"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Share2 className="h-5 w-5" />
              </span>
              <span className="text-xs font-medium">系统分享</span>
            </button>
          </div>

          {/* 链接预览 */}
          <div className="mx-5 mb-4 flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2">
            <Link2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="flex-1 truncate text-xs text-muted-foreground">{shareUrl}</span>
            <button
              onClick={handleCopyLink}
              className="shrink-0 rounded-md px-2 py-0.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              复制
            </button>
          </div>
        </div>
      </div>

      {/* ShareToMessage portal */}
      {showMessageShare && typeof document !== 'undefined' && createPortal(
        <ShareToMessage
          content={shareContent}
          onClose={() => setShowMessageShare(false)}
        />,
        document.body
      )}
    </>
  );
}
