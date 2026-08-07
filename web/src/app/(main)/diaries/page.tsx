'use client';

import { useState, useEffect } from 'react';
import { BookOpen, PenLine, Lock, Globe, Users, Image as ImageIcon, Video, Music, Edit, Share2, Calendar, MapPin, Sparkles, List, ChevronLeft, ChevronRight, Trash2, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { AuthGuard } from '@/components/auth-guard';
import { getContentHierarchy, publishPost, deletePost } from '@/lib/post-api';
import { toast } from 'sonner';
import { DiaryComposeDialog } from '@/components/diary/diary-compose-dialog';
import type { Post, Visibility, MoodType, WeatherType } from '@/types';
import { MoodEmoji, WeatherEmoji, MoodLabel, WeatherLabel } from '@/types';

type FilterType = 'all' | 'draft' | 'PRIVATE' | 'PUBLIC' | 'FOLLOWERS';

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

function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getFirstDayOfMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
}

function groupPostsByDate(posts: Post[]): Record<string, Post[]> {
  const groups: Record<string, Post[]> = {};
  posts.forEach(post => {
    const date = new Date(post.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(post);
  });
  return groups;
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
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [composeOpen, setComposeOpen] = useState(false);

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

  const isDraft = (p: Post) => p.vrMetadata?.status === 'draft';

  const filteredPosts = filter === 'all'
    ? posts
    : filter === 'draft'
      ? posts.filter(isDraft)
      : posts.filter(p => p.visibility === filter && (filter !== 'PRIVATE' || !isDraft(p)));

  const groupedPosts = groupByMonth(filteredPosts);
  const monthKeys = Object.keys(groupedPosts).sort((a, b) => b.localeCompare(a));

  const filterOptions: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: '全部', count: posts.length },
    { value: 'draft', label: '草稿', count: posts.filter(isDraft).length },
    { value: 'PRIVATE', label: '私密', count: posts.filter(p => p.visibility === 'PRIVATE' && !isDraft(p)).length },
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
      toast.success(visibility === 'PRIVATE' ? '已转为私密' : visibility === 'PUBLIC' ? '已转为公开' : '已设为关注可见');
    } catch (error) {
      console.error('发布失败:', error);
      toast.error('发布失败，请重试');
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('确定要删除这篇日记吗？删除后不可恢复。')) return;
    try {
      await deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch { /* 忽略 */ }
  };

  const handlePromoteToJourney = (post: Post) => {
    // 导航到 AI 游记生成页面，预选这篇日记
    router.push(`/journeys/generate?ids=${post.id}`);
  };

  return (
    <div className="space-y-5">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-indigo-500" />
          <h1 className="text-xl font-bold">我的日记</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border">
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('timeline')}
              className="gap-1"
            >
              <List className="h-4 w-4" />
              时间线
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="gap-1"
            >
              <Calendar className="h-4 w-4" />
              日历
            </Button>
          </div>
          <Button
            size="sm"
            className="gap-1.5 bg-indigo-600 hover:bg-indigo-700"
            onClick={() => setComposeOpen(true)}
          >
            <PenLine className="h-4 w-4" />
            写日记
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        记录旅途中的点滴心情与感悟，这是属于你的私密空间。
      </p>

      {/* 那年今日 */}
      {(() => {
        const today = new Date();
        const todayMonth = today.getMonth();
        const todayDay = today.getDate();
        const todayYear = today.getFullYear();

        const onThisDayPosts = posts.filter(post => {
          const postDate = new Date(post.createdAt);
          return postDate.getMonth() === todayMonth &&
                 postDate.getDate() === todayDay &&
                 postDate.getFullYear() !== todayYear;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        if (onThisDayPosts.length === 0) return null;

        return (
          <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 dark:border-indigo-900 dark:from-indigo-950/30 dark:to-purple-950/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">那年今日</h3>
                <Badge variant="secondary" className="text-xs">
                  {onThisDayPosts.length}篇回忆
                </Badge>
              </div>
              <div className="space-y-2">
                {onThisDayPosts.slice(0, 3).map(post => {
                  const postYear = new Date(post.createdAt).getFullYear();
                  const yearsAgo = todayYear - postYear;
                  const visibility = visibilityConfig[post.visibility];

                  return (
                    <button
                      key={post.id}
                      onClick={() => router.push(`/diaries/${post.id}`)}
                      className="w-full text-left rounded-lg border border-indigo-200/50 bg-white/50 dark:border-indigo-800/50 dark:bg-gray-900/50 p-3 hover:bg-white/80 dark:hover:bg-gray-900/80 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                          {postYear}年 · {yearsAgo}年前
                        </span>
                        <div className={`flex items-center gap-1 text-xs ${visibility.color}`}>
                          <visibility.icon className="h-3 w-3" />
                          <span>{visibility.label}</span>
                        </div>
                      </div>
                      <p className="text-sm line-clamp-2 text-foreground">
                        {post.content || '(无内容)'}
                      </p>
                      {!!post.vrMetadata?.mood && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <span>{MoodEmoji[post.vrMetadata.mood as MoodType]}</span>
                          <span>{String(post.vrMetadata.mood)}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
                {onThisDayPosts.length > 3 && (
                  <p className="text-xs text-center text-muted-foreground">
                    还有 {onThisDayPosts.length - 3} 篇回忆
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })()}

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
      ) : viewMode === 'timeline' ? (
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
                  const draft = isDraft(post);
                  const openPost = () => {
                    if (draft) {
                      const meta = post.vrMetadata || {};
                      if (Array.isArray(meta.sourceSnapIds) && meta.sourceSnapIds.length > 1) {
                        router.push(`/snap/generate/batch?ids=${meta.sourceSnapIds.join(',')}&postId=${post.id}`);
                      } else if (post.parentPostId) {
                        router.push(`/snap/generate/${post.parentPostId}`);
                      } else {
                        router.push(`/diaries/${post.id}`);
                      }
                    } else {
                      router.push(`/diaries/${post.id}`);
                    }
                  };

                  return (
                    <Card
                      key={post.id}
                      className={`overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${draft ? 'border-dashed border-amber-300 dark:border-amber-800' : ''}`}
                      onClick={openPost}
                    >
                      <CardContent className="p-4">
                        {/* 顶部：时间 + 地点 + 隐私状态 */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatRelativeTime(post.createdAt)}</span>
                            {!!post.vrMetadata?.mood && (
                              <>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                  {MoodEmoji[post.vrMetadata.mood as MoodType]}
                                  {MoodLabel[post.vrMetadata.mood as MoodType]}
                                </span>
                              </>
                            )}
                            {!!post.vrMetadata?.weather && (
                              <>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                  {WeatherEmoji[post.vrMetadata.weather as WeatherType]}
                                  {WeatherLabel[post.vrMetadata.weather as WeatherType]}
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
                          {draft ? (
                            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                              <FileText className="h-3.5 w-3.5" />
                              <span>草稿</span>
                            </div>
                          ) : (
                            <div className={`flex items-center gap-1 text-xs ${visibility.color}`}>
                              <VisibilityIcon className="h-3.5 w-3.5" />
                              <span>{visibility.label}</span>
                            </div>
                          )}
                        </div>

                        {/* 标题 */}
                        {post.title && (
                          <h3 className="mb-1.5 text-sm font-semibold leading-snug line-clamp-1">{post.title}</h3>
                        )}

                        {/* 有图片：图文布局 */}
                        {post.mediaItems.length > 0 ? (
                          <div className="flex gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm leading-relaxed line-clamp-3 mb-2">
                                {post.content || '(无内容)'}
                              </p>
                              <div className="flex gap-1.5">
                                {post.mediaItems.slice(0, 4).map((media, idx) => {
                                  const MediaIcon = getMediaIcon(media.type);
                                  return (
                                    <div key={media.id} className="relative w-14 h-14 rounded-md overflow-hidden bg-muted">
                                      {media.type === 'IMAGE' && (media.thumbnailUrl || media.url) ? (
                                        <img src={media.thumbnailUrl || media.url} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <MediaIcon className="h-4 w-4 text-muted-foreground/50" />
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
                            </div>
                            {post.mediaItems[0].type === 'IMAGE' && (post.mediaItems[0].thumbnailUrl || post.mediaItems[0].url) && (
                              <div className="shrink-0 w-20 h-20 rounded-md overflow-hidden bg-muted">
                                <img src={post.mediaItems[0].thumbnailUrl || post.mediaItems[0].url} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                        ) : (
                          /* 纯文字：紧凑布局 */
                          <p className="text-sm leading-relaxed line-clamp-2">{post.content || '(无内容)'}</p>
                        )}

                        {/* 底部操作：按草稿/可见性差异化 */}
                        <div className="flex items-center gap-1 pt-2 mt-2 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
                          {draft ? (
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-indigo-600" onClick={() => openPost()}>
                              <PenLine className="h-3 w-3" />继续写
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleEdit(post.id)}>
                              <Edit className="h-3 w-3" />编辑
                            </Button>
                          )}
                          {!draft && post.visibility !== 'PUBLIC' && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-green-600" onClick={() => handlePublish(post.id, 'PUBLIC')}>
                              <Share2 className="h-3 w-3" />公开
                            </Button>
                          )}
                          {!draft && post.visibility !== 'PRIVATE' && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-amber-600" onClick={() => handlePublish(post.id, 'PRIVATE')}>
                              <Lock className="h-3 w-3" />私密
                            </Button>
                          )}
                          {!draft && post.visibility !== 'FOLLOWERS' && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-blue-600" onClick={() => handlePublish(post.id, 'FOLLOWERS')}>
                              <Users className="h-3 w-3" />关注可见
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-purple-600 ml-auto" onClick={() => handlePromoteToJourney(post)}>
                            <Sparkles className="h-3 w-3" />升华为游记
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-destructive" onClick={() => handleDelete(post.id)}>
                            <Trash2 className="h-3 w-3" />
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
      ) : (
        <CalendarView
          posts={filteredPosts}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          onDateClick={() => {}}
        />
      )}

      {/* 写日记统一创作引导 */}
      <DiaryComposeDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        initialSelectedIds={[]}
      />
    </div>
  );
}

function CalendarView({ posts, currentMonth, setCurrentMonth, onDateClick }: {
  posts: Post[];
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  onDateClick: (date: Date) => void;
}) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const postsByDate = groupPostsByDate(posts);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(clickedDate);
    onDateClick(clickedDate);
  };

  const formatDateKey = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="space-y-3">
      {/* 月份导航 */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="h-7 px-1.5" onClick={prevMonth}>
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">
            {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
          </h2>
          <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={goToToday}>
            今天
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="h-7 px-1.5" onClick={nextMonth}>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* 日历网格 */}
      <Card>
        <CardContent className="p-2">
          {/* 星期标题 */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {weekDays.map(day => (
              <div key={day} className="text-center text-[10px] text-muted-foreground py-1">
                {day}
              </div>
            ))}
          </div>

          {/* 日期格子 */}
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateKey = formatDateKey(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              const dayPosts = postsByDate[dateKey] || [];
              const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`aspect-square rounded-md border p-0.5 flex flex-col items-center justify-start gap-px transition-colors hover:bg-accent/50 ${
                    isToday ? 'border-primary bg-primary/5' : 'border-transparent'
                  } ${selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth.getMonth() ? 'ring-1 ring-primary/30' : ''}`}
                >
                  <span className={`text-xs ${isToday ? 'font-bold text-primary' : ''}`}>{day}</span>
                  {dayPosts.length > 0 && (
                    <div className="flex gap-px">
                      {dayPosts.slice(0, 3).map((_, idx) => (
                        <div key={idx} className={`w-1 h-1 rounded-full ${dayPosts.some(p => p.vrMetadata?.mood) ? 'bg-indigo-400' : 'bg-muted-foreground/30'}`} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 统计信息 */}
      <div className="text-xs text-muted-foreground text-center">
        {(() => {
          const count = Object.values(postsByDate).flat().filter(p => {
            const postDate = new Date(p.createdAt);
            return postDate.getFullYear() === currentMonth.getFullYear() && postDate.getMonth() === currentMonth.getMonth();
          }).length;
          return `本月共 ${count} 篇日记`;
        })()}
      </div>

      {/* 选中日期的日记列表 */}
      {selectedDate && (() => {
        const dateKey = formatDateKey(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        const selectedPosts = postsByDate[dateKey] || [];

        if (selectedPosts.length === 0) {
          return (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日暂无日记
                </p>
              </CardContent>
            </Card>
          );
        }

        return (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日的日记 ({selectedPosts.length}篇)
            </h3>
            {selectedPosts.map(post => {
              const visibility = visibilityConfig[post.visibility];
              const VisibilityIcon = visibility.icon;

              return (
                <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    {/* 顶部：时间 + 地点 + 隐私状态 */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{new Date(post.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                        {!!post.vrMetadata?.mood && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              {MoodEmoji[post.vrMetadata.mood as MoodType]}
                            </span>
                          </>
                        )}
                        {!!post.vrMetadata?.weather && (
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
                                  {media.type === 'IMAGE' && (media.thumbnailUrl || media.url) ? (
                                    <img
                                      src={media.thumbnailUrl || media.url}
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
                            src={post.mediaItems[0].thumbnailUrl || post.mediaItems[0].url}
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
                        onClick={() => router.push(`/diaries/${post.id}`)}
                        className="gap-1.5"
                      >
                        查看详情
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}
