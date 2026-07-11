'use client';

import { useState, useEffect, useRef } from 'react';
import { Video, Image, Mic, Link2, Languages, Send, AlertCircle, X, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import { usePostStore } from '@/stores/post-store';
import { uploadImage, getImageDimensions, fetchLinkPreview } from '@/lib/media-api';
import { CreatePostPayload } from '@/lib/post-api';

const MAX_CONTENT_LENGTH = 500;
const MAX_IMAGES = 9;

type MediaItem = NonNullable<CreatePostPayload['mediaItems']>[number];

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
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

  const handleSubmit = async () => {
    if (!canPublish) return;

    try {
      await publishPost({
        content: content.trim(),
        visibility: 'PUBLIC',
        mediaItems: mediaItems.length > 0 ? mediaItems : undefined,
      });
      setContent('');
      setMediaItems([]);
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
                          className="absolute -right-1 -top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white group-hover:flex"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    {item.type === 'LINK' && (
                      <div className="flex items-center gap-2 rounded-lg border bg-gray-50 px-3 py-2 pr-8">
                        {item.linkFavicon && (
                          <img src={item.linkFavicon} alt="" className="h-4 w-4" />
                        )}
                        <span className="max-w-[200px] truncate text-xs">{item.linkTitle}</span>
                        <button
                          onClick={() => removeMediaItem(index)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 hidden h-5 w-5 items-center justify-center rounded-full text-gray-400 hover:text-red-500 group-hover:flex"
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
                  <div className="flex items-center gap-2 text-xs text-red-500">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{publishError}</span>
                    <button onClick={clearPublishError} className="ml-auto text-gray-400 hover:text-gray-600">
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
                    className="gap-1.5 bg-blue-600 hover:bg-blue-700"
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
