'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Video, Image, Mic, Link2, Languages, Send, AlertCircle, X, Loader2, ExternalLink, FileText, Map, Compass, BookOpen, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth-store';
import { usePostStore } from '@/stores/post-store';
import { uploadImage, getImageDimensions, fetchLinkPreview, uploadVideo, uploadAudio, getVideoMetadata, getAudioDuration } from '@/lib/media-api';
import { CreatePostPayload, getTags } from '@/lib/post-api';
import type { PostType, InterestTag, Difficulty, RouteType, GuideCategory, BudgetLevel } from '@/types';

const MAX_CONTENT_LENGTH = 500;
const MAX_IMAGES = 9;

type MediaItem = NonNullable<CreatePostPayload['mediaItems']>[number];

const postTypeOptions: { type: PostType; label: string; icon: typeof FileText; color: string }[] = [
  { type: 'NOTE', label: '笔记', icon: FileText, color: 'text-primary' },
  { type: 'VR_MEDIA', label: 'VR内容', icon: Video, color: 'text-violet-500' },
  { type: 'ROUTE', label: '路线', icon: Map, color: 'text-emerald-500' },
  { type: 'JOURNEY', label: '旅程', icon: Compass, color: 'text-amber-500' },
  { type: 'GUIDE', label: '攻略', icon: BookOpen, color: 'text-blue-500' },
  { type: 'MOMENT', label: '动态', icon: MessageSquare, color: 'text-pink-500' },
];

const mediaButtons = [
  { type: 'VIDEO', label: 'VR视频', icon: Video, color: 'text-primary hover:bg-primary/10' },
  { type: 'IMAGE', label: 'VR图片', icon: Image, color: 'text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20' },
  { type: 'AUDIO', label: '音频', icon: Mic, color: 'text-accent hover:bg-accent/10' },
  { type: 'LINK', label: '链接', icon: Link2, color: 'text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20' },
  { type: 'TRANSLATION', label: '翻译', icon: Languages, color: 'text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20' },
];

export function PostComposer() {
  const { user } = useAuthStore();
  const { isPublishing, publishError, publishPost, clearPublishError } = usePostStore();
  const [mounted, setMounted] = useState(false);
  const [content, setContent] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [loadingLink, setLoadingLink] = useState(false);

  // 内容分类状态
  const [postType, setPostType] = useState<PostType>('NOTE');
  const [selectedTags, setSelectedTags] = useState<InterestTag[]>([]);
  const [topicInput, setTopicInput] = useState('');
  const [topicNames, setTopicNames] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<InterestTag[]>([]);
  const [showTagPicker, setShowTagPicker] = useState(false);

  // 路线状态
  const [routeDistance, setRouteDistance] = useState('');
  const [routeDuration, setRouteDuration] = useState('');
  const [routeElevation, setRouteElevation] = useState('');
  const [routeDifficulty, setRouteDifficulty] = useState<Difficulty>('MODERATE');
  const [routeType, setRouteType] = useState<RouteType>('HIKE');

  // 旅程状态
  const [journeyTitle, setJourneyTitle] = useState('');
  const [journeyDestination, setJourneyDestination] = useState('');
  const [journeyStartDate, setJourneyStartDate] = useState('');
  const [journeyEndDate, setJourneyEndDate] = useState('');

  // 攻略状态
  const [guideDestination, setGuideDestination] = useState('');
  const [guideCategory, setGuideCategory] = useState<GuideCategory>('TIPS');
  const [guideBestSeason, setGuideBestSeason] = useState('');
  const [guideBudget, setGuideBudget] = useState<BudgetLevel>('MID');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    getTags().then(setAllTags).catch(() => {});
  }, []);

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CONTENT_LENGTH;
  const charCountColor = charCount > 450 ? 'text-orange-500' : 'text-muted-foreground';
  const imageCount = mediaItems.filter((m) => m.type === 'IMAGE').length;
  const hasLink = mediaItems.some((m) => m.type === 'LINK');
  const canPublish = (content.trim().length > 0 || mediaItems.length > 0) && !isOverLimit && !isPublishing;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_CONTENT_LENGTH) {
      setContent(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && canPublish) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTopicKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && topicInput.trim()) {
      e.preventDefault();
      const name = topicInput.trim();
      if (!topicNames.includes(name) && topicNames.length < 5) {
        setTopicNames((prev) => [...prev, name]);
      }
      setTopicInput('');
    }
  };

  const removeTopic = (name: string) => {
    setTopicNames((prev) => prev.filter((t) => t !== name));
  };

  const toggleTag = (tag: InterestTag) => {
    setSelectedTags((prev) => {
      const exists = prev.find((t) => t.id === tag.id);
      if (exists) return prev.filter((t) => t.id !== tag.id);
      if (prev.length >= 5) return prev;
      return [...prev, tag];
    });
  };

  const handleSubmit = async () => {
    if (!canPublish) return;

    try {
      const payload: CreatePostPayload = {
        content: content.trim(),
        visibility: 'PUBLIC',
        postType,
        tagIds: selectedTags.length > 0 ? selectedTags.map((t) => t.id) : undefined,
        topicNames: topicNames.length > 0 ? topicNames : undefined,
        mediaItems: mediaItems.length > 0 ? mediaItems : undefined,
      };

      if (postType === 'ROUTE') {
        payload.routeDetail = {
          distanceKm: routeDistance ? parseFloat(routeDistance) : undefined,
          durationMinutes: routeDuration ? parseInt(routeDuration) : undefined,
          elevationGainM: routeElevation ? parseInt(routeElevation) : undefined,
          difficulty: routeDifficulty,
          routeType,
        };
      }

      if (postType === 'JOURNEY' && journeyTitle.trim()) {
        payload.journey = {
          title: journeyTitle.trim(),
          destination: journeyDestination || undefined,
          startDate: journeyStartDate || undefined,
          endDate: journeyEndDate || undefined,
        };
      }

      if (postType === 'GUIDE') {
        payload.guideDetail = {
          destination: guideDestination || undefined,
          category: guideCategory,
          bestSeason: guideBestSeason || undefined,
          budgetLevel: guideBudget,
          richContent: content.trim(),
        };
      }

      await publishPost(payload);
      setContent('');
      setMediaItems([]);
      setSelectedTags([]);
      setTopicNames([]);
      setPostType('NOTE');
      setRouteDistance('');
      setRouteDuration('');
      setRouteElevation('');
      setRouteDifficulty('MODERATE');
      setRouteType('HIKE');
      setJourneyTitle('');
      setJourneyDestination('');
      setJourneyStartDate('');
      setJourneyEndDate('');
      setGuideDestination('');
      setGuideCategory('TIPS');
      setGuideBestSeason('');
      setGuideBudget('MID');
      setExpanded(false);
      toast.success('发布成功');
    } catch {
      toast.error(publishError || '发布失败，请重试');
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (!content.trim() && mediaItems.length === 0 && !isPublishing) {
        setExpanded(false);
        clearPublishError();
      }
    }, 150);
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;

    const remaining = MAX_IMAGES - imageCount;
    if (files.length > remaining) {
      toast.warning(`最多只能上传${MAX_IMAGES}张图片`);
      return;
    }

    setUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        const result = await uploadImage(file);
        let width = result.width;
        let height = result.height;

        // 如果后端返回的尺寸为0，客户端读取
        if (width === 0 || height === 0) {
          try {
            const dims = await getImageDimensions(result.url);
            width = dims.width;
            height = dims.height;
          } catch {
            // 忽略尺寸读取错误
          }
        }

        return {
          type: 'IMAGE' as const,
          url: result.url,
          width,
          height,
          sortOrder: mediaItems.length,
        };
      } catch {
        toast.error(`图片 ${file.name} 上传失败`);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const validResults = results.filter((r): r is NonNullable<typeof r> => r !== null);

    if (validResults.length > 0) {
      setMediaItems((prev) => [...prev, ...validResults]);
      toast.success(`已添加 ${validResults.length} 张图片`);
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleVideoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(true);
    try {
      const result = await uploadVideo(file);
      let duration = 0;
      let width = 0;
      let height = 0;
      try {
        const meta = await getVideoMetadata(result.url);
        duration = meta.duration;
        width = meta.width;
        height = meta.height;
      } catch {
        // 忽略元数据读取错误
      }

      setMediaItems((prev) => [
        ...prev,
        {
          type: 'VIDEO',
          url: result.url,
          duration,
          width,
          height,
          sortOrder: prev.length,
        },
      ]);
      toast.success('视频已添加');
    } catch {
      toast.error('视频上传失败');
    }
    setUploading(false);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleAudioUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(true);
    try {
      const result = await uploadAudio(file);
      let duration = 0;
      try {
        duration = await getAudioDuration(result.url);
      } catch {
        // 忽略时长读取错误
      }

      setMediaItems((prev) => [
        ...prev,
        {
          type: 'AUDIO',
          url: result.url,
          duration,
          sortOrder: prev.length,
        },
      ]);
      toast.success('音频已添加');
    } catch {
      toast.error('音频上传失败');
    }
    setUploading(false);
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  const handleLinkConfirm = async () => {
    if (!linkUrl.trim()) return;

    let url = linkUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    setLoadingLink(true);
    try {
      const preview = await fetchLinkPreview(url);
      setMediaItems((prev) => [
        ...prev,
        {
          type: 'LINK',
          url: '',
          linkUrl: url,
          linkTitle: preview.title || url,
          linkDescription: preview.description,
          linkFavicon: preview.favicon,
          sortOrder: prev.length,
        },
      ]);
      setLinkUrl('');
      setShowLinkInput(false);
      toast.success('链接已添加');
    } catch {
      // 即使获取预览失败，也添加链接
      setMediaItems((prev) => [
        ...prev,
        {
          type: 'LINK',
          url: '',
          linkUrl: url,
          linkTitle: url,
          linkDescription: '',
          linkFavicon: '',
          sortOrder: prev.length,
        },
      ]);
      setLinkUrl('');
      setShowLinkInput(false);
      toast.warning('无法获取链接预览，已添加链接');
    }
    setLoadingLink(false);
  };

  const removeMediaItem = (index: number) => {
    setMediaItems((prev) => prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, sortOrder: i })));
  };

  const handleMediaClick = (type: string) => {
    if (type === 'IMAGE') {
      fileInputRef.current?.click();
    } else if (type === 'VIDEO') {
      videoInputRef.current?.click();
    } else if (type === 'AUDIO') {
      audioInputRef.current?.click();
    } else if (type === 'LINK') {
      setShowLinkInput(true);
    } else {
      toast.info(`${type} 功能即将上线`);
    }
  };

  // SSR和首次客户端渲染均显示骨架屏，避免hydration不匹配
  if (!mounted || !user) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="h-10 animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={user.avatarUrl} alt={user.displayName} />
            <AvatarFallback>{user.displayName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder={`${user.displayName}，今天用VR眼镜记录了什么？`}
              className="min-h-[40px] resize-none border-0 bg-muted p-3 text-sm focus-visible:ring-0"
              value={content}
              onChange={handleChange}
              onFocus={() => setExpanded(true)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              disabled={isPublishing}
            />

            {/* 媒体预览区 */}
            {mediaItems.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {mediaItems.map((item, index) => (
                  <div key={index} className="relative group">
                    {item.type === 'IMAGE' && (
                      <div className="h-20 w-20 overflow-hidden rounded-lg border">
                        <img
                          src={item.url}
                          alt="预览"
                          className="h-full w-full object-cover"
                        />
                        <button
                          onClick={() => removeMediaItem(index)}
                          className="absolute -right-1 -top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-destructive text-white group-hover:flex"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    {item.type === 'LINK' && (
                      <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 pr-8">
                        {item.linkFavicon && (
                          <img src={item.linkFavicon} alt="" className="h-4 w-4" />
                        )}
                        <span className="max-w-[200px] truncate text-xs">{item.linkTitle}</span>
                        <button
                          onClick={() => removeMediaItem(index)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 hidden h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-destructive group-hover:flex"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 链接输入框 */}
            {showLinkInput && (
              <div className="flex gap-2">
                <Input
                  placeholder="输入链接地址..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleLinkConfirm();
                    }
                  }}
                  disabled={loadingLink}
                  className="h-8 text-sm"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleLinkConfirm}
                  disabled={!linkUrl.trim() || loadingLink}
                >
                  {loadingLink ? <Loader2 className="h-4 w-4 animate-spin" /> : '确认'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowLinkInput(false);
                    setLinkUrl('');
                  }}
                >
                  取消
                </Button>
              </div>
            )}

            {expanded && (
              <div className="space-y-3">
                {/* 内容类型选择 */}
                <div className="flex flex-wrap gap-1">
                  {postTypeOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isActive = postType === opt.type;
                    return (
                      <Button
                        key={opt.type}
                        variant={isActive ? 'secondary' : 'ghost'}
                        size="sm"
                        className={`gap-1.5 text-xs ${isActive ? '' : opt.color}`}
                        onClick={() => setPostType(opt.type)}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {opt.label}
                      </Button>
                    );
                  })}
                </div>

                {/* 标签选择 */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-xs text-muted-foreground"
                      onClick={() => setShowTagPicker(!showTagPicker)}
                    >
                      # 添加标签
                      {selectedTags.length > 0 && (
                        <span className="text-primary">({selectedTags.length})</span>
                      )}
                    </Button>
                  </div>
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedTags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="gap-1 cursor-pointer text-xs hover:bg-destructive/10"
                          onClick={() => toggleTag(tag)}
                        >
                          {tag.icon} {tag.name}
                          <X className="h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  )}
                  {showTagPicker && (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="flex flex-wrap gap-1">
                        {allTags.map((tag) => {
                          const isSelected = selectedTags.some((t) => t.id === tag.id);
                          return (
                            <button
                              key={tag.id}
                              onClick={() => toggleTag(tag)}
                              className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                                isSelected
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                              }`}
                            >
                              {tag.icon} {tag.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 话题输入 */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">#话题</span>
                    <Input
                      placeholder="输入话题名称，回车确认"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      onKeyDown={handleTopicKeyDown}
                      className="h-7 flex-1 text-xs"
                      disabled={topicNames.length >= 5}
                    />
                  </div>
                  {topicNames.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {topicNames.map((name) => (
                        <Badge
                          key={name}
                          variant="outline"
                          className="gap-1 cursor-pointer text-xs hover:bg-destructive/10"
                          onClick={() => removeTopic(name)}
                        >
                          #{name}
                          <X className="h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* 路线专属字段 */}
                {postType === 'ROUTE' && (
                  <div className="space-y-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">路线信息</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground">距离(km)</label>
                        <Input type="number" step="0.1" placeholder="0" value={routeDistance} onChange={(e) => setRouteDistance(e.target.value)} className="h-7 text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">时长(分钟)</label>
                        <Input type="number" placeholder="0" value={routeDuration} onChange={(e) => setRouteDuration(e.target.value)} className="h-7 text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">爬升(米)</label>
                        <Input type="number" placeholder="0" value={routeElevation} onChange={(e) => setRouteElevation(e.target.value)} className="h-7 text-xs" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground">类型</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {([['HIKE','🥾徒步'],['BIKE','🚴骑行'],['DRIVE','🚗自驾'],['PADDLE','🛶皮划艇'],['CLIMB','🧗攀岩']] as const).map(([val, lbl]) => (
                            <button key={val} onClick={() => setRouteType(val)} className={`rounded-full px-2 py-0.5 text-[10px] ${routeType === val ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>{lbl}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">难度</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {([['EASY','简单'],['MODERATE','中等'],['HARD','困难'],['EXPERT','专家']] as const).map(([val, lbl]) => (
                            <button key={val} onClick={() => setRouteDifficulty(val)} className={`rounded-full px-2 py-0.5 text-[10px] ${routeDifficulty === val ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>{lbl}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 旅程专属字段 */}
                {postType === 'JOURNEY' && (
                  <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400">旅程信息</p>
                    <div>
                      <label className="text-[10px] text-muted-foreground">旅程标题 *</label>
                      <Input placeholder="例：云南7日自由行" value={journeyTitle} onChange={(e) => setJourneyTitle(e.target.value)} className="h-7 text-xs" />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground">目的地</label>
                      <Input placeholder="例：昆明-大理-丽江" value={journeyDestination} onChange={(e) => setJourneyDestination(e.target.value)} className="h-7 text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground">开始日期</label>
                        <Input type="date" value={journeyStartDate} onChange={(e) => setJourneyStartDate(e.target.value)} className="h-7 text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">结束日期</label>
                        <Input type="date" value={journeyEndDate} onChange={(e) => setJourneyEndDate(e.target.value)} className="h-7 text-xs" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 攻略专属字段 */}
                {postType === 'GUIDE' && (
                  <div className="space-y-2 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400">攻略信息</p>
                    <div>
                      <label className="text-[10px] text-muted-foreground">目的地</label>
                      <Input placeholder="例：三亚" value={guideDestination} onChange={(e) => setGuideDestination(e.target.value)} className="h-7 text-xs" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground">分类</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {([['FOOD','🍜美食'],['STAY','🏨住宿'],['TRANSPORT','🚗交通'],['TICKET','🎫门票'],['TIPS','💡攻略']] as const).map(([val, lbl]) => (
                            <button key={val} onClick={() => setGuideCategory(val)} className={`rounded-full px-2 py-0.5 text-[10px] ${guideCategory === val ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground'}`}>{lbl}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">最佳季节</label>
                        <Input placeholder="例：春秋" value={guideBestSeason} onChange={(e) => setGuideBestSeason(e.target.value)} className="h-7 text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">预算</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {([['BUDGET','💰穷游'],['MID','💳中等'],['LUXURY','💎高端']] as const).map(([val, lbl]) => (
                            <button key={val} onClick={() => setGuideBudget(val)} className={`rounded-full px-2 py-0.5 text-[10px] ${guideBudget === val ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground'}`}>{lbl}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 媒体按钮 */}
                <div className="flex flex-wrap gap-1">
                  {mediaButtons.map((btn) => {
                    const Icon = btn.icon;
                    const isDisabled =
                      isPublishing ||
                      uploading ||
                      (btn.type === 'IMAGE' && imageCount >= MAX_IMAGES) ||
                      (btn.type === 'LINK' && hasLink);

                    return (
                      <Button
                        key={btn.type}
                        variant="ghost"
                        size="sm"
                        className={`gap-1.5 text-xs ${btn.color}`}
                        onClick={() => handleMediaClick(btn.type)}
                        disabled={isDisabled}
                      >
                        {uploading && btn.type === 'IMAGE' ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                        {btn.label}
                        {btn.type === 'IMAGE' && imageCount > 0 && (
                          <span className="ml-1 text-xs opacity-70">({imageCount}/{MAX_IMAGES})</span>
                        )}
                      </Button>
                    );
                  })}
                </div>

                {publishError && (
                  <div className="flex items-center gap-2 text-xs text-destructive">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{publishError}</span>
                    <button onClick={clearPublishError} className="ml-auto text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className={`text-xs ${charCountColor}`}>
                    {charCount}/{MAX_CONTENT_LENGTH}
                  </span>
                  <Button
                    size="sm"
                    className="gap-1.5"
                    disabled={!canPublish}
                    onClick={handleSubmit}
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        发布中...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        发布
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleImageUpload(e.target.files)}
        />
      </CardContent>
    </Card>
  );
}
