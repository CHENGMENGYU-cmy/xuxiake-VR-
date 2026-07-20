'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, Flame, MessageCircle, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import { getRecommendedCommunities, getRecommendedUsers } from '@/lib/social-api';
import { getHotTopics, getPosts } from '@/lib/post-api';
import type { Community, Topic, Post, RecommendedUser } from '@/types';

const HOT_TOPIC_PREVIEW_COUNT = 5;
const COMMUNITY_PICK_COUNT = 3;

function shuffleAndPick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function RightPanel() {
  const { rightPanelOpen } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const [recommendedCommunities, setRecommendedCommunities] = useState<Community[]>([]);
  const [hotTopics, setHotTopics] = useState<Topic[]>([]);
  const [hotPosts, setHotPosts] = useState<Post[]>([]);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState<RecommendedUser[]>([]);

  useEffect(() => {
    getHotTopics(8).then(setHotTopics).catch(() => {});
    getPosts({ sort: 'hot', limit: 3 }).then((res) => setHotPosts(res.posts)).catch(() => {});
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      getRecommendedCommunities(1, 20)
        .then((res) => setRecommendedCommunities(shuffleAndPick(res.data || [], COMMUNITY_PICK_COUNT)))
        .catch(() => {});
      getRecommendedUsers(1, 20)
        .then((res) => setSuggestedUsers(shuffleAndPick(res.data || [], 3)))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  return (
    <aside
      className={cn(
        'hidden w-72 flex-shrink-0 overflow-y-auto border-l bg-muted/50 p-4',
        'lg:block',
        !rightPanelOpen && 'hidden'
      )}
      style={{ height: 'calc(100vh - 3.5rem)' }}
    >
      <div className="space-y-4">
        {/* 热门话题 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
              热门话题
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(showAllTopics ? hotTopics : hotTopics.slice(0, HOT_TOPIC_PREVIEW_COUNT)).map((topic) => (
                <Link
                  key={topic.id}
                  href={`/topics/${topic.id}`}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <span className="text-foreground"># {topic.name}</span>
                  <span className="text-xs text-muted-foreground">{topic.postCount}篇</span>
                </Link>
              ))}
              {hotTopics.length > HOT_TOPIC_PREVIEW_COUNT && !showAllTopics && (
                <button
                  onClick={() => setShowAllTopics(true)}
                  className="block w-full rounded-lg px-2 py-1.5 text-center text-xs text-primary hover:bg-accent"
                >
                  查看全部话题
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 推荐关注 */}
        {isAuthenticated && suggestedUsers.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <UserPlus className="h-4 w-4 text-blue-500" />
                推荐关注
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suggestedUsers.map((u) => (
                  <Link
                    key={u.id}
                    href={`/profile/${u.username}`}
                    className="flex items-center gap-3 rounded-lg p-1 hover:bg-accent"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={u.avatarUrl} alt={u.displayName} />
                      <AvatarFallback>{u.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{u.displayName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {u.matchReasons?.length ? u.matchReasons[0] : (u.bio || `@${u.username}`)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 推荐社群 */}
        {isAuthenticated && recommendedCommunities.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <MessageCircle className="h-4 w-4 text-orange-500" />
                推荐社群
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendedCommunities.map((community) => (
                  <Link
                    key={community.id}
                    href={`/communities/${community.id}`}
                    className="flex items-center gap-3 rounded-lg p-1 hover:bg-accent"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={community.avatarUrl || undefined} alt={community.name} />
                      <AvatarFallback>{community.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{community.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {community.memberCount} 成员
                      </p>
                      {community.tags && community.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {community.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 近期热门动态 */}
        {hotPosts.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Flame className="h-4 w-4 text-red-500" />
                近期热门动态
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hotPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.id}`}
                    className="block rounded-lg p-2 hover:bg-accent"
                  >
                    <p className="line-clamp-2 text-sm text-foreground">{post.content || '动态'}</p>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{post.author.displayName}</span>
                      <span>{post.likeCount} 赞</span>
                      <span>{post.commentCount} 评论</span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 页脚 */}
        <div className="px-2 text-xs text-muted-foreground">
          <Separator className="mb-3" />
          <p>徐霞客系统 © 2026</p>
          <p className="mt-1">用VR记录旅程，让世界触手可及</p>
        </div>
      </div>
    </aside>
  );
}
