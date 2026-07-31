'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Users, Loader2, Check, XIcon, Search, Trash2, ImageIcon, Mic, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth-store';
import { useChatStore } from '@/stores/chat-store';
import { connectChat } from '@/lib/chat-socket';
import apiClient from '@/lib/api-client';
import { AuthGuard } from '@/components/auth-guard';

export default function MessagesPage() {
  return <AuthGuard><MessagesContent /></AuthGuard>;
}

function MessagesContent() {
  const { user } = useAuthStore();
  const setTotalUnread = useChatStore((s) => s.setTotalUnread);
  const [conversations, setConversations] = useState<any[]>([]);
  const [requestConversations, setRequestConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'NORMAL' | 'REQUEST'>('NORMAL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { setMounted(true); }, []);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const [normalRes, requestRes] = await Promise.all([
        apiClient.get('/conversations?status=NORMAL'),
        apiClient.get('/conversations?status=REQUEST'),
      ]);
      if (normalRes.data?.success) {
        const convs = normalRes.data.data || [];
        setConversations(convs);
        const total = convs.reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0);
        setTotalUnread(total);
      }
      if (requestRes.data?.success) {
        setRequestConversations(requestRes.data.data || []);
      }
    } catch {} finally {
      setIsLoading(false);
    }
  }, [user, setTotalUnread]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    if (!user) return;
    const socket = connectChat(user.id);
    socket.on('chat:message:new', () => loadConversations());
    return () => { socket.off('chat:message:new'); };
  }, [user, loadConversations]);

  const handleAcceptRequest = async (convId: string) => {
    try {
      await apiClient.post(`/conversations/${convId}/accept`);
      const accepted = requestConversations.find(c => c.id === convId);
      if (accepted) {
        setConversations(prev => [accepted, ...prev]);
      }
      setRequestConversations(prev => prev.filter(c => c.id !== convId));
    } catch {}
  };

  const handleRejectRequest = async (convId: string) => {
    try {
      await apiClient.post(`/conversations/${convId}/reject`);
      setRequestConversations(prev => prev.filter(c => c.id !== convId));
    } catch {}
  };

  const handleDeleteConv = (convId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('删除此会话？')) return;
    setConversations(prev => prev.filter(c => c.id !== convId));
    setRequestConversations(prev => prev.filter(c => c.id !== convId));
  };

  const filteredConvs = searchQuery
    ? conversations.filter(c => {
        const other = c.members?.[0];
        const name = c.type === 'GROUP' ? (c.title || '') : (other?.displayName || '');
        const lastMsg = c.lastMessage?.content || '';
        return name.includes(searchQuery) || lastMsg.includes(searchQuery);
      })
    : conversations;

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '刚刚';
    if (mins < 60) return `${mins}分钟前`;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}小时前`;
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
    }
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric' });
  };

  const renderLastMsg = (conv: any) => {
    const msg = conv.lastMessage;
    if (!msg) return '暂无消息';
    if (msg.mediaType === 'IMAGE') return <span className="flex items-center gap-1"><ImageIcon className="h-3 w-3" />图片</span>;
    if (msg.mediaType === 'AUDIO') return <span className="flex items-center gap-1"><Mic className="h-3 w-3" />语音</span>;
    if (msg.mediaType === 'CARD') return <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />分享卡片</span>;
    return msg.content || '';
  };

  if (!mounted || !user) {
    return <div className="flex items-center justify-center py-12"><p className="text-muted-foreground">{mounted ? '请先登录' : ''}</p></div>;
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="shrink-0 space-y-3">
        <h1 className="text-xl font-bold">消息</h1>

        {/* 标签切换 */}
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <button
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'NORMAL' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('NORMAL')}
          >
            私信
          </button>
          <button
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'REQUEST' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('REQUEST')}
          >
            陌生人消息
            {requestConversations.length > 0 && (
              <Badge className="ml-2 h-5 min-w-5 bg-orange-500 px-1.5 text-xs">{requestConversations.length}</Badge>
            )}
          </button>
        </div>

        {/* 搜索框 */}
        {activeTab === 'NORMAL' && conversations.length > 3 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索消息..."
              className="h-9 pl-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* 会话列表 */}
      <div className="mt-3 flex-1 overflow-y-auto rounded-lg border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : activeTab === 'NORMAL' ? (
          filteredConvs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {searchQuery ? '没有匹配的会话' : '暂无私信'}
            </div>
          ) : (
            <div>
              {filteredConvs.map((conv: any, idx: number) => {
                const other = conv.type === 'GROUP' ? null : conv.members?.[0];
                return (
                  <div key={conv.id}>
                    {idx > 0 && <Separator />}
                    <Link href={`/messages/${conv.id}`} className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50">
                      <div className="relative shrink-0">
                        {conv.type === 'GROUP' ? (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                        ) : (
                          <>
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={other?.avatarUrl} alt={other?.displayName} />
                              <AvatarFallback>{other?.displayName?.[0]}</AvatarFallback>
                            </Avatar>
                            <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${other?.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                          </>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold truncate">
                            {conv.type === 'GROUP' ? conv.title : other?.displayName}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-xs text-muted-foreground">{formatTime(conv.lastMessage?.createdAt)}</span>
                            {conv.unreadCount > 0 && (
                              <Badge className="h-5 min-w-5 bg-primary px-1.5 text-xs">{conv.unreadCount}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="truncate text-sm text-muted-foreground">{renderLastMsg(conv)}</p>
                          <button
                            onClick={(e) => handleDeleteConv(conv.id, e)}
                            className="opacity-0 group-hover:opacity-100 ml-2 rounded p-1 text-muted-foreground hover:text-destructive transition-opacity"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          requestConversations.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">暂无陌生人消息</div>
          ) : (
            <div>
              {requestConversations.map((conv: any, idx: number) => {
                const other = conv.type === 'GROUP' ? null : conv.members?.[0];
                return (
                  <div key={conv.id}>
                    {idx > 0 && <Separator />}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={other?.avatarUrl} alt={other?.displayName} />
                        <AvatarFallback>{other?.displayName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">{other?.displayName}</span>
                          <span className="text-xs text-muted-foreground">{formatTime(conv.lastMessage?.createdAt)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">发来一条消息</p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => handleAcceptRequest(conv.id)} title="接受">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => handleRejectRequest(conv.id)} title="拒绝">
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
