'use client';

import { useState, useEffect } from 'react';
import { BookOpen, PenLine, Lock, Globe, Users, Image as ImageIcon, Video, Music, Edit, Share2, Calendar, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { AuthGuard } from '@/components/auth-guard';
import { getContentHierarchy, publishPost } from '@/lib/post-api';
import type { Post, Visibility, MoodType, WeatherType } from '@/types';
import { MoodEmoji, WeatherEmoji } from '@/types';

type FilterType = 'all' | 'PRIVATE' | 'PUBLIC' | 'FOLLOWERS';

const visibilityConfig: Record<Visibility, { icon: any; label: string; color: string }> = {
  PRIVATE: { icon: Lock, label: '私密', color: 'text-amber-600 dark:text-amber-400' },
  FOLLOWERS: { icon: Users, label: '关注可见', color: 'text-blue-600 dark:text-blue-400' },
  PUBLIC: { icon: Globe, label: '公开', color: 'text-green-600 dark:text-green-400' },
};

const mediaTypeIcons: Record<string, any> = {
  IMAGE: ImageIcon,
  VIDEO: Video,
  AUDIO: Music,
};

function getMediaIcon(type: string) {
  return mediaTypeIcons[type] || ImageIcon;
}

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

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(post);
  });

  return groups;
}

function formatMonthKey(key: string): string {
  const [year, month] = key.split('-');
  return `${year}年${parseInt(month)}月`;
}

export default function DiariesPage() {
  return (
    <AuthGuard>
      <DiariesContent />
    </AuthGuard>
  );
}

function DiariesContent() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    if (!user?.id) return;

    setLoading(true);
    getContentHierarchy({
      level: 'DIARY',
      userId: user.id,
      limit: 100,
    })
      .then(result => {
        setPosts(result.posts || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const filteredPosts = filter === 'all'
    ? posts
    : posts.filter(p => p.visibility === filter);

  const groupedPosts = groupByMonth(filteredPosts);
  const monthKeys = Object.keys(groupedPosts).sort((a, b) => b.localeCompare(a));

  const filterOptions: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: '全部', count: posts.length },
    { value: 'PRIVATE', label: '私密', count: posts.filter(p => p.visibility === 'PRIVATE').length },
    { value: 'PUBLIC', label: '公开', count: posts.filter(p => p.visibility === 'PUBLIC').length },
    { value: 'FOLLOWERS', label: '关注可见', count: posts.filter(p => p.visibility === 'FOLLOWERS').length },
  ];

  const handleEdit = (postId: string) => {
    router.push(`/upload?edit=${postId}`);
  };

  const handlePublish = async (postId: string, visibility: Visibility) => {
    try {
      await publishPost(postId, undefined, visibility);
      // 更新本地状态
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, visibility } : p
      ));
    } catch (error) {
      console.error('发布失败:', error);
    }
  };

  const handlePromoteToJourney = (post: Post) => {
    // 保存日记数据到 localStorage，供游记创建器使用
    const journeyDraft = {
      sourceDiaryId: post.id,
      title: post.content?.slice(0, 50) || '我的旅行游记',
      content: post.content || '',
      location: post.location,
      mediaItems: post.mediaItems,
      vrMetadata: post.vrMetadata,
      createdAt: post.createdAt,
    };
    localStorage.setItem('journey-from-diary', JSON.stringify(journeyDraft));
    router.push('/upload/journey-creator?from=diary');
  };

  return (
    <div className="space-y-5">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-indigo-500" />
          <h1 className="text-xl font-bold">我的日记</h1>
        </div>
        <Link href="/upload?level=DIARY">
          <Button size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-700">
            <PenLine className="h-4 w-4" />
            写日记
          </Button>
        </Link>
      </div>

      <p className="text-sm text-muted-foreground">
        记录旅途中的点滴心情与感悟，这是属于你的私密空间。
      </p>

      {/* 状态筛选 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filterOptions.map(option => (
          <Button
            key={option.value}
            variant={filter === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(option.value)}
            className="shrink-0"
          >
            {option.label}
            <span className="ml-1 text-xs opacity-70">({option.count})</span>
          </Button>
        ))}
      </div>

      {/* 私密提示 */}
      {filter === 'all' && posts.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/30 px-3 py-2">
          <Lock className="h-4 w-4 text-indigo-500 shrink-0" />
          <p className="text-xs text-indigo-600 dark:text-indigo-400">
            日记默认为私密内容，仅自己可见。你可以选择发布到社区或设为关注可见。
          </p>
        </div>
      )}

      {/* 日记列表 */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="text-sm text-muted-foreground">加载中...</div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="py-16 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">
            {filter === 'all' ? '还没有日记，点击「写日记」开始记录吧' : '该分类下暂无日记'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {monthKeys.map(monthKey => (
            <div key={monthKey}>
              {/* 月份标题 */}
              <div className="sticky top-0 z-10 mb-3 flex items-center gap-2 bg-background/80 backdrop-blur-sm py-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-muted-foreground">
                  {formatMonthKey(monthKey)}
                </h2>
                <span className="text-xs text-muted-foreground/60">
                  ({groupedPosts[monthKey].length} 篇)
                </span>
              </div>

              {/* 该月的日记列表 */}
              <div className="space-y-3">
                {groupedPosts[monthKey].map(post => {
                  const visibility = visibilityConfig[post.visibility];
                  const VisibilityIcon = visibility.icon;

                  return (
                    <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        {/* 顶部：时间 + 地点 + 隐私状态 */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatRelativeTime(post.createdAt)}</span>
                            {post.vrMetadata?.mood && (
                              <>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                  {MoodEmoji[post.vrMetadata.mood as MoodType]}
                                </span>
                              </>
                            )}
                            {post.vrMetadata?.weather && (
                              <>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                  {WeatherEmoji[post.vrMetadata.weather as WeatherType]}
                                </span>
                              </>
                            )}
                            {post.location?.name && (
                              <>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {post.location.name}
                                </span>
                              </>
                            )}
                          </div>

                          <div className={`flex items-center gap-1 text-xs ${visibility.color}`}>
                            <VisibilityIcon className="h-3.5 w-3.5" />
                            <span>{visibility.label}</span>
                          </div>
                        </div>

                        {/* 内容区 */}
                        <div className="flex gap-3">
                          {/* 文字内容 */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm leading-relaxed line-clamp-3 mb-3">
                              {post.content || '(无内容)'}
                            </p>

                            {/* 媒体缩略图 */}
                            {post.mediaItems.length > 0 && (
                              <div className="flex gap-1.5 mb-3">
                                {post.mediaItems.slice(0, 4).map((media, idx) => {
                                  const MediaIcon = getMediaIcon(media.type);
                                  return (
                                    <div
                                      key={media.id}
                                      className="relative w-16 h-16 rounded-md overflow-hidden bg-muted"
                                    >
                                      {media.type === 'IMAGE' && media.thumbnailUrl ? (
                                        <img
                                          src={media.thumbnailUrl}
                                          alt=""
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <MediaIcon className="h-5 w-5 text-muted-foreground/50" />
                                        </div>
                                      )}
                                      {idx === 3 && post.mediaItems.length > 4 && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-medium">
                                          +{post.mediaItems.length - 4}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* 右侧大图（如果有） */}
                          {post.mediaItems.length > 0 && post.mediaItems[0].type === 'IMAGE' && post.mediaItems[0].thumbnailUrl && (
                            <div className="shrink-0 w-24 h-24 rounded-md overflow-hidden bg-muted">
                              <img
                                src={post.mediaItems[0].thumbnailUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>

                        {/* 底部：操作按钮 */}
                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(post.id)}
                            className="gap-1.5"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            编辑
                          </Button>

                          {post.visibility === 'PRIVATE' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePublish(post.id, 'FOLLOWERS')}
                                className="gap-1.5 text-blue-600 hover:text-blue-700"
                              >
                                <Users className="h-3.5 w-3.5" />
                                关注可见
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePublish(post.id, 'PUBLIC')}
                                className="gap-1.5 text-green-600 hover:text-green-700"
                              >
                                <Share2 className="h-3.5 w-3.5" />
                                公开发布
                              </Button>
                            </>
                          )}

                          {post.visibility !== 'PRIVATE' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePublish(post.id, 'PRIVATE')}
                              className="gap-1.5 text-amber-600 hover:text-amber-700"
                            >
                              <Lock className="h-3.5 w-3.5" />
                              转为私密
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePromoteToJourney(post)}
                            className="gap-1.5 text-purple-600 hover:text-purple-700"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            升华为游记
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
