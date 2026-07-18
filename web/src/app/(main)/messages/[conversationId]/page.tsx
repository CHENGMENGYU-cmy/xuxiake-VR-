'use client';

import { useState, useEffect, useRef, use, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, ImagePlus, SmilePlus, Mic, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth-store';
import { MessageReactions } from '@/components/chat/message-reactions';
import { ContentCard, type ContentCardData } from '@/components/chat/content-card';
import { VoiceRecorder } from '@/components/chat/voice-recorder';
import { VoiceMessage } from '@/components/chat/voice-message';
import { LocationPicker } from '@/components/chat/location-picker';
import { LocationMessage } from '@/components/chat/location-message';
import { connectChat } from '@/lib/chat-socket';
import apiClient from '@/lib/api-client';
import type { Socket } from 'socket.io-client';

interface Msg {
  id: string;
  conversationId: string;
  content: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
  createdAt: string;
  sender: { id: string; username: string; displayName: string; avatarUrl: string | null } | null;
}

interface ReactionGroup {
  emoji: string;
  count: number;
  users: { id: string; displayName: string }[];
}

const QUICK_EMOJIS = ['❤️', '😂', '😮', '😢', '🔥', '👏'];

export default function ChatPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = use(params);
  const { user: currentUser } = useAuthStore();
  const router = useRouter();

  const [messages, setMessages] = useState<Msg[]>([]);
  const [reactions, setReactions] = useState<Record<string, ReactionGroup[]>>({});
  const [otherUser, setOtherUser] = useState<{ id: string; username: string; displayName: string; avatarUrl: string | null } | null>(null);
  const [convType, setConvType] = useState<'DIRECT' | 'GROUP'>('DIRECT');
  const [convTitle, setConvTitle] = useState('');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [myStatus, setMyStatus] = useState<'NORMAL' | 'REQUEST' | 'HIDDEN'>('NORMAL');
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    } catch { /* ignore */ }
  };

  const handleRejectRequest = async () => {
    try {
      await apiClient.post(`/conversations/${conversationId}/reject`);
      router.push('/messages');
    } catch { /* ignore */ }
  };

  // 加载消息的反应数据
  const loadReactions = useCallback(async (msgIds: string[]) => {
    if (msgIds.length === 0) return;
    const newReactions: Record<string, ReactionGroup[]> = {};
    await Promise.all(
      msgIds.map(async (id) => {
        try {
          const res = await apiClient.get(`/conversations/messages/${id}/reactions`);
          if (res.data?.success && res.data.data.length > 0) {
            newReactions[id] = res.data.data;
          }
        } catch { /* ignore */ }
      })
    );
    setReactions((prev) => ({ ...prev, ...newReactions }));
  }, []);

  // 获取历史消息
  useEffect(() => {
    apiClient.get(`/conversations/${conversationId}/messages?limit=50`)
      .then((res) => {
        if (res.data?.success) {
          const msgs = res.data.data || [];
          setMessages(msgs);
          loadReactions(msgs.map((m: Msg) => m.id));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [conversationId, loadReactions]);

  // WebSocket连接
  useEffect(() => {
    if (!currentUser) return;

    const socket = connectChat(currentUser.id);
    socketRef.current = socket;

    const handleNewMessage = (msg: Msg) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => {
          const exists = prev.find((m) => m.id === msg.id);
          if (exists) return prev;
          return [...prev, msg];
        });
        socket.emit('chat:message:read', { conversationId });
      }
    };

    const handleTyping = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === conversationId && data.userId !== currentUser.id) {
        setTypingUser(data.userId);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => setTypingUser(null), 2000);
      }
    };

    socket.on('chat:message:new', handleNewMessage);
    socket.on('chat:typing', handleTyping);
    socket.emit('chat:message:read', { conversationId });

    return () => {
      socket.off('chat:message:new', handleNewMessage);
      socket.off('chat:typing', handleTyping);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [currentUser, conversationId]);

  // 滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (socketRef.current && currentUser) {
      socketRef.current.emit('chat:typing:start', { conversationId });
    }
  };

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending || !socketRef.current) return;
    setSending(true);
    socketRef.current.emit('chat:message:send', { conversationId, content: text });
    setInput('');
    setSending(false);
  }, [input, sending, conversationId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !socketRef.current) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const mediaUrl = res.data?.data?.url;
      if (mediaUrl) {
        socketRef.current.emit('chat:message:send', { conversationId, mediaUrl, mediaType: 'IMAGE' });
      }
    } catch { /* ignore */ } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 语音录制完成
  const handleVoiceRecorded = async (blob: Blob) => {
    if (!socketRef.current) return;
    setRecording(false);
    setUploading(true);
    try {
      const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const mediaUrl = res.data?.data?.url;
      if (mediaUrl) {
        socketRef.current.emit('chat:message:send', { conversationId, mediaUrl, mediaType: 'AUDIO' });
      }
    } catch { /* ignore */ } finally {
      setUploading(false);
    }
  };

  // 快速添加反应
  const handleQuickReaction = async (messageId: string, emoji: string) => {
    try {
      await apiClient.post(`/conversations/messages/${messageId}/reactions`, { emoji });
      loadReactions([messageId]);
    } catch { /* ignore */ }
    setShowReactionPicker(null);
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
          <p className="text-sm text-orange-700 dark:text-orange-300">这是来自陌生人的消息请求</p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAcceptRequest}>接受</Button>
            <Button size="sm" variant="outline" onClick={handleRejectRequest}>拒绝</Button>
          </div>
        </div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((msg) => {
          const isMine = msg.sender?.id === currentUser?.id;
          const msgReactions = reactions[msg.id] || [];
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[70%] gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isMine && (
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={msg.sender?.avatarUrl || undefined} alt={msg.sender?.displayName} />
                    <AvatarFallback>{msg.sender?.displayName?.[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className="group relative"
                  onMouseEnter={() => setHoveredMsg(msg.id)}
                  onMouseLeave={() => { setHoveredMsg(null); setShowReactionPicker(null); }}
                >
                  {/* 卡片消息 */}
                  {(() => {
                    // 解析卡片消息
                    let cardData: ContentCardData | null = null;
                    if (msg.mediaType === 'CARD' && msg.content) {
                      try {
                        const parsed = JSON.parse(msg.content);
                        if (parsed.__card) cardData = parsed.__card;
                      } catch { /* not a card message */ }
                    }

                    if (cardData) {
                      return (
                        <div className="rounded-2xl overflow-hidden">
                          <ContentCard data={cardData} isMine={isMine} />
                        </div>
                      );
                    }

                    return (
                      <div
                        className={`rounded-2xl px-4 py-2 text-sm ${
                          isMine
                            ? 'rounded-tr-md bg-primary text-primary-foreground'
                            : 'rounded-tl-md bg-muted text-foreground'
                        }`}
                      >
                        {msg.mediaUrl && msg.mediaType === 'AUDIO' ? (
                          <VoiceMessage url={msg.mediaUrl} isMine={isMine} />
                        ) : msg.mediaUrl && msg.mediaType === 'IMAGE' ? (
                          <img
                            src={msg.mediaUrl}
                            alt="图片消息"
                            className="max-w-[240px] rounded-lg cursor-pointer"
                            onClick={() => setPreviewImage(msg.mediaUrl!)}
                          />
                        ) : msg.mediaUrl && msg.mediaType === 'FILE' ? (
                          <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="underline">
                            查看文件
                          </a>
                        ) : (
                          msg.content
                        )}
                      </div>
                    );
                  })()}

                  {/* 悬停时显示的反应按钮 */}
                  {hoveredMsg === msg.id && (
                    <div className={`absolute top-0 ${isMine ? '-left-8' : '-right-8'} flex items-center`}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowReactionPicker(showReactionPicker === msg.id ? null : msg.id);
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted/80"
                      >
                        <SmilePlus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {/* 快速反应选择器 */}
                  {showReactionPicker === msg.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowReactionPicker(null)} />
                      <div
                        className={`absolute z-50 flex gap-1 rounded-full bg-card border p-1.5 shadow-lg ${
                          isMine ? 'right-0' : 'left-0'
                        }`}
                        style={{ bottom: '100%', marginBottom: '4px' }}
                      >
                        {QUICK_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleQuickReaction(msg.id, emoji)}
                            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* 反应显示 */}
                  {msgReactions.length > 0 && (
                    <MessageReactions
                      messageId={msg.id}
                      currentUserId={currentUser?.id || ''}
                      reactions={msgReactions}
                      onUpdate={() => loadReactions([msg.id])}
                      isMine={isMine}
                    />
                  )}

                  <p className={`mt-0.5 text-[10px] text-muted-foreground ${isMine ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* 正在输入指示 */}
        {typingUser && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex gap-0.5">
              <span className="animate-bounce" style={{ animationDelay: '0ms' }}>·</span>
              <span className="animate-bounce" style={{ animationDelay: '150ms' }}>·</span>
              <span className="animate-bounce" style={{ animationDelay: '300ms' }}>·</span>
            </span>
            对方正在输入...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 图片预览弹窗 */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setPreviewImage(null)}
        >
          <img src={previewImage} alt="预览" className="max-h-[90vh] max-w-[90vw] object-contain" />
        </div>
      )}

      {/* 输入框 */}
      <div className="border-t p-3">
        {recording ? (
          <VoiceRecorder
            onRecorded={handleVoiceRecorded}
            onCancel={() => setRecording(false)}
            disabled={uploading}
          />
        ) : (
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || myStatus === 'REQUEST'}
            >
              {uploading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              ) : (
                <ImagePlus className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>

            <Input
              placeholder={myStatus === 'REQUEST' ? '请先接受消息请求' : '输入消息...'}
              className="flex-1 rounded-full bg-muted"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={sending || myStatus === 'REQUEST'}
            />

            {input.trim() ? (
              <Button
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={handleSend}
                disabled={sending || myStatus === 'REQUEST'}
              >
                <Send className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => setRecording(true)}
                disabled={myStatus === 'REQUEST'}
              >
                <Mic className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
