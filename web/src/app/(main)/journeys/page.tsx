'use client';

import { useState, useEffect } from 'react';
import { BookOpen, PenLine, Lock, Globe, MapPin, Edit, Trash2, Sparkles, Calendar, Share2, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { usePostStore } from '@/stores/post-store';
import { AuthGuard } from '@/components/auth-guard';
import { getContentHierarchy, deletePost, publishPost } from '@/lib/post-api';
import type { Post, Visibility } from '@/types';

type StatusTab = 'public' | 'private';

const visibilityConfig: Record<Visibility, { icon: any; label: string; color: string }> = {
  PRIVATE: { icon: Lock, label: '私密', color: 'text-amber-600 dark:text-amber-400' },
  FOLLOWERS: { icon: Globe, label: '关注可见', color: 'text-blue-600 dark:text-blue-400' },
  PUBLIC: { icon: Globe, label: '公开', color: 'text-green-600 dark:text-green-400' },
};

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

const statusTabs: { id: StatusTab; label: string; icon: typeof Globe }[] = [
  { id: 'public', label: '已发布', icon: Globe },
  { id: 'private', label: '我的（私密）', icon: Lock },
];

export default function JourneysPage() {
  return <AuthGuard><JourneysContent /></AuthGuard>;
}

function JourneysContent() {
  const { user } = useAuthStore();
  const removePost = usePostStore(s => s.removePost);
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>('public');

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    getContentHierarchy({
      level: 'ESSAY',
      userId: user.id,
      limit: 100,
    })
      .then(result => {
        const all = result.posts || [];
        setAllPosts(all);
        filterPosts(all, activeTab);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const filterPosts = (source: Post[], tab: StatusTab) => {
    setPosts(tab === 'private' ? source.filter(p => p.visibility === 'PRIVATE') : source.filter(p => p.visibility !== 'PRIVATE'));
  };

  const handleTabSwitch = (tab: StatusTab) => {
    setActiveTab(tab);
    filterPosts(allPosts, tab);
  };

  const groupedPosts = groupByMonth(posts);
  const monthKeys = Object.keys(groupedPosts).sort((a, b) => b.localeCompare(a));

  const handleEdit = (postId: string) => {
    router.push(`/upload/journey-creator?edit=${postId}`);
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('确定要删除这篇游记吗？')) return;
    try {
      await removePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch {}
  };

  const handleToggleVisibility = async (postId: string, makePrivate: boolean) => {
    try {
      const newVis = makePrivate ? 'PRIVATE' : 'PUBLIC';
      await publishPost(postId, undefined, newVis as any);

      // 更新 allPosts
      setAllPosts(prev => prev.map(p => p.id === postId ? { ...p, visibility: newVis } : p));

      // 如果可见性变更后不再匹配当前标签，从当前列表移除；否则更新
      setPosts(prev => {
        const shouldStay =
          activeTab === 'private' ? newVis === 'PRIVATE' : newVis !== 'PRIVATE';
        if (!shouldStay) return prev.filter(p => p.id !== postId);
        return prev.map(p => p.id === postId ? { ...p, visibility: newVis } : p);
      });
    } catch {}
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">游记散文</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/journeys/generate">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500" />
              AI 生成
            </Button>
          </Link>
          <Link href="/upload/journey-creator">
            <Button size="sm" className="gap-1.5">
              <PenLine className="h-4 w-4" />
              写游记
            </Button>
          </Link>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        基于瞬间捕获和日记，生成有个人情感的正式游记文章。
      </p>

      {/* 状态切换 */}
      <div className="flex gap-1 border-b">
        {statusTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 游记列表 */}
      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">加载中...</div>
      ) : posts.length === 0 ? (
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
                              <>
                                <span>·</span>
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{post.location.name}</span>
                              </>
                            )}
                          </div>
                          <div className={`flex items-center gap-1 text-xs ${vis.color}`}>
                            <vis.icon className="h-3.5 w-3.5" />
                            <span>{vis.label}</span>
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
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(post.id)} className="gap-1.5">
                            <Edit className="h-3.5 w-3.5" />编辑
                          </Button>
                          {post.visibility === 'PRIVATE' ? (
                            <Button variant="ghost" size="sm" onClick={() => handleToggleVisibility(post.id, false)} className="gap-1.5 text-green-600">
                              <Share2 className="h-3.5 w-3.5" />公开发布
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => handleToggleVisibility(post.id, true)} className="gap-1.5 text-amber-600">
                              <EyeOff className="h-3.5 w-3.5" />转为私密
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)} className="gap-1.5 text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />删除
                          </Button>
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
