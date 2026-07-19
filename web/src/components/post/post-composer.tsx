'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Image, Send, X, Loader2, Plus, Video, Mic, Link2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth-store';
import { usePostStore } from '@/stores/post-store';
import { uploadImage, getImageDimensions, uploadVideo, uploadAudio, getVideoMetadata, getAudioDuration, fetchLinkPreview } from '@/lib/media-api';
import { CreatePostPayload } from '@/lib/post-api';

const MAX_CONTENT_LENGTH = 500;
const MAX_IMAGES = 9;

type MediaItem = NonNullable<CreatePostPayload['mediaItems']>[number];

export function PostComposer() {
  const { user } = useAuthStore();
  const { isPublishing, publishError, publishPost, clearPublishError } = usePostStore();
  const [mounted, setMounted] = useState(false);
  const [content, setContent] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // 帖子类型状态（快速发布支持笔记和动态，其他类型引导到上传页）
  const [postType, setPostType] = useState<'NOTE' | 'MOMENT'>('NOTE');

  // 更多选项状态
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [loadingLink, setLoadingLink] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);

  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 点击外部关闭更多菜单
  useEffect(() => {
    if (!showMoreMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoreMenu]);

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CONTENT_LENGTH;
  const imageCount = mediaItems.filter((m) => m.type === 'IMAGE').length;
  const canPublish = (content.trim().length > 0 || mediaItems.length > 0) && !isOverLimit && !isPublishing;

  // 自动调整 textarea 高度
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  useEffect(() => {
    if (expanded) {
      adjustTextareaHeight();
    }
  }, [content, expanded, adjustTextareaHeight]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_CONTENT_LENGTH) {
      setContent(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && canPublish) {
      e.preventDefault();
      handlePublish();
    }
  };

  const handlePublish = async () => {
    if (!canPublish) return;

    try {
      const payload: CreatePostPayload = {
        content: content.trim(),
        visibility: 'PUBLIC',
        postType: 'NOTE',
        mediaItems: mediaItems.length > 0 ? mediaItems : undefined,
      };

      await publishPost(payload);
      setContent('');
      setMediaItems([]);
      setExpanded(false);
      setShowMoreMenu(false);
      setShowLinkInput(false);
      toast.success('发布成功');
    } catch {
      toast.error(publishError || '发布失败，请重试');
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    // 用 composerRef 判断焦点是否仍在整个发布区域内（包括按钮）
    if (relatedTarget && composerRef.current?.contains(relatedTarget)) return;

    setTimeout(() => {
      if (!content.trim() && mediaItems.length === 0 && !isPublishing && !showMoreMenu) {
        setExpanded(false);
        clearPublishError();
      }
    }, 150);
  };

  // 图片上传（接受 FileList 或 File[]）
  const handleImageUpload = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    const remaining = MAX_IMAGES - imageCount;
    if (fileArray.length > remaining) {
      toast.warning(`最多只能上传${MAX_IMAGES}张图片`);
      return;
    }

    setUploading(true);
    const uploadPromises = fileArray.map(async (file) => {
      try {
        const result = await uploadImage(file);
        let width = result.width;
        let height = result.height;
        if (width === 0 || height === 0) {
          try {
            const dims = await getImageDimensions(result.url);
            width = dims.width;
            height = dims.height;
          } catch {}
        }
        return { type: 'IMAGE' as const, url: result.url, width, height, sortOrder: mediaItems.length };
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 视频上传
  const handleVideoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploading(true);
    try {
      const result = await uploadVideo(file);
      let duration = 0, width = 0, height = 0;
      try {
        const meta = await getVideoMetadata(result.url);
        duration = meta.duration; width = meta.width; height = meta.height;
      } catch {}
      setMediaItems((prev) => [...prev, { type: 'VIDEO', url: result.url, duration, width, height, sortOrder: prev.length }]);
      toast.success('视频已添加');
    } catch {
      toast.error('视频上传失败');
    }
    setUploading(false);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  // 音频上传
  const handleAudioUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploading(true);
    try {
      const result = await uploadAudio(file);
      let duration = 0;
      try { duration = await getAudioDuration(result.url); } catch {}
      setMediaItems((prev) => [...prev, { type: 'AUDIO', url: result.url, duration, sortOrder: prev.length }]);
      toast.success('音频已添加');
    } catch {
      toast.error('音频上传失败');
    }
    setUploading(false);
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  // 链接确认
  const handleLinkConfirm = async () => {
    if (!linkUrl.trim()) return;
    let url = linkUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;

    setLoadingLink(true);
    try {
      const preview = await fetchLinkPreview(url);
      setMediaItems((prev) => [...prev, {
        type: 'LINK', url: '', linkUrl: url, linkTitle: preview.title || url,
        linkDescription: preview.description, linkFavicon: preview.favicon, sortOrder: prev.length,
      }]);
    } catch {
      setMediaItems((prev) => [...prev, {
        type: 'LINK', url: '', linkUrl: url, linkTitle: url,
        linkDescription: '', linkFavicon: '', sortOrder: prev.length,
      }]);
    }
    setLinkUrl('');
    setShowLinkInput(false);
    setLoadingLink(false);
  };

  const removeMediaItem = (index: number) => {
    setMediaItems((prev) => prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, sortOrder: i })));
  };

  // 拖拽处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const imageFiles = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      handleImageUpload(imageFiles);
    }
  };

  // 粘贴处理
  const handlePaste = (e: React.ClipboardEvent) => {
    const imageFiles: File[] = [];
    for (let i = 0; i < e.clipboardData.items.length; i++) {
      const item = e.clipboardData.items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) imageFiles.push(file);
      }
    }
    if (imageFiles.length > 0) {
      e.preventDefault();
      handleImageUpload(imageFiles);
    }
  };

  // SSR 骨架屏
  if (!mounted || !user) {
    return (
      <div className="rounded-xl border bg-card p-3 shadow-sm">
        <div className="h-10 animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  return (
    <div
      ref={composerRef}
      className={`rounded-xl border bg-card shadow-sm transition-all ${isDragging ? 'border-primary border-2' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="p-3">
        {/* 主输入行 */}
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9 flex-shrink-0">
            <AvatarImage src={user.avatarUrl} alt={user.displayName} />
            <AvatarFallback>{user.displayName[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {!expanded ? (
              /* 收起状态：单行输入 + 按钮 */
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 cursor-text rounded-lg bg-muted/50 px-3 py-2 text-sm hover:bg-muted transition-colors truncate"
                  onClick={() => {
                    setExpanded(true);
                    setTimeout(() => textareaRef.current?.focus(), 0);
                  }}
                >
                  {content ? (
                    <span className="text-foreground">{content}</span>
                  ) : (
                    <span className="text-muted-foreground">分享你的旅行故事...</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-primary relative"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || imageCount >= MAX_IMAGES}
                >
                  <Image className="h-[18px] w-[18px]" />
                  {mediaItems.length > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      {mediaItems.length}
                    </span>
                  )}
                </Button>
                <Button
                  size="sm"
                  className="h-9 px-4 gap-1.5"
                  disabled={!canPublish}
                  onClick={handlePublish}
                >
                  {isPublishing ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> 发布中...</>
                  ) : (
                    <><Send className="h-4 w-4" /> 发布</>
                  )}
                </Button>
              </div>
            ) : (
              /* 展开状态：多行输入 + 完整操作 */
              <div className="space-y-3">
                <textarea
                  ref={textareaRef}
                  placeholder="分享你的旅行故事..."
                  className="w-full resize-none border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-0 min-h-[60px]"
                  value={content}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                  onPaste={handlePaste}
                  disabled={isPublishing}
                  rows={3}
                />

                {/* 拖拽提示 */}
                {isDragging && (
                  <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 py-6 text-sm text-primary">
                    释放以上传图片
                  </div>
                )}

                {/* 图片预览网格 */}
                {mediaItems.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {mediaItems.map((item, index) => (
                      <div key={index} className="relative group">
                        {item.type === 'IMAGE' && (
                          <div className="h-20 w-20 overflow-hidden rounded-lg border">
                            <img src={item.url} alt="预览" className="h-full w-full object-cover" />
                            <button
                              onClick={() => removeMediaItem(index)}
                              className="absolute -right-1 -top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-destructive text-white group-hover:flex"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                        {item.type === 'VIDEO' && (
                          <div className="relative h-20 w-28 overflow-hidden rounded-lg border bg-black/5">
                            <video src={item.url} className="h-full w-full object-cover" muted />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="rounded-full bg-black/60 p-1.5">
                                <Video className="h-4 w-4 text-white" />
                              </div>
                            </div>
                            <button
                              onClick={() => removeMediaItem(index)}
                              className="absolute -right-1 -top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-destructive text-white group-hover:flex"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                        {item.type === 'AUDIO' && (
                          <div className="relative flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 pr-8">
                            <Mic className="h-4 w-4 text-accent" />
                            <span className="text-xs text-muted-foreground">
                              音频{(item.duration ?? 0) > 0 && ` · ${Math.floor((item.duration ?? 0) / 60)}:${String((item.duration ?? 0) % 60).padStart(2, '0')}`}
                            </span>
                            <button
                              onClick={() => removeMediaItem(index)}
                              className="absolute right-1 top-1/2 -translate-y-1/2 hidden h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-destructive group-hover:flex"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                        {item.type === 'LINK' && (
                          <div className="relative flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 pr-8">
                            {item.linkFavicon && <img src={item.linkFavicon} alt="" className="h-4 w-4" />}
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
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleLinkConfirm(); } }}
                      disabled={loadingLink}
                      className="h-8 text-sm"
                    />
                    <Button size="sm" variant="ghost" onClick={handleLinkConfirm} disabled={!linkUrl.trim() || loadingLink}>
                      {loadingLink ? <Loader2 className="h-4 w-4 animate-spin" /> : '确认'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setShowLinkInput(false); setLinkUrl(''); }}>
                      取消
                    </Button>
                  </div>
                )}

                {/* 操作栏 */}
                <div className="flex items-center justify-between pt-1 border-t">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-xs text-muted-foreground hover:text-primary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading || imageCount >= MAX_IMAGES}
                    >
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
                      图片
                      {imageCount > 0 && <span className="opacity-70">({imageCount}/{MAX_IMAGES})</span>}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-xs text-muted-foreground hover:text-violet-500"
                      onClick={() => videoInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Video className="h-4 w-4" />
                      视频
                    </Button>

                    {/* 分隔线 */}
                    <div className="mx-1 h-4 w-px bg-border" />

                    {/* 更多选项按钮 */}
                    <div className="relative" ref={moreMenuRef}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-full ${showMoreMenu ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      {showMoreMenu && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-44 rounded-lg border bg-popover/95 p-1 shadow-lg backdrop-blur-sm z-50">
                          <button
                            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs transition-colors hover:bg-accent"
                            onClick={() => { audioInputRef.current?.click(); setShowMoreMenu(false); }}
                          >
                            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/10">
                              <Mic className="h-3.5 w-3.5 text-accent" />
                            </span>
                            音频
                          </button>
                          <button
                            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs transition-colors hover:bg-accent"
                            onClick={() => { setShowLinkInput(true); setShowMoreMenu(false); }}
                          >
                            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-500/10">
                              <Link2 className="h-3.5 w-3.5 text-orange-500" />
                            </span>
                            链接
                          </button>
                          <div className="my-1 h-px bg-border" />
                          <Link
                            href="/upload"
                            className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs transition-colors hover:bg-accent"
                            onClick={() => setShowMoreMenu(false)}
                          >
                            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted">
                              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                            </span>
                            更多内容
                          </Link>
                          {/* 小三角 */}
                          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rotate-45 border-l border-t bg-popover/95" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline text-[11px] text-muted-foreground/60">
                      Ctrl+Enter 发布
                    </span>
                    <span className={`text-xs ${charCount > 450 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                      {charCount}/{MAX_CONTENT_LENGTH}
                    </span>
                    <Button
                      size="sm"
                      className="h-8 px-4 gap-1.5"
                      disabled={!canPublish}
                      onClick={handlePublish}
                    >
                      {isPublishing ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> 发布中...</>
                      ) : (
                        <><Send className="h-4 w-4" /> 发布</>
                      )}
                    </Button>
                  </div>
                </div>

                {/* 错误提示 */}
                {publishError && (
                  <div className="flex items-center gap-2 text-xs text-destructive">
                    <span>{publishError}</span>
                    <button onClick={clearPublishError} className="ml-auto text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 隐藏的文件输入 */}
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => handleImageUpload(e.target.files)} />
      <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={(e) => handleVideoUpload(e.target.files)} />
      <input ref={audioInputRef} type="file" accept="audio/mpeg,audio/wav,audio/ogg,audio/webm,audio/aac" className="hidden" onChange={(e) => handleAudioUpload(e.target.files)} />
    </div>
  );
}
