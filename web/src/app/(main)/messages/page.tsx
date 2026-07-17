'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, Users, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth-store';
import apiClient from '@/lib/api-client';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        const res = await apiClient.get('/conversations');
        if (res.data.success) {
          setConversations(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  if (!mounted || !user) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{mounted ? '请先登录' : ''}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">消息</h1>
      </div>

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
              const otherMember = conv.type === 'GROUP'
                ? null
                : conv.members?.[0];
              return (
                <div key={conv.id}>
                  {idx > 0 && <Separator />}
                  <Link
                    href={`/messages/${conv.id}`}
                    className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/50"
                  >
                    {/* 头像 */}
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

                    {/* 信息 */}
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
