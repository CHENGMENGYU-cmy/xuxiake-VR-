'use client';

import { useState, useRef, useEffect } from 'react';
import { Copy, MessageCircle, Share, Check } from 'lucide-react';
import { ShareToMessage } from '@/components/chat/share-to-message';
import { toast } from 'sonner';
import type { Post } from '@/types';
import type { ContentCardData } from '@/components/chat/content-card';

interface ShareSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post;
}

export function ShareSheet({ open, onOpenChange, post }: ShareSheetProps) {
  const [showMessageShare, setShowMessageShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/post/${post.id}`;

  const shareContent: ContentCardData = {
    type: 'POST',
    id: post.id,
    title: post.content?.slice(0, 50) || '笔记',
    description: post.content?.slice(0, 100),
    coverUrl: post.mediaItems?.[0]?.thumbnailUrl || post.mediaItems?.[0]?.url,
    extra: { likes: post.likeCount, comments: post.commentCount },
    link: `/post/${post.id}`,
  };

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onOpenChange]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('链接已复制');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('复制失败');
    }
    onOpenChange(false);
  };

  const handleSystemShare = async () => {
    onOpenChange(false);
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
  };

  const handleShareToMessage = () => {
    onOpenChange(false);
    setTimeout(() => setShowMessageShare(true), 150);
  };

  if (!open) return null;

  return (
    <>
      <div
        ref={menuRef}
        className="absolute bottom-full right-2 z-50 mb-1 w-36 overflow-hidden rounded-lg border bg-popover shadow-lg"
      >
        <button
          onClick={handleCopyLink}
          className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
          {copied ? '已复制' : '复制链接'}
        </button>
        <button
          onClick={handleShareToMessage}
          className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted"
        >
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
          发给好友
        </button>
        <button
          onClick={handleSystemShare}
          className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted"
        >
          <Share className="h-4 w-4 text-muted-foreground" />
          系统分享
        </button>
      </div>

      {showMessageShare && (
        <ShareToMessage
          content={shareContent}
          onClose={() => setShowMessageShare(false)}
        />
      )}
    </>
  );
}
