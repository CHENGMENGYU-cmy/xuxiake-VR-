'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Loader2, X, Check, XIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth-store';
import apiClient from '@/lib/api-client';
import { getOrCreateDirectConversation } from '@/lib/social-api';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [requestConversations, setRequestConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [startingChat, setStartingChat] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'NORMAL' | 'REQUEST'>('NORMAL');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    Promise.all([
      apiClient.get('/conversations?status=NORMAL'),
      apiClient.get('/conversations?status=REQUEST'),
    ]).then(([normalRes, requestRes]) => {
      if (normalRes.data?.success) {
        setConversations(normalRes.data.data || []);
      }
      if (requestRes.data?.success) {
        setRequestConversations(requestRes.data.data || []);
      }
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, [user]);

  const loadFriends = async () => {
    if (!user || friends.length > 0) {
      setShowFriends(true);
      return;
    }
    setFriendsLoading(true);
    try {
      const [followersRes, followingRes] = await Promise.all([
        apiClient.get(`/users/${user.username}/followers`),
        apiClient.get(`/users/${user.username}/following`),
      ]);
      const followers = followersRes.data?.data || [];
      const followingIds = new Set((followingRes.data?.data || []).map((u: any) => u.id));
      setFriends(followers.filter((u: any) => followingIds.has(u.id)));
    } catch {
      // ignore
    } finally {
      setFriendsLoading(false);
      setShowFriends(true);
    }
  };

  const startChat = async (userId: string) => {
    if (startingChat) return;
    setStartingChat(userId);
    try {
      const conv = await getOrCreateDirectConversation(userId);
      router.push(`/messages/${conv.id}`);
    } catch {
      // ignore
    } finally {
      setStartingChat(null);
    }
  };

  const handleAcceptRequest = async (convId: string) => {
    try {
      await apiClient.post(`/conversations/${convId}/accept`);
      setRequestConversations((prev) => prev.filter((c) => c.id !== convId));
      const acceptedConv = requestConversations.find((c) => c.id === convId);
      if (acceptedConv) {
        setConversations((prev) => [acceptedConv, ...prev]);
      }
    } catch {
      // ignore
    }
  };

  const handleRejectRequest = async (convId: string) => {
    try {
      await apiClient.post(`/conversations/${convId}/reject`);
      setRequestConversations((prev) => prev.filter((c) => c.id !== convId));
    } catch {
      // ignore
    }
  };

  if (!mounted || !user) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{mounted ? '请先登录' : ''}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">消息</h1>
        <Button size="sm" onClick={loadFriends}>
          发起对话
        </Button>
      </div>

      {/* 好友选择弹层 */}
      {showFriends && (
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium">选择好友开始对话</p>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowFriends(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {friendsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : friends.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">暂无互关好友</p>
          ) : (
            <div className="space-y-1">
              {friends.map((f: any) => (
                <button
                  key={f.id}
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-accent disabled:opacity-50"
                  onClick={() => startChat(f.id)}
                  disabled={startingChat === f.id}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={f.avatarUrl || undefined} alt={f.displayName} />
                    <AvatarFallback>{f.displayName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{f.displayName}</p>
                    <p className="truncate text-xs text-muted-foreground">{f.bio || `@${f.username}`}</p>
                  </div>
                  {startingChat === f.id && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 会话列表 */}
      <div className="rounded-lg border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">暂无消息</div>
        ) : (
          <div>
            {conversations.map((conv: any, idx: number) => {
              const otherMember = conv.type === 'GROUP' ? null : conv.members?.[0];
              return (
                <div key={conv.id}>
                  {idx > 0 && <Separator />}
                  <Link
                    href={`/messages/${conv.id}`}
                    className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/50"
                  >
                    {conv.type === 'GROUP' ? (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                    ) : (
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={otherMember?.avatarUrl} alt={otherMember?.displayName} />
                        <AvatarFallback>{otherMember?.displayName?.[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">
                          {conv.type === 'GROUP' ? conv.title : otherMember?.displayName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {conv.lastMessage?.createdAt
                            ? new Date(conv.lastMessage.createdAt).toLocaleString('zh-CN', {
                                month: 'numeric',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                              })
                            : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm text-muted-foreground">
                          {conv.lastMessage?.content || '暂无消息'}
                        </p>
                        {conv.unreadCount > 0 && (
                          <Badge className="ml-2 h-5 min-w-5 bg-primary px-1.5 text-xs">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
