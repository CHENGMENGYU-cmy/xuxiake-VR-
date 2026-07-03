import Link from 'next/link';
import { MessageCircle, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { mockConversations } from '@/lib/mock-data';
import { mockCurrentUser } from '@/lib/mock-data';

export default function MessagesPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-6 w-6 text-blue-600" />
        <h1 className="text-xl font-bold">消息</h1>
      </div>

      <div className="rounded-lg border bg-white">
        {mockConversations.length === 0 ? (
          <div className="py-12 text-center text-gray-400">暂无消息</div>
        ) : (
          <div>
            {mockConversations.map((conv, idx) => {
              const otherMember = conv.type === 'GROUP'
                ? null
                : conv.members[0];
              return (
                <div key={conv.id}>
                  {idx > 0 && <Separator />}
                  <Link
                    href={`/messages/${conv.id}`}
                    className="flex items-center gap-3 p-4 transition-colors hover:bg-gray-50"
                  >
                    {/* 头像 */}
                    {conv.type === 'GROUP' ? (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        <Users className="h-6 w-6 text-blue-500" />
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
                        <span className="text-xs text-gray-400">{conv.updatedAt}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm text-gray-500">
                          {conv.lastMessage?.content || '暂无消息'}
                        </p>
                        {conv.unreadCount > 0 && (
                          <Badge className="ml-2 h-5 min-w-5 bg-blue-600 px-1.5 text-xs">
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
