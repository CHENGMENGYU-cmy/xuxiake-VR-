import Link from 'next/link';
import { ArrowLeft, Send, Smile, Image } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockConversations, mockCurrentUser } from '@/lib/mock-data';

export default function ChatPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const conv = mockConversations[0];
  if (!conv) {
    return (
      <div className="py-12 text-center text-gray-400">会话不存在</div>
    );
  }

  const otherMember = conv.type === 'GROUP' ? null : conv.members[0];

  // 模拟消息列表
  const messages = [
    { id: '1', sender: otherMember, content: '你好！看了你拍的黄山VR视频，真的太震撼了！', time: '10:30', isMine: false },
    { id: '2', sender: mockCurrentUser, content: '谢谢！那天天气特别好，云海效果很棒', time: '10:32', isMine: true },
    { id: '3', sender: otherMember, content: '是用什么设备拍的？我也想去试试VR拍摄', time: '10:33', isMine: false },
    { id: '4', sender: mockCurrentUser, content: '用的是Apple Vision Pro，空间视频效果特别好。下次可以一起去拍！', time: '10:35', isMine: true },
    { id: '5', sender: otherMember, content: '太好了！我也刚买了Vision Pro，正愁找不到人一起玩VR摄影呢', time: '10:36', isMine: false },
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-lg border bg-white">
      {/* 聊天头部 */}
      <div className="flex items-center gap-3 border-b p-3">
        <Link href="/messages">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        {conv.type === 'GROUP' ? (
          <div>
            <p className="text-sm font-semibold">{conv.title}</p>
            <p className="text-xs text-gray-500">{conv.members.length} 人</p>
          </div>
        ) : (
          <Link href={`/profile/${otherMember?.username}`} className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={otherMember?.avatarUrl} alt={otherMember?.displayName} />
              <AvatarFallback>{otherMember?.displayName?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{otherMember?.displayName}</p>
              <p className="text-xs text-green-500">在线</p>
            </div>
          </Link>
        )}
      </div>

      {/* 消息列表 */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[70%] gap-2 ${msg.isMine ? 'flex-row-reverse' : 'flex-row'}`}>
              {!msg.isMine && (
                <Avatar className="h-7 w-7 flex-shrink-0">
                  <AvatarImage src={msg.sender?.avatarUrl} alt={msg.sender?.displayName} />
                  <AvatarFallback>{msg.sender?.displayName?.[0]}</AvatarFallback>
                </Avatar>
              )}
              <div>
                <div
                  className={`rounded-2xl px-4 py-2 text-sm ${
                    msg.isMine
                      ? 'rounded-tr-md bg-blue-600 text-white'
                      : 'rounded-tl-md bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
                <p className={`mt-0.5 text-[10px] text-gray-400 ${msg.isMine ? 'text-right' : 'text-left'}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 输入框 */}
      <div className="flex items-center gap-2 border-t p-3">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
          <Image className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
          <Smile className="h-4 w-4" />
        </Button>
        <Input
          placeholder="输入消息..."
          className="flex-1 rounded-full border-gray-200 bg-gray-100"
        />
        <Button size="icon" className="h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
