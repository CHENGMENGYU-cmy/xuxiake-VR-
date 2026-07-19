'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Users, FileText, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { PostCard } from '@/components/post/post-card';
import { mockUsers, mockPosts } from '@/lib/mock-data';
import { useSearchStore } from '@/stores/search-store';
import { searchTopics } from '@/lib/post-api';
import type { Topic } from '@/types';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-muted-foreground">加载中...</div>}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const { query, setQuery } = useSearchStore();
  const [searched, setSearched] = useState(!!query);
  const [topics, setTopics] = useState<Topic[]>([]);

  const filteredUsers = searched
    ? mockUsers.filter(
        (u) =>
          u.displayName.includes(query) ||
          u.username.includes(query) ||
          u.bio?.includes(query)
      )
    : [];

  const filteredPosts = searched
    ? mockPosts.filter((p) => {
        const matchesQuery = !query.trim() || p.content?.includes(query) || p.author.displayName.includes(query);
        return matchesQuery;
      })
    : [];

  useEffect(() => {
    if (!searched || !query.trim()) {
      setTopics([]);
      return;
    }
    searchTopics(query).then(setTopics).catch(() => {});
  }, [searched, query]);

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
            placeholder="搜索用户、内容、话题..."
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button type="submit">
          搜索
        </Button>
      </form>

      {/* 结果 */}
      {searched && (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start border-b bg-transparent p-0">
            <TabsTrigger value="all" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary">
              全部
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary">
              <Users className="mr-1 h-3.5 w-3.5" />
              用户 ({filteredUsers.length})
            </TabsTrigger>
            <TabsTrigger value="posts" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary">
              <FileText className="mr-1 h-3.5 w-3.5" />
              内容 ({filteredPosts.length})
            </TabsTrigger>
            <TabsTrigger value="topics" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary">
              <Hash className="mr-1 h-3.5 w-3.5" />
              话题 ({topics.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-4">
            {topics.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">话题</h3>
                <div className="flex flex-wrap gap-2">
                  {topics.slice(0, 6).map((topic) => (
                    <Link key={topic.id} href={`/topics/${topic.id}`}>
                      <Badge variant="secondary" className="cursor-pointer gap-1 hover:bg-primary/10">
                        {topic.icon || '#'} {topic.name}
                        <span className="text-[10px] text-muted-foreground">{topic.postCount}篇</span>
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {filteredUsers.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">用户</h3>
                <div className="rounded-lg border bg-card">
                  {filteredUsers.map((user, i) => (
                    <div key={user.id}>
                      {i > 0 && <Separator />}
                      <a
                        href={`/profile/${user.username}`}
                        className="flex items-center gap-3 p-3 hover:bg-muted/50"
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

            {filteredUsers.length === 0 && filteredPosts.length === 0 && topics.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                没有找到 &quot;{query}&quot; 相关的结果
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            {filteredUsers.length > 0 ? (
              <div className="rounded-lg border bg-card">
                {filteredUsers.map((user, i) => (
                  <div key={user.id}>
                    {i > 0 && <Separator />}
                    <a
                      href={`/profile/${user.username}`}
                      className="flex items-center gap-3 p-3 hover:bg-muted/50"
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

          <TabsContent value="topics" className="mt-4">
            {topics.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {topics.map((topic) => (
                  <Link key={topic.id} href={`/topics/${topic.id}`}>
                    <div className="rounded-lg border bg-card p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{topic.icon || '#'}</span>
                        <div>
                          <p className="font-medium">#{topic.name}</p>
                          <p className="text-xs text-muted-foreground">{topic.postCount} 篇内容</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">没有找到相关话题</div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {!searched && (
        <div className="py-16 text-center">
          <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">输入关键词搜索用户、内容和话题</p>
        </div>
      )}
    </div>
  );
}
