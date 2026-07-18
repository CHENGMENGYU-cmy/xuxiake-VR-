'use client';

import { useState } from 'react';
import { SmilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api-client';

const QUICK_EMOJIS = ['❤️', '😂', '😮', '😢', '🔥', '👏'];

interface ReactionGroup {
  emoji: string;
  count: number;
  users: { id: string; displayName: string }[];
}

interface MessageReactionsProps {
  messageId: string;
  currentUserId: string;
  reactions: ReactionGroup[];
  onUpdate: () => void;
  isMine: boolean;
}

export function MessageReactions({
  messageId,
  currentUserId,
  reactions,
  onUpdate,
  isMine,
}: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleReaction = async (emoji: string) => {
    const existing = reactions.find((r) => r.emoji === emoji);
    const hasMyReaction = existing?.users.some((u) => u.id === currentUserId);

    try {
      if (hasMyReaction) {
        await apiClient.delete(`/conversations/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`);
      } else {
        await apiClient.post(`/conversations/messages/${messageId}/reactions`, { emoji });
      }
      onUpdate();
    } catch { /* ignore */ }
    setShowPicker(false);
  };

  if (reactions.length === 0 && !showPicker) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-1', isMine ? 'justify-end' : 'justify-start')}>
      {reactions.map((r) => {
        const hasMyReaction = r.users.some((u) => u.id === currentUserId);
        return (
          <button
            key={r.emoji}
            onClick={() => handleReaction(r.emoji)}
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors',
              hasMyReaction
                ? 'bg-primary/20 border border-primary/40'
                : 'bg-muted hover:bg-muted/80 border border-transparent'
            )}
            title={r.users.map((u) => u.displayName).join(', ')}
          >
            <span>{r.emoji}</span>
            {r.count > 1 && <span className="text-muted-foreground">{r.count}</span>}
          </button>
        );
      })}

      {/* 添加反应按钮 */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
        >
          <SmilePlus className="h-3.5 w-3.5" />
        </button>

        {/* 快速反应选择器 */}
        {showPicker && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
            <div
              className={cn(
                'absolute z-50 flex gap-1 rounded-full bg-card border p-1.5 shadow-lg',
                isMine ? 'right-0' : 'left-0'
              )}
              style={{ bottom: '100%', marginBottom: '4px' }}
            >
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
