'use client';

import { useState } from 'react';
import { Search, Users, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { PostCard } from '@/components/post/post-card';
import { mockUsers, mockPosts } from '@/lib/mock-data';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);

  const filteredUsers = searched
    ? mockUsers.filter(
        (u) =>
          u.displayName.includes(query) ||
          u.username.includes(query) ||
          u.bio?.includes(query)
      )
    : [];

  const filteredPosts = searched
    ? mockPosts.filter(
        (p) =>
          p.content?.includes(query) ||
          p.author.displayName.includes(query)
      )
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) setSearched(true);
  };

  return (
    <div className="space-y-4">
      {/* 搜索框 */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜索用户、内容..."
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          搜索
        </Button>
      </form>

      {/* 结果 */}
      {searched && (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start border-b bg-transparent p-0">
            <TabsTrigger value="all" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600">
              全部
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600">
              <Users className="mr-1 h-3.5 w-3.5" />
              用户 ({filteredUsers.length})
            </TabsTrigger>
            <TabsTrigger value="posts" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600">
              <FileText className="mr-1 h-3.5 w-3.5" />
              内容 ({filteredPosts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-4">
            {filteredUsers.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">用户</h3>
                <div className="rounded-lg border bg-white">
                  {filteredUsers.map((user, i) => (
                    <div key={user.id}>
                      {i > 0 && <Separator />}
                      <a
                        href={`/profile/${user.username}`}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                          <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold">{user.displayName}</p>
                          <p className="text-xs text-muted-foreground">@{user.username}</p>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredPosts.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">内容</h3>
                <div className="space-y-4">
                  {filteredPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}

            {filteredUsers.length === 0 && filteredPosts.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                没有找到 &quot;{query}&quot; 相关的结果
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            {filteredUsers.length > 0 ? (
              <div className="rounded-lg border bg-white">
                {filteredUsers.map((user, i) => (
                  <div key={user.id}>
                    {i > 0 && <Separator />}
                    <a
                      href={`/profile/${user.username}`}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                        <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{user.bio}</p>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">没有找到相关用户</div>
            )}
          </TabsContent>

          <TabsContent value="posts" className="mt-4">
            {filteredPosts.length > 0 ? (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">没有找到相关内容</div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {!searched && (
        <div className="py-16 text-center">
          <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">输入关键词搜索徐霞客系统中的内容和用户</p>
        </div>
      )}
    </div>
  );
}
