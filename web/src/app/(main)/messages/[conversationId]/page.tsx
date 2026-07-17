'use client';

import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth-store';
import apiClient from '@/lib/api-client';

interface Msg {
  id: string;
  content: string | null;
  createdAt: string;
  sender: { id: string; username: string; displayName: string; avatarUrl: string | null } | null;
}

export default function ChatPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = use(params);
  const { user: currentUser } = useAuthStore();
  const router = useRouter();

  const [messages, setMessages] = useState<Msg[]>([]);
  const [otherUser, setOtherUser] = useState<{ id: string; username: string; displayName: string; avatarUrl: string | null } | null>(null);
  const [convType, setConvType] = useState<'DIRECT' | 'GROUP'>('DIRECT');
  const [convTitle, setConvTitle] = useState('');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [myStatus, setMyStatus] = useState<'NORMAL' | 'REQUEST' | 'HIDDEN'>('NORMAL');
  const bottomRef = useRef<HTMLDivElement>(null);

  // 获取会话信息
  useEffect(() => {
    apiClient.get('/conversations').then((res) => {
      if (res.data?.success) {
        const conv = res.data.data.find((c: any) => c.id === conversationId);
        if (conv) {
          setConvType(conv.type);
          setConvTitle(conv.title || '');
          setMyStatus(conv.myStatus || 'NORMAL');
          if (conv.type === 'DIRECT' && conv.members?.length > 0) {
            setOtherUser(conv.members[0]);
          }
        }
      }
    }).catch(() => {});
  }, [conversationId]);

  const handleAcceptRequest = async () => {
    try {
      await apiClient.post(`/conversations/${conversationId}/accept`);
      setMyStatus('NORMAL');
    } catch {
      // ignore
    }
  };

  const handleRejectRequest = async () => {
    try {
      await apiClient.post(`/conversations/${conversationId}/reject`);
      router.push('/messages');
    } catch {
      // ignore
    }
  };

  // 获取消息
  useEffect(() => {
    apiClient.get(`/conversations/${conversationId}/messages?limit=100`)
      .then((res) => {
        if (res.data?.success) {
          setMessages(res.data.data || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [conversationId]);

  // 滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput('');

    try {
      const res = await apiClient.post(`/conversations/${conversationId}/messages`, { content: text });
      if (res.data?.success) {
        setMessages((prev) => [...prev, res.data.data]);
      }
    } catch {
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-lg border bg-card">
      {/* 头部 */}
      <div className="flex items-center gap-3 border-b p-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        {convType === 'GROUP' ? (
          <div>
            <p className="text-sm font-semibold">{convTitle}</p>
          </div>
        ) : otherUser ? (
          <Link href={`/profile/${otherUser.username}`} className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={otherUser.avatarUrl || undefined} alt={otherUser.displayName} />
              <AvatarFallback>{otherUser.displayName?.[0]}</AvatarFallback>
            </Avatar>
            <p className="text-sm font-semibold">{otherUser.displayName}</p>
          </Link>
        ) : null}
      </div>

      {/* 消息请求提示 */}
      {myStatus === 'REQUEST' && (
        <div className="flex items-center justify-between border-b bg-orange-50 px-4 py-3 dark:bg-orange-950/30">
          <p className="text-sm text-orange-700 dark:text-orange-300">
            这是来自陌生人的消息请求
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAcceptRequest}>
              接受
            </Button>
            <Button size="sm" variant="outline" onClick={handleRejectRequest}>
              拒绝
            </Button>
          </div>
        </div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((msg) => {
          const isMine = msg.sender?.id === currentUser?.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[70%] gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isMine && (
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={msg.sender?.avatarUrl || undefined} alt={msg.sender?.displayName} />
                    <AvatarFallback>{msg.sender?.displayName?.[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <div
                    className={`rounded-2xl px-4 py-2 text-sm ${
                      isMine
                        ? 'rounded-tr-md bg-primary text-primary-foreground'
                        : 'rounded-tl-md bg-muted text-foreground'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <p className={`mt-0.5 text-[10px] text-muted-foreground ${isMine ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* 输入框 */}
      <div className="flex items-center gap-2 border-t p-3">
        <Input
          placeholder="输入消息..."
          className="flex-1 rounded-full bg-muted"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
        />
        <Button
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={handleSend}
          disabled={!input.trim() || sending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
