'use client';

import { useState } from 'react';
import { Link2, MessageCircle, Share, Copy, ExternalLink, Check } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
  const shareTitle = post.content?.slice(0, 50) || '分享内容';
  const shareText = post.content?.slice(0, 100) || '';

  const shareContent: ContentCardData = {
    type: 'POST',
    id: post.id,
    title: shareTitle,
    description: shareText,
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
  };

  const handleSystemShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
      } catch {
        // 用户取消分享
      }
    } else {
      handleCopyLink();
    }
  };

  const handleShareToMessage = () => {
    onOpenChange(false);
    setTimeout(() => setShowMessageShare(true), 200);
  };

  const shareOptions = [
    {
      icon: copied ? <Check className="h-6 w-6" /> : <Copy className="h-6 w-6" />,
      label: copied ? '已复制' : '复制链接',
      onClick: handleCopyLink,
      color: copied ? 'text-green-500' : 'text-muted-foreground',
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      label: '发给好友',
      onClick: handleShareToMessage,
      color: 'text-blue-500',
    },
    {
      icon: <Share className="h-6 w-6" />,
      label: '系统分享',
      onClick: handleSystemShare,
      color: 'text-green-600',
    },
    {
      icon: <ExternalLink className="h-6 w-6" />,
      label: '复制短链',
      onClick: () => {
        navigator.clipboard.writeText(shareUrl);
        toast.success('链接已复制');
      },
      color: 'text-orange-500',
    },
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" showCloseButton={false} className="rounded-t-xl">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-center text-base">分享到</SheetTitle>
          </SheetHeader>

          {/* 分享选项网格 */}
          <div className="grid grid-cols-4 gap-4 px-4 pb-4 pt-2">
            {shareOptions.map((option) => (
              <button
                key={option.label}
                onClick={option.onClick}
                className="flex flex-col items-center gap-2 rounded-lg p-3 transition-colors hover:bg-muted"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-muted ${option.color}`}>
                  {option.icon}
                </div>
                <span className="text-xs text-foreground">{option.label}</span>
              </button>
            ))}
          </div>

          {/* 取消按钮 */}
          <div className="border-t px-4 py-3">
            <button
              onClick={() => onOpenChange(false)}
              className="w-full rounded-lg bg-muted py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
            >
              取消
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* 分享到私聊弹窗 */}
      {showMessageShare && (
        <ShareToMessage
          content={shareContent}
          onClose={() => setShowMessageShare(false)}
        />
      )}
    </>
  );
}
