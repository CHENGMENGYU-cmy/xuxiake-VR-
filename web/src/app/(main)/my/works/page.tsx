'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FolderOpen, PenLine, BookOpen, Lock, Globe, Users,
  MapPin, Calendar, Sparkles, Edit, Trash2, Share2, EyeOff,
  List, ChevronLeft, ChevronRight, Image as ImageIcon, Video, Music,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/auth-store';
import { usePostStore } from '@/stores/post-store';
import { AuthGuard } from '@/components/auth-guard';
import { getContentHierarchy, publishPost, deletePost } from '@/lib/post-api';
import type { Post, Visibility, MoodType } from '@/types';
import { MoodEmoji } from '@/types';

const visibilityConfig: Record<Visibility, { icon: any; label: string; color: string }> = {
  PRIVATE: { icon: Lock, label: '私密', color: 'text-amber-600 dark:text-amber-400' },
  FOLLOWERS: { icon: Users, label: '关注可见', color: 'text-blue-600 dark:text-blue-400' },
  PUBLIC: { icon: Globe, label: '公开', color: 'text-green-600 dark:text-green-400' },
};

const mediaTypeIcons: Record<string, any> = { IMAGE: ImageIcon, VIDEO: Video, AUDIO: Music };

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays < 7) return `${diffDays} 天前`;
  return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
}

function groupByMonth(posts: Post[]): Record<string, Post[]> {
  const groups: Record<string, Post[]> = {};
  posts.forEach(post => {
    const date = new Date(post.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(post);
  });
  return groups;
}

function formatMonthKey(key: string): string {
  const [year, month] = key.split('-');
  return `${year}年${parseInt(month)}月`;
}

export default function WorksPage() {
  return (
    <AuthGuard>
      <WorksContent />
    </AuthGuard>
  );
}

function WorksContent() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-5">
      {/* 标题 */}
      <div className="flex items-center gap-2">
        <FolderOpen className="h-6 w-6 text-indigo-500" />
        <h1 className="text-xl font-bold">我的作品</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        管理你的日记和游记作品。
      </p>

      <Tabs defaultValue="diaries" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="diaries" className="gap-1.5">
            <PenLine className="h-4 w-4" />
            日记
          </TabsTrigger>
          <TabsTrigger value="journeys" className="gap-1.5">
            <BookOpen className="h-4 w-4" />
            游记
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diaries" className="mt-4">
          <DiariesTab userId={user?.id || ''} />
        </TabsContent>

        <TabsContent value="journeys" className="mt-4">
          <JourneysTab userId={user?.id || ''} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* =========================================================
 * 日记 Tab
 * ========================================================= */
type DiaryFilter = 'all' | 'PRIVATE' | 'PUBLIC' | 'FOLLOWERS';

function DiariesTab({ userId }: { userId: string }) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DiaryFilter>('all');

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getContentHierarchy({ level: 'DIARY', userId, limit: 100 })
      .then(result => setPosts(result.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const filteredPosts = filter === 'all' ? posts : posts.filter(p => p.visibility === filter);
  const groupedPosts = groupByMonth(filteredPosts);
  const monthKeys = Object.keys(groupedPosts).sort((a, b) => b.localeCompare(a));

  const filterOptions: { value: DiaryFilter; label: string; count: number }[] = [
    { value: 'all', label: '全部', count: posts.length },
    { value: 'PRIVATE', label: '私密', count: posts.filter(p => p.visibility === 'PRIVATE').length },
    { value: 'PUBLIC', label: '公开', count: posts.filter(p => p.visibility === 'PUBLIC').length },
    { value: 'FOLLOWERS', label: '关注可见', count: posts.filter(p => p.visibility === 'FOLLOWERS').length },
  ];

  const handlePublish = async (postId: string, visibility: Visibility) => {
    try {
      await publishPost(postId, undefined, visibility);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, visibility } : p));
    } catch {}
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('确定删除这篇日记？')) return;
    try {
      await deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch {}
  };

  const handleEdit = (postId: string) => router.push(`/upload?edit=${postId}`);
  const handlePromote = (post: Post) => router.push(`/journeys/generate?ids=${post.id}`);

  if (loading) {
    return <div className="py-16 text-center text-sm text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="space-y-4">
      {/* 筛选 */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map(opt => (
          <Button
            key={opt.value}
            variant={filter === opt.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(opt.value)}
            className="text-xs"
          >
            {opt.label} ({opt.count})
          </Button>
        ))}
      </div>

      {filteredPosts.length === 0 ? (
        <div className="py-16 text-center">
          <PenLine className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">
            {filter === 'all' ? '还没有日记' : `没有${filterOptions.find(o => o.value === filter)?.label}的日记`}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {monthKeys.map(monthKey => (
            <div key={monthKey}>
              <div className="sticky top-0 z-10 mb-3 flex items-center gap-2 bg-background/80 backdrop-blur-sm py-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-muted-foreground">{formatMonthKey(monthKey)}</h2>
                <span className="text-xs text-muted-foreground/60">({groupedPosts[monthKey].length} 篇)</span>
              </div>
              <div className="space-y-3">
                {groupedPosts[monthKey].map(post => {
                  const vis = visibilityConfig[post.visibility];
                  return (
                    <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatRelativeTime(post.createdAt)}</span>
                            {post.location?.name && (
                              <><span>·</span><span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{post.location.name}</span></>
                            )}
                          </div>
                          <div className={`flex items-center gap-1 text-xs ${vis.color}`}>
                            <vis.icon className="h-3.5 w-3.5" /><span>{vis.label}</span>
                          </div>
                        </div>

                        <p className="text-sm leading-relaxed line-clamp-3 mb-3">{post.content || '(无内容)'}</p>

                        {!!post.vrMetadata?.mood && (
                          <div className="flex items-center gap-1 mb-3 text-xs text-muted-foreground">
                            <span>{MoodEmoji[post.vrMetadata.mood as MoodType]}</span>
                            <span>{String(post.vrMetadata.mood)}</span>
                          </div>
                        )}

                        {post.mediaItems.length > 0 && (
                          <div className="flex gap-1.5 mb-3">
                            {post.mediaItems.slice(0, 4).map((media, idx) => (
                              <div key={media.id} className="relative w-14 h-14 rounded-md overflow-hidden bg-muted">
                                {media.type === 'IMAGE' && (media.thumbnailUrl || media.url) ? (
                                  <img src={media.thumbnailUrl || media.url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    {(() => { const Icon = mediaTypeIcons[media.type] || ImageIcon; return <Icon className="h-4 w-4 text-muted-foreground/50" />; })()}
                                  </div>
                                )}
                                {idx === 3 && post.mediaItems.length > 4 && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">+{post.mediaItems.length - 4}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-border/50">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(post.id)} className="h-7 gap-1 text-xs"><Edit className="h-3.5 w-3.5" />编辑</Button>
                          <Button variant="ghost" size="sm" onClick={() => handlePromote(post)} className="h-7 gap-1 text-xs"><Sparkles className="h-3.5 w-3.5 text-amber-500" />升华为游记</Button>
                          {post.visibility === 'PRIVATE' ? (
                            <Button variant="ghost" size="sm" onClick={() => handlePublish(post.id, 'PUBLIC')} className="h-7 gap-1 text-xs text-green-600"><Share2 className="h-3.5 w-3.5" />公开</Button>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => handlePublish(post.id, 'PRIVATE')} className="h-7 gap-1 text-xs"><EyeOff className="h-3.5 w-3.5" />转私密</Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)} className="h-7 gap-1 text-xs text-red-500 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
 * 游记 Tab
 * ========================================================= */
type JourneyTab = 'public' | 'private';

function JourneysTab({ userId }: { userId: string }) {
  const router = useRouter();
  const removePost = usePostStore(s => s.removePost);
  const [posts, setPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<JourneyTab>('public');

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getContentHierarchy({ level: 'ESSAY', userId, limit: 100 })
      .then(result => {
        const all = result.posts || [];
        setAllPosts(all);
        filterPosts(all, activeTab);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const filterPosts = (source: Post[], tab: JourneyTab) => {
    setPosts(tab === 'private' ? source.filter(p => p.visibility === 'PRIVATE') : source.filter(p => p.visibility !== 'PRIVATE'));
  };

  const handleTabSwitch = (tab: JourneyTab) => {
    setActiveTab(tab);
    filterPosts(allPosts, tab);
  };

  const groupedPosts = groupByMonth(posts);
  const monthKeys = Object.keys(groupedPosts).sort((a, b) => b.localeCompare(a));

  const handleEdit = (postId: string) => router.push(`/upload/journey-creator?edit=${postId}`);

  const handleDelete = async (postId: string) => {
    if (!confirm('确定删除这篇游记？')) return;
    try {
      await removePost(postId);
      setAllPosts(prev => prev.filter(p => p.id !== postId));
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch {}
  };

  const handleToggleVisibility = async (postId: string, makePrivate: boolean) => {
    try {
      const newVis = makePrivate ? 'PRIVATE' : 'PUBLIC';
      await publishPost(postId, undefined, newVis as any);
      setAllPosts(prev => prev.map(p => p.id === postId ? { ...p, visibility: newVis } : p));
      setPosts(prev => {
        const shouldStay = activeTab === 'private' ? newVis === 'PRIVATE' : newVis !== 'PRIVATE';
        if (!shouldStay) return prev.filter(p => p.id !== postId);
        return prev.map(p => p.id === postId ? { ...p, visibility: newVis } : p);
      });
    } catch {}
  };

  if (loading) {
    return <div className="py-16 text-center text-sm text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="space-y-4">
      {/* 状态切换 */}
      <div className="flex gap-1 border-b">
        <button
          onClick={() => handleTabSwitch('public')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'public' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Globe className="h-4 w-4" />已发布
        </button>
        <button
          onClick={() => handleTabSwitch('private')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'private' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Lock className="h-4 w-4" />我的（私密）
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="py-16 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">
            {activeTab === 'public' ? '还没有公开的游记' : '没有私密游记'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {monthKeys.map(monthKey => (
            <div key={monthKey}>
              <div className="sticky top-0 z-10 mb-3 flex items-center gap-2 bg-background/80 backdrop-blur-sm py-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-muted-foreground">{formatMonthKey(monthKey)}</h2>
                <span className="text-xs text-muted-foreground/60">({groupedPosts[monthKey].length} 篇)</span>
              </div>
              <div className="space-y-3">
                {groupedPosts[monthKey].map(post => {
                  const vis = visibilityConfig[post.visibility];
                  return (
                    <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatRelativeTime(post.createdAt)}</span>
                            {post.location?.name && (
                              <><span>·</span><span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{post.location.name}</span></>
                            )}
                          </div>
                          <div className={`flex items-center gap-1 text-xs ${vis.color}`}>
                            <vis.icon className="h-3.5 w-3.5" /><span>{vis.label}</span>
                          </div>
                        </div>

                        <p className="text-sm leading-relaxed line-clamp-3 mb-3">{post.content || '(无内容)'}</p>

                        {post.mediaItems.length > 0 && (
                          <div className="flex gap-1.5 mb-3">
                            {post.mediaItems.slice(0, 4).map((media, idx) => (
                              <div key={media.id} className="relative w-16 h-16 rounded-md overflow-hidden bg-muted">
                                {media.type === 'IMAGE' && (media.thumbnailUrl || media.url) ? (
                                  <img src={media.thumbnailUrl || media.url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground/50" />
                                )}
                                {idx === 3 && post.mediaItems.length > 4 && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-medium">+{post.mediaItems.length - 4}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(post.id)} className="gap-1.5"><Edit className="h-3.5 w-3.5" />编辑</Button>
                          {post.visibility === 'PRIVATE' ? (
                            <Button variant="ghost" size="sm" onClick={() => handleToggleVisibility(post.id, false)} className="gap-1.5"><Share2 className="h-3.5 w-3.5" />公开发布</Button>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => handleToggleVisibility(post.id, true)} className="gap-1.5"><EyeOff className="h-3.5 w-3.5" />转为私密</Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)} className="gap-1.5 text-red-500 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" />删除</Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
