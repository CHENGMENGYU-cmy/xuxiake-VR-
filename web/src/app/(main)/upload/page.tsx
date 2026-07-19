'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, Video, Image, Mic, Link2, Languages, FileUp, MapPin, X, Loader2, Play, Volume2, Send, Route, Map, BookOpen, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth-store';
import { usePostStore } from '@/stores/post-store';
import { uploadVideo, uploadAudio, uploadImage, getImageDimensions, getVideoMetadata, getAudioDuration, fetchLinkPreview } from '@/lib/media-api';
import { CreatePostPayload } from '@/lib/post-api';
import type { VrFormat, Topic, Community, Visibility } from '@/types';
import { cn } from '@/lib/utils';
import { MultiImageUploader, UploadedImage } from '@/components/upload/multi-image-uploader';
import { TopicSelector } from '@/components/upload/topic-selector';
import { CommunitySelector } from '@/components/upload/community-selector';
import { VisibilityControl } from '@/components/upload/visibility-control';
import { DraftList } from '@/components/upload/draft-list';
import { PublishPreview } from '@/components/upload/publish-preview';
import { saveDraftToLocal, loadDraftFromLocal, clearLocalDraft, saveDraftToList } from '@/lib/draft-api';

type UploadTab = 'VIDEO' | 'IMAGE' | 'AUDIO' | 'LINK' | 'TRANSLATION';

const tabs: { key: UploadTab; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'VIDEO', label: 'VR视频', icon: Video, color: 'text-primary' },
  { key: 'IMAGE', label: 'VR图片', icon: Image, color: 'text-teal-500' },
  { key: 'AUDIO', label: '音频', icon: Mic, color: 'text-accent' },
  { key: 'LINK', label: '链接', icon: Link2, color: 'text-orange-500' },
  { key: 'TRANSLATION', label: '翻译', icon: Languages, color: 'text-teal-400' },
];

const vrFormats: { value: VrFormat; label: string; desc: string }[] = [
  { value: 'STANDARD', label: '标准', desc: '普通视频/图片' },
  { value: 'VR180', label: 'VR180', desc: '180°沉浸视野' },
  { value: 'VR360', label: 'VR360', desc: '360°全景视野' },
  { value: 'SPATIAL', label: '空间', desc: '3D空间视频' },
];

interface UploadedMedia {
  url: string;
  type: 'VIDEO' | 'IMAGE' | 'AUDIO';
  vrFormat: VrFormat;
  duration?: number;
  width?: number;
  height?: number;
  originalName?: string;
  size?: number;
}

interface LinkData {
  url: string;
  title: string;
  description: string;
  favicon: string;
}

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { publishPost, isPublishing } = usePostStore();

  const [activeTab, setActiveTab] = useState<UploadTab>('VIDEO');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('PUBLIC');
  const [media, setMedia] = useState<UploadedMedia | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [uploading, setUploading] = useState(false);
  const [vrFormat, setVrFormat] = useState<VrFormat>('STANDARD');
  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [loadingLink, setLoadingLink] = useState(false);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [waveform, setWaveform] = useState<number[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 加载本地草稿
  useEffect(() => {
    const draft = loadDraftFromLocal();
    if (draft) {
      setContent(draft.content || '');
      // 可以根据 postType 恢复更多状态
    }
  }, []);

  // 自动保存草稿（防抖）
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // 只有有内容时才保存
    if (content.trim() || media || images.length > 0 || linkData) {
      autoSaveTimerRef.current = setTimeout(() => {
        saveDraftToLocal({
          content,
          postType: media?.type === 'VIDEO' ? 'VR_MEDIA' : 'NOTE',
          formData: {
            activeTab,
            location,
            visibility,
            vrFormat,
            hasMedia: !!media,
            imageCount: images.length,
            hasLink: !!linkData,
          },
        });
      }, 2000); // 2秒后自动保存
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [content, media, images, linkData, activeTab, location, visibility, vrFormat]);

  // 选择草稿
  const handleSelectDraft = (draft: { content: string; postType: string }) => {
    setContent(draft.content);
    // 可以根据 postType 恢复更多状态
  };

  // 发布后清除草稿
  const handlePublishSuccess = () => {
    clearLocalDraft();
  };

  const resetMedia = () => {
    setMedia(null);
    setRecordedBlob(null);
    setVrFormat('STANDARD');
    setImages([]);
  };

  const handleTabChange = (tab: UploadTab) => {
    setActiveTab(tab);
    resetMedia();
    setLinkData(null);
    setLinkUrl('');
  };

  // Video upload
  const handleVideoSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setUploading(true);
    try {
      const result = await uploadVideo(file);
      let duration = 0, width = 0, height = 0;
      try {
        const meta = await getVideoMetadata(result.url);
        duration = meta.duration;
        width = meta.width;
        height = meta.height;
      } catch {}

      setMedia({ url: result.url, type: 'VIDEO', vrFormat: 'STANDARD', duration, width, height, originalName: result.originalName, size: result.size });
      toast.success('视频上传成功');
    } catch {
      toast.error('视频上传失败');
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Image upload
  const handleImageSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setUploading(true);
    try {
      const result = await uploadImage(file);
      let width = result.width, height = result.height;
      if (width === 0 || height === 0) {
        try {
          const dims = await getImageDimensions(result.url);
          width = dims.width;
          height = dims.height;
        } catch {}
      }

      setMedia({ url: result.url, type: 'IMAGE', vrFormat: 'STANDARD', width, height, originalName: result.originalName, size: result.size });
      toast.success('图片上传成功');
    } catch {
      toast.error('图片上传失败');
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Audio upload
  const handleAudioSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setUploading(true);
    try {
      const result = await uploadAudio(file);
      let duration = 0;
      try { duration = await getAudioDuration(result.url); } catch {}

      setMedia({ url: result.url, type: 'AUDIO', vrFormat: 'STANDARD', duration, originalName: result.originalName, size: result.size });
      toast.success('音频上传成功');
    } catch {
      toast.error('音频上传失败');
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm',
      });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach(t => t.stop());
        audioCtx.close();
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setWaveform([]);
      setRecordingDuration(0);
      startTimeRef.current = Date.now();

      // 计时器
      timerRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 200);

      // 波形采样
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const sampleWaveform = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((s, v) => s + v, 0) / bufferLength;
        const normalized = Math.min(1, avg / 128);
        setWaveform(prev => {
          const next = [...prev, normalized];
          return next.length > 50 ? next.slice(-50) : next;
        });
        animFrameRef.current = requestAnimationFrame(sampleWaveform);
      };
      sampleWaveform();
    } catch {
      toast.error('无法访问麦克风');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const uploadRecordedAudio = async () => {
    if (!recordedBlob) return;
    setUploading(true);
    try {
      const file = new File([recordedBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
      const result = await uploadAudio(file);
      let duration = 0;
      try { duration = await getAudioDuration(result.url); } catch {}

      setMedia({ url: result.url, type: 'AUDIO', vrFormat: 'STANDARD', duration, originalName: result.originalName, size: result.size });
      setRecordedBlob(null);
      toast.success('录音上传成功');
    } catch {
      toast.error('录音上传失败');
    }
    setUploading(false);
  };

  // Link preview
  const handleLinkConfirm = async () => {
    if (!linkUrl.trim()) return;
    let url = linkUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;

    setLoadingLink(true);
    try {
      const preview = await fetchLinkPreview(url);
      setLinkData({ url, title: preview.title || url, description: preview.description, favicon: preview.favicon });
      toast.success('链接预览已获取');
    } catch {
      setLinkData({ url, title: url, description: '', favicon: '' });
      toast.warning('无法获取链接预览');
    }
    setLoadingLink(false);
  };

  // Get file input accept based on active tab
  const getAccept = () => {
    switch (activeTab) {
      case 'VIDEO': return 'video/mp4,video/webm,video/quicktime';
      case 'IMAGE': return 'image/jpeg,image/png,image/webp';
      case 'AUDIO': return 'audio/mpeg,audio/wav,audio/ogg,audio/webm,audio/aac';
      default: return '';
    }
  };

  const handleFileInput = (files: FileList | null) => {
    if (activeTab === 'VIDEO') handleVideoSelect(files);
    else if (activeTab === 'IMAGE') handleImageSelect(files);
    else if (activeTab === 'AUDIO') handleAudioSelect(files);
  };

  // Publish
  const canPublish = (content.trim().length > 0 || media || images.length > 0 || linkData) && !isPublishing && !uploading;

  const handlePublish = async () => {
    if (!canPublish) return;

    const mediaItems: CreatePostPayload['mediaItems'] = [];

    // 单个视频/音频
    if (media) {
      mediaItems.push({
        type: media.type,
        url: media.url,
        vrFormat: media.vrFormat,
        duration: media.duration,
        width: media.width,
        height: media.height,
      });
    }

    // 多图
    if (images.length > 0) {
      images.forEach((img, index) => {
        mediaItems.push({
          type: 'IMAGE',
          url: img.url,
          width: img.width,
          height: img.height,
          vrFormat: vrFormat,
          sortOrder: index,
        });
      });
    }

    // 链接
    if (linkData) {
      mediaItems.push({
        type: 'LINK',
        url: '',
        linkUrl: linkData.url,
        linkTitle: linkData.title,
        linkDescription: linkData.description,
        linkFavicon: linkData.favicon,
      });
    }

    // 确定帖子类型
    let postType: CreatePostPayload['postType'] = 'NOTE';
    if (media?.type === 'VIDEO') {
      postType = 'VR_MEDIA';
    } else if (images.length > 0) {
      postType = 'VR_MEDIA';
    }

    const payload: CreatePostPayload = {
      content: content.trim() || '',
      visibility,
      postType,
      mediaItems: mediaItems.length > 0 ? mediaItems : undefined,
      topicNames: selectedTopics.length > 0 ? selectedTopics.map(t => t.name) : undefined,
      communityId: selectedCommunity?.id,
    };

    try {
      await publishPost(payload);
      clearLocalDraft();
      toast.success('发布成功');
      router.push('/feed');
    } catch {
      toast.error('发布失败，请重试');
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Upload className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">上传内容</h1>
      </div>

      {/* 草稿列表 */}
      <DraftList onSelectDraft={handleSelectDraft} />

      <Card>
        <CardContent className="p-6">
          {/* Tab选择 */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <Button
                  key={tab.key}
                  variant={isActive ? 'default' : 'outline'}
                  className="gap-2"
                  onClick={() => handleTabChange(tab.key)}
                >
                  <Icon className={cn('h-4 w-4', !isActive && tab.color)} />
                  {tab.label}
                </Button>
              );
            })}
          </div>

          <Separator className="my-4" />

          {/* 文字内容 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">说点什么...</label>
            <Textarea
              placeholder="分享你的VR旅程体验..."
              className="min-h-[100px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* 上传区域 */}
          <div className="mt-4">
            {/* VIDEO */}
            {activeTab === 'VIDEO' && (
              <>
                {media?.type === 'VIDEO' ? (
                  <div className="space-y-3">
                    <div className="relative overflow-hidden rounded-lg border bg-black">
                      <video src={media.url} className="max-h-64 w-full object-contain" controls />
                      <button onClick={resetMedia} className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {(media.duration ?? 0) > 0 && <Badge variant="secondary">{formatDuration(media.duration)}</Badge>}
                      {(media.width ?? 0) > 0 && <span>{media.width}x{media.height}</span>}
                      {media.size && <span>{formatSize(media.size)}</span>}
                    </div>
                    {/* VR格式选择 */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">VR格式</label>
                      <div className="flex flex-wrap gap-1.5">
                        {vrFormats.map(f => (
                          <button key={f.value} onClick={() => { setVrFormat(f.value); setMedia(m => m ? { ...m, vrFormat: f.value } : null); }}
                            className={cn('rounded-full px-3 py-1 text-xs transition-colors', vrFormat === f.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => fileInputRef.current?.click()}
                    className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary">
                    {uploading ? <Loader2 className="h-10 w-10 animate-spin text-primary" /> : <Video className="h-10 w-10 text-primary" />}
                    <div>
                      <p className="text-sm font-medium">{uploading ? '上传中...' : '点击或拖拽VR视频到此处'}</p>
                      <p className="text-xs text-muted-foreground mt-1">支持 MP4、MOV、WebM 格式，最大 500MB</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* IMAGE */}
            {activeTab === 'IMAGE' && (
              <div className="space-y-3">
                <MultiImageUploader
                  images={images}
                  onImagesChange={setImages}
                  maxImages={9}
                />
                {/* VR格式选择 */}
                {images.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">VR格式</label>
                    <div className="flex flex-wrap gap-1.5">
                      {vrFormats.map(f => (
                        <button key={f.value} onClick={() => setVrFormat(f.value)}
                          className={cn('rounded-full px-3 py-1 text-xs transition-colors', vrFormat === f.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AUDIO */}
            {activeTab === 'AUDIO' && (
              <>
                {media?.type === 'AUDIO' ? (
                  <div className="space-y-3">
                    <div className="relative flex items-center gap-3 rounded-lg border bg-muted/50 p-4">
                      <Volume2 className="h-8 w-8 text-accent flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <audio src={media.url} controls className="w-full" />
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {(media.duration ?? 0) > 0 && <span>{formatDuration(media.duration)}</span>}
                          {media.size && <span>{formatSize(media.size)}</span>}
                        </div>
                      </div>
                      <button onClick={resetMedia} className="rounded-full p-1 text-muted-foreground hover:text-destructive">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : recordedBlob ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-4">
                      <Volume2 className="h-6 w-6 text-accent" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">录音完成</p>
                        <audio src={URL.createObjectURL(recordedBlob)} controls className="mt-1 w-full" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={uploadRecordedAudio} disabled={uploading}>
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
                        上传录音
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setRecordedBlob(null)}>重新录制</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-accent">
                    {uploading ? <Loader2 className="h-10 w-10 animate-spin text-accent" /> : <Mic className="h-10 w-10 text-accent" />}
                    <div>
                      <p className="text-sm font-medium">{uploading ? '上传中...' : '上传或录制音频'}</p>
                      <p className="text-xs text-muted-foreground mt-1">支持 MP3、WAV、AAC、OGG 格式，最大 100MB</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <FileUp className="mr-1.5 h-4 w-4" />
                        选择音频文件
                      </Button>
                      <Button variant="outline" size="sm" onClick={isRecording ? stopRecording : startRecording}
                        className={isRecording ? 'border-red-300 text-red-500' : ''}>
                        <Mic className="mr-1.5 h-4 w-4" />
                        {isRecording ? '停止录制' : '录制音频'}
                      </Button>
                    </div>
                    {isRecording && (
                      <div className="w-full max-w-xs space-y-2">
                        <div className="flex items-center gap-2 text-sm text-red-500">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                          <span className="font-medium">{Math.floor(recordingDuration / 60)}:{String(recordingDuration % 60).padStart(2, '0')}</span>
                          <span className="text-xs text-muted-foreground">录制中...</span>
                        </div>
                        <div className="flex h-8 items-end gap-[2px] rounded-lg bg-red-50 dark:bg-red-950/30 px-2 py-1">
                          {waveform.map((v, i) => (
                            <div key={i} className="w-[3px] shrink-0 rounded-full bg-red-400/60" style={{ height: `${Math.max(4, v * 24)}px` }} />
                          ))}
                          {waveform.length === 0 && <div className="h-1 w-full rounded-full bg-red-200 dark:bg-red-800" />}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* LINK */}
            {activeTab === 'LINK' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input type="url" placeholder="https://example.com" value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleLinkConfirm(); } }}
                    disabled={loadingLink} />
                  <Button size="sm" onClick={handleLinkConfirm} disabled={!linkUrl.trim() || loadingLink}>
                    {loadingLink ? <Loader2 className="h-4 w-4 animate-spin" /> : '获取预览'}
                  </Button>
                </div>
                {linkData && (
                  <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
                    {linkData.favicon && <img src={linkData.favicon} alt="" className="h-5 w-5" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{linkData.title}</p>
                      {linkData.description && <p className="text-xs text-muted-foreground line-clamp-1">{linkData.description}</p>}
                      <p className="text-xs text-muted-foreground/70 truncate">{linkData.url}</p>
                    </div>
                    <button onClick={() => setLinkData(null)} className="rounded-full p-1 text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TRANSLATION */}
            {activeTab === 'TRANSLATION' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">源语言</label>
                    <select className="w-full rounded-md border border-border bg-background p-2 text-sm">
                      <option value="zh-CN">中文（简体）</option>
                      <option value="en">English</option>
                      <option value="ja">日本語</option>
                      <option value="ko">한국어</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">目标语言</label>
                    <select className="w-full rounded-md border border-border bg-background p-2 text-sm">
                      <option value="en">English</option>
                      <option value="zh-CN">中文（简体）</option>
                      <option value="ja">日本語</option>
                      <option value="ko">한국어</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">原文内容</label>
                  <Textarea placeholder="输入需要翻译的文字内容..." className="min-h-[120px]" />
                </div>
                <Button variant="outline" size="sm" className="w-full" disabled>
                  <Languages className="mr-1.5 h-4 w-4" />
                  翻译功能即将上线
                </Button>
              </div>
            )}
          </div>

          {/* 可见性控制 */}
          <div className="mt-4">
            <VisibilityControl
              visibility={visibility}
              onVisibilityChange={setVisibility}
            />
          </div>

          {/* 位置信息 */}
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium">位置信息（可选）</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="text" placeholder="添加拍摄地点..." className="pl-10" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>

          {/* 话题标签 */}
          <div className="mt-4">
            <TopicSelector
              selectedTopics={selectedTopics}
              onTopicsChange={setSelectedTopics}
              maxTopics={5}
            />
          </div>

          {/* 社群选择 */}
          <div className="mt-4">
            <CommunitySelector
              selectedCommunity={selectedCommunity}
              onCommunityChange={setSelectedCommunity}
            />
          </div>

          {/* 发布按钮 */}
          <div className="mt-6 flex justify-between">
            <PublishPreview
              data={{
                content,
                media: media ? {
                  type: media.type,
                  url: media.url,
                  vrFormat: media.vrFormat,
                  duration: media.duration,
                  width: media.width,
                  height: media.height,
                } : undefined,
                images: images.length > 0 ? images : undefined,
                link: linkData ? {
                  url: linkData.url,
                  title: linkData.title,
                  description: linkData.description,
                  favicon: linkData.favicon,
                } : undefined,
                topics: selectedTopics,
                community: selectedCommunity,
                visibility,
                location: location || undefined,
              }}
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.back()}>取消</Button>
              <Button className="gap-2" disabled={!canPublish} onClick={handlePublish}>
                {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {isPublishing ? '发布中...' : '发布内容'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 隐藏的文件输入 */}
      <input ref={fileInputRef} type="file" accept={getAccept()} className="hidden"
        onChange={(e) => handleFileInput(e.target.files)} />

      {/* 高级内容类型入口 */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-3">更多内容类型</h3>
          <div className="grid grid-cols-3 gap-3">
            <Link
              href="/upload/route-creator"
              className="flex flex-col items-center gap-2 rounded-lg border p-4 hover:bg-muted transition-colors"
            >
              <Route className="h-8 w-8 text-primary" />
              <div className="text-center">
                <p className="text-sm font-medium">创建路线</p>
                <p className="text-xs text-muted-foreground">GPX轨迹、途经点</p>
              </div>
            </Link>
            <Link
              href="/upload/journey-creator"
              className="flex flex-col items-center gap-2 rounded-lg border p-4 hover:bg-muted transition-colors"
            >
              <Map className="h-8 w-8 text-teal-500" />
              <div className="text-center">
                <p className="text-sm font-medium">创建旅程</p>
                <p className="text-xs text-muted-foreground">时间线、每日行程</p>
              </div>
            </Link>
            <Link
              href="/upload/guide-creator"
              className="flex flex-col items-center gap-2 rounded-lg border p-4 hover:bg-muted transition-colors"
            >
              <BookOpen className="h-8 w-8 text-orange-500" />
              <div className="text-center">
                <p className="text-sm font-medium">创建攻略</p>
                <p className="text-xs text-muted-foreground">美食、住宿、贴士</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
