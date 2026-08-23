'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Users, FileText, Hash, UsersRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { PostCard } from '@/components/post/post-card';
import { mockUsers, mockPosts } from '@/lib/mock-data';
import { useSearchStore } from '@/stores/search-store';
import { searchTopics } from '@/lib/post-api';
import { searchCommunities } from '@/lib/social-api';
import type { Topic, Community } from '@/types';

export default function SearchPage() {
  const { query, setQuery } = useSearchStore();
  const [inputValue, setInputValue] = useState(query);
  const [searched, setSearched] = useState(!!query);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);

  // 首次加载时，如果 store 中有 query 则自动搜索
  useEffect(() => {
    if (query) {
      setInputValue(query);
      setSearched(true);
    }
  }, [query]);

  useEffect(() => {
    if (!searched || !inputValue.trim()) {
      setTopics([]);
      setCommunities([]);
      return;
    }
    searchTopics(inputValue).then(setTopics).catch(() => {});
    searchCommunities(inputValue).then((res) => setCommunities(res.data || [])).catch(() => {});
  }, [searched, inputValue]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setQuery(inputValue.trim());
      setSearched(true);
    }
  };

  const filteredUsers = searched
    ? mockUsers.filter(
        (u) =>
          u.displayName.includes(inputValue) ||
          u.username.includes(inputValue) ||
          u.bio?.includes(inputValue)
      )
    : [];

  const filteredPosts = searched
    ? mockPosts.filter((p) =>
        p.content?.includes(inputValue) || p.author.displayName.includes(inputValue)
      )
    : [];

  return (
    <div className="space-y-4">
      {/* 搜索框 */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜索用户、内容、话题、社群..."
            className="pl-10"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
          />
        </div>
        <Button type="submit">搜索</Button>
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
            <TabsTrigger value="communities" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary">
              <UsersRound className="mr-1 h-3.5 w-3.5" />
              社群 ({communities.length})
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
                      <Link
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
                      </Link>
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

            {communities.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">社群</h3>
                <div className="rounded-lg border bg-card">
                  {communities.slice(0, 4).map((c, i) => (
                    <div key={c.id}>
                      {i > 0 && <Separator />}
                      <Link
                        href={`/communities/${c.id}`}
                        className="flex items-center gap-3 p-3 hover:bg-muted/50"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={c.avatarUrl || undefined} alt={c.name} />
                          <AvatarFallback>{c.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.memberCount} 成员</p>
                        </div>
                        {c.isMember && <Badge variant="secondary" className="text-xs">已加入</Badge>}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredUsers.length === 0 && filteredPosts.length === 0 && topics.length === 0 && communities.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                没有找到 &quot;{inputValue}&quot; 相关的结果
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            {filteredUsers.length > 0 ? (
              <div className="rounded-lg border bg-card">
                {filteredUsers.map((user, i) => (
                  <div key={user.id}>
                    {i > 0 && <Separator />}
                    <Link
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
                    </Link>
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

          <TabsContent value="communities" className="mt-4">
            {communities.length > 0 ? (
              <div className="rounded-lg border bg-card">
                {communities.map((c, i) => (
                  <div key={c.id}>
                    {i > 0 && <Separator />}
                    <Link
                      href={`/communities/${c.id}`}
                      className="flex items-center gap-3 p-3 hover:bg-muted/50"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={c.avatarUrl || undefined} alt={c.name} />
                        <AvatarFallback>{c.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.memberCount} 成员{c.locationName ? ` · ${c.locationName}` : ''}
                        </p>
                        {c.description && (
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{c.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {c.isMember && <Badge variant="secondary" className="text-xs">已加入</Badge>}
                        <Badge variant="outline" className="text-xs">
                          {c.isPublic ? '公开' : '私密'}
                        </Badge>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">没有找到相关社群</div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {!searched && (
        <div className="py-16 text-center">
          <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">输入关键词搜索用户、内容、话题和社群</p>
        </div>
      )}
    </div>
  );
}
