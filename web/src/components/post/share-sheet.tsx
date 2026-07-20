'use client';

import { useState } from 'react';
import { Copy, MessageCircle, Share, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

  return (
    <>
      <DropdownMenu open={open} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          <span />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={handleCopyLink}>
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            {copied ? '已复制' : '复制链接'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShareToMessage}>
            <MessageCircle className="h-4 w-4" />
            发给好友
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSystemShare}>
            <Share className="h-4 w-4" />
            系统分享
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showMessageShare && (
        <ShareToMessage
          content={shareContent}
          onClose={() => setShowMessageShare(false)}
        />
      )}
    </>
  );
}
