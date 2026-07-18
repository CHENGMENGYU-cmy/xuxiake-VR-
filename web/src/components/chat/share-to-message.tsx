'use client';

import { useState, useEffect } from 'react';
import { X, Search, Loader2, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth-store';
import { getOrCreateDirectConversation } from '@/lib/social-api';
import apiClient from '@/lib/api-client';
import type { ContentCardData } from './content-card';

interface ShareToMessageProps {
  content: ContentCardData;
  onClose: () => void;
  onSent?: () => void;
}

export function ShareToMessage({ content, onClose, onSent }: ShareToMessageProps) {
  const { user } = useAuthStore();
  const [friends, setFriends] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    Promise.all([
      apiClient.get(`/users/${user.username}/followers`),
      apiClient.get(`/users/${user.username}/following`),
    ]).then(([followersRes, followingRes]) => {
      const followers = followersRes.data?.data || [];
      const followingIds = new Set((followingRes.data?.data || []).map((u: any) => u.id));
      const mutuals = followers.filter((u: any) => followingIds.has(u.id));
      setFriends(mutuals);
      setFiltered(mutuals);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(friends);
    } else {
      const q = search.toLowerCase();
      setFiltered(friends.filter((f: any) =>
        f.displayName?.toLowerCase().includes(q) || f.username?.toLowerCase().includes(q)
      ));
    }
  }, [search, friends]);

  const handleSend = async (friendId: string) => {
    if (sending) return;
    setSending(friendId);
    try {
      const conv = await getOrCreateDirectConversation(friendId);
      await apiClient.post(`/conversations/${conv.id}/messages`, {
        content: JSON.stringify({ __card: content }),
        mediaType: 'CARD',
      });
      setSent((prev) => new Set(prev).add(friendId));
    } catch { /* ignore */ } finally {
      setSending(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-base font-semibold">分享到消息</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 内容预览 */}
        <div className="border-b p-4">
          <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
            {content.coverUrl && (
              <img src={content.coverUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{content.title}</p>
              {content.description && (
                <p className="truncate text-xs text-muted-foreground">{content.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* 搜索 */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索好友..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* 好友列表 */}
        <div className="max-h-[300px] overflow-y-auto px-1">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">暂无互关好友</div>
          ) : (
            filtered.map((f: any) => (
              <div
                key={f.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/50"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={f.avatarUrl || undefined} alt={f.displayName} />
                  <AvatarFallback>{f.displayName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{f.displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">@{f.username}</p>
                </div>
                <Button
                  size="sm"
                  variant={sent.has(f.id) ? 'secondary' : 'default'}
                  disabled={sending === f.id || sent.has(f.id)}
                  onClick={() => handleSend(f.id)}
                >
                  {sending === f.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : sent.has(f.id) ? (
                    '已发送'
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
