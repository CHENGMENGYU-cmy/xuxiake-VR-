'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Upload, Video, Image, Mic, Link2, Languages, FileUp, MapPin, X, Loader2, Play, Volume2, Send, ArrowLeftRight, PenLine, Lock } from 'lucide-react';
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
import type { VrFormat, Topic, Community, Visibility, MoodType, WeatherType } from '@/types';
import { MoodEmoji, WeatherEmoji, MoodLabel, WeatherLabel } from '@/types';
import { cn } from '@/lib/utils';
import { MultiImageUploader, UploadedImage } from '@/components/upload/multi-image-uploader';
import { AuthGuard } from '@/components/auth-guard';
import { TopicSelector } from '@/components/upload/topic-selector';
import { CommunitySelector } from '@/components/upload/community-selector';
import { DraftList } from '@/components/upload/draft-list';
import { PublishPreview } from '@/components/upload/publish-preview';
import { saveDraftToLocal, saveDraftToList, clearLocalDraft, deleteDraftFromList } from '@/lib/draft-api';
import { translateText, detectLanguage } from '@/lib/translation-api';

type UploadTab = 'VIDEO' | 'IMAGE' | 'AUDIO' | 'DIARY' | 'JOURNEY';

const tabContentTypes: Record<UploadTab, string | undefined> = {
  VIDEO: 'VR_MEDIA',
  IMAGE: 'VR_MEDIA',
  AUDIO: 'VR_MEDIA',
  DIARY: 'NOTE',
  JOURNEY: 'JOURNEY',
};

const tabs: { key: UploadTab; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'VIDEO', label: '第一视角', icon: Video, color: 'text-teal-500' },
  { key: 'IMAGE', label: '瞬间捕获', icon: Image, color: 'text-orange-500' },
  { key: 'AUDIO', label: '语音记录', icon: Mic, color: 'text-accent' },
  { key: 'DIARY', label: '写日记', icon: PenLine, color: 'text-indigo-500' },
  { key: 'JOURNEY', label: '写游记', icon: Send, color: 'text-primary' },
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
  return (
    <AuthGuard>
      <UploadContent />
    </AuthGuard>
  );
}

function UploadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { publishPost, isPublishing } = usePostStore();

  // 根据 URL 参数决定初始 Tab
  const initialTab: UploadTab = searchParams.get('level') === 'DIARY' ? 'DIARY' : 'VIDEO';
  const [activeTab, setActiveTab] = useState<UploadTab>(initialTab);
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
  const [showLinkAddon, setShowLinkAddon] = useState(false);
  const [showTranslationAddon, setShowTranslationAddon] = useState(false);

  // Translation state
  const [sourceLang, setSourceLang] = useState('zh-CN');
  const [targetLang, setTargetLang] = useState('en');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [translating, setTranslating] = useState(false);

  // 日记元数据状态
  const [mood, setMood] = useState<MoodType | ''>('');
  const [weather, setWeather] = useState<WeatherType | ''>('');
  const [draftRefreshKey, setDraftRefreshKey] = useState(0);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const lastSavedContentRef = useRef<string>('');

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

  // 不再自动加载草稿，只在用户主动选择草稿时加载

  // 初始 Tab 是日记时，自动设置私密可见性
  useEffect(() => {
    if (initialTab === 'DIARY') {
      setVisibility('PRIVATE');
    }
  }, [initialTab]);

  // 自动保存草稿（防抖）
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // 只有有内容时才保存
    if (content.trim() || media || images.length > 0 || linkData) {
      const formData = {
        activeTab,
        location,
        visibility,
        vrFormat,
        hasMedia: !!media,
        imageCount: images.length,
        hasLink: !!linkData,
      };
      autoSaveTimerRef.current = setTimeout(() => {
        saveDraftToLocal({ content, postType: media?.type === 'VIDEO' ? 'VR_MEDIA' : 'NOTE', formData });
      }, 5000);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [content, media, images, linkData, activeTab, location, visibility, vrFormat]);

  // 选择草稿
  const handleSelectDraft = (draft: { id: string; content: string; postType: string; formData?: Record<string, any> }) => {
    setContent(draft.content);
    setCurrentDraftId(draft.id); // 记住正在编辑的草稿ID
    if (draft.formData) {
      if (draft.formData.activeTab) setActiveTab(draft.formData.activeTab);
      if (draft.formData.location) setLocation(draft.formData.location || '');
      if (draft.formData.visibility) setVisibility(draft.formData.visibility);
      if (draft.formData.vrFormat) setVrFormat(draft.formData.vrFormat);
    }
  };

  // 发布后清除草稿
  const handlePublishSuccess = () => {
    clearLocalDraft();
  };

  // 手动保存草稿到草稿箱
  const handleSaveDraft = () => {
    if (!content.trim() && !media && images.length === 0) return;
    // 如果是编辑已有草稿且内容未变，跳过
    if (currentDraftId && content === lastSavedContentRef.current) {
      toast.info('内容未变化');
      return;
    }
    const postTypeMap: Record<UploadTab, string> = {
      VIDEO: '第一视角',
      IMAGE: '瞬间捕获',
      AUDIO: '语音记录',
      DIARY: '日记',
      JOURNEY: '游记',
    };
    saveDraftToList({
      id: currentDraftId || `draft-${Date.now()}`,
      title: content.slice(0, 30) || '无标题',
      content,
      postType: postTypeMap[activeTab] || 'NOTE',
      formData: { activeTab, location, visibility, vrFormat },
      preview: content.slice(0, 80),
    });
    lastSavedContentRef.current = content;
    toast.success('草稿已保存');
    setDraftRefreshKey(k => k + 1);
  };

  const resetMedia = () => {
    setMedia(null);
    setRecordedBlob(null);
    setVrFormat('STANDARD');
    setImages([]);
  };

  const handleTabChange = (tab: UploadTab) => {
    if (tab === 'JOURNEY') { router.push('/upload/journey-creator'); return; }
    setActiveTab(tab);
    setCurrentDraftId(null);
    // 切换Tab时清空所有内容
    setContent('');
    setLocation('');
    setSelectedTopics([]);
    setSelectedCommunity(null);
    resetMedia();
    setLinkData(null);
    setLinkUrl('');
    setShowLinkAddon(false);
    setShowTranslationAddon(false);
    setMood('');
    setWeather('');
    // 日记Tab默认私密，其他公开
    setVisibility(tab === 'DIARY' ? 'PRIVATE' : 'PUBLIC');
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

  // Translation
  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setTranslating(true);
    try {
      const result = await translateText(sourceText, sourceLang, targetLang);
      setTranslatedText(result.translatedText);
      toast.success('翻译完成');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '翻译失败，请重试');
    }
    setTranslating(false);
  };

  // 交换语言
  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  // 自动检测语言
  const handleAutoDetect = () => {
    if (sourceText.trim()) {
      const detected = detectLanguage(sourceText);
      setSourceLang(detected);
      toast.info(`检测到语言: ${detected === 'zh-CN' ? '中文' : detected === 'ja' ? '日语' : detected === 'ko' ? '韩语' : '英语'}`);
    }
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

  // Publish — 日记Tab只需要文字内容，其他Tab需要媒体或内容
  const canPublish = activeTab === 'DIARY'
    ? (content.trim().length > 0 && !isPublishing)
    : ((content.trim().length > 0 || media || images.length > 0 || linkData) && !isPublishing && !uploading);

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

    // 确定帖子类型和内容层级
    let postType: CreatePostPayload['postType'] = 'NOTE';
    let contentLevel: string | undefined;
    if (activeTab === 'DIARY') {
      postType = 'NOTE';
      contentLevel = 'DIARY';
    } else if (media?.type === 'VIDEO') {
      postType = 'VR_MEDIA';
      contentLevel = 'SNAPSHOT';
    } else if (media?.type === 'AUDIO') {
      postType = 'MOMENT';
      contentLevel = 'SNAPSHOT';
    } else if (images.length > 0) {
      postType = 'VR_MEDIA';
      contentLevel = 'SNAPSHOT';
    } else if (content.trim()) {
      contentLevel = 'SNAPSHOT';
    }

    const payload: CreatePostPayload = {
      content: content.trim() || '',
      visibility: activeTab === 'DIARY' ? 'PRIVATE' : visibility,
      postType,
      contentLevel,
      mediaItems: mediaItems.length > 0 ? mediaItems : undefined,
      topicNames: selectedTopics.length > 0 ? selectedTopics.map(t => t.name) : undefined,
      communityId: selectedCommunity?.id,
      location: location.trim() ? { lat: 0, lng: 0, name: location.trim() } : undefined,
      vrMetadata: activeTab === 'DIARY' && (mood || weather) ? {
        mood: mood || undefined,
        weather: weather || undefined,
      } : undefined,
    };

    try {
      await publishPost(payload);
      clearLocalDraft();
      if (currentDraftId) { deleteDraftFromList(currentDraftId); setDraftRefreshKey(k => k + 1); }
      setCurrentDraftId(null);
      if (activeTab === 'DIARY') {
        toast.success('日记已保存');
        router.push('/diaries');
      } else {
        toast.success('发布成功');
        router.push('/feed');
      }
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
    <div className="mx-auto max-w-3xl space-y-6 pb-8">
      {/* 页面标题 */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
            <Upload className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">分享见闻</h1>
            <p className="text-sm text-muted-foreground">记录你的旅行瞬间</p>
          </div>
        </div>
      </div>

      {/* 草稿列表 */}
      <DraftList onSelectDraft={handleSelectDraft} refreshKey={draftRefreshKey} />

      {/* 内容类型选择卡片 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all',
                isActive
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-muted bg-card hover:border-primary/30 hover:bg-accent/50'
              )}
            >
              <Icon className={cn('h-4 w-4', isActive ? 'text-primary' : tab.color)} />
              <span className={cn(
                'text-sm font-medium',
                isActive ? 'text-primary' : 'text-foreground'
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 主要内容区域 */}
      <Card className="shadow-sm">
        <CardContent className="p-6 space-y-6">
          {/* 文字内容 - 写日记模式 */}
          {activeTab === 'DIARY' && (
            <>
              <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 dark:border-indigo-900 dark:from-indigo-950/30 dark:to-purple-950/30 px-4 py-3">
                <Lock className="h-5 w-5 text-indigo-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">私密日记</p>
                  <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80">
                    仅自己可见，记录内心感受
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-100 dark:bg-indigo-900">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">1</span>
                  </span>
                  今日感想
                </label>
                <Textarea
                  placeholder="写下今天的所见所闻、所思所想..."
                  className="min-h-[250px] resize-none"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{content.length} 字</span>
                  <span>{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</span>
                </div>
              </div>

              {/* 心情选择 */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-100 dark:bg-indigo-900">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">2</span>
                  </span>
                  今天的心情
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(MoodEmoji).map(([key, emoji]) => (
                    <button
                      key={key}
                      onClick={() => setMood(mood === key ? '' : key as MoodType)}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all',
                        mood === key
                          ? 'bg-indigo-100 dark:bg-indigo-900 border-2 border-indigo-500 shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80 border-2 border-transparent'
                      )}
                    >
                      <span className="text-xl">{emoji}</span>
                      <span className="font-medium">{MoodLabel[key as MoodType]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 天气选择 */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-100 dark:bg-indigo-900">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">3</span>
                  </span>
                  今天的天气
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(WeatherEmoji).map(([key, emoji]) => (
                    <button
                      key={key}
                      onClick={() => setWeather(weather === key ? '' : key as WeatherType)}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all',
                        weather === key
                          ? 'bg-indigo-100 dark:bg-indigo-900 border-2 border-indigo-500 shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80 border-2 border-transparent'
                      )}
                    >
                      <span className="text-xl">{emoji}</span>
                      <span className="font-medium">{WeatherLabel[key as WeatherType]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 文字内容 - 其他模式 */}
          {activeTab !== 'DIARY' && (
            <div className="space-y-3">
              <label className="text-sm font-medium">说点什么...</label>
              <Textarea
                placeholder="分享你的旅行体验..."
                className="min-h-[120px] resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          )}

          {/* 媒体上传区域 */}
          <div className="space-y-3">
            {/* VIDEO */}
            {activeTab === 'VIDEO' && (
              <>
                {media?.type === 'VIDEO' ? (
                  <div className="space-y-3">
                    <div className="relative overflow-hidden rounded-xl border-2 border-primary/20 bg-black">
                      <video src={media.url} className="max-h-80 w-full object-contain" controls />
                      <button onClick={resetMedia} className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {(media.duration ?? 0) > 0 && <Badge variant="secondary" className="font-mono">{formatDuration(media.duration)}</Badge>}
                      {(media.width ?? 0) > 0 && <Badge variant="outline">{media.width}x{media.height}</Badge>}
                      {media.size && <Badge variant="outline">{formatSize(media.size)}</Badge>}
                    </div>
                    {/* VR格式选择 */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium shrink-0">VR格式</label>
                      <select
                        value={vrFormat}
                        onChange={(e) => { const v = e.target.value as VrFormat; setVrFormat(v); setMedia(m => m ? { ...m, vrFormat: v } : null); }}
                        className="h-8 rounded-lg border border-border bg-background px-2 text-xs focus:border-primary"
                      >
                        {vrFormats.map(f => (
                          <option key={f.value} value={f.value}>{f.label} - {f.desc}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const files = e.dataTransfer.files;
                      if (files.length > 0) handleVideoSelect(files);
                    }}
                    className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center transition-all hover:border-primary hover:bg-primary/10">
                    {uploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    ) : (
                      <Video className="h-6 w-6 text-primary" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{uploading ? '上传中...' : '点击或拖拽视频到此处'}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">MP4、MOV、WebM，最大 500MB</p>
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
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium shrink-0">VR格式</label>
                    <select
                      value={vrFormat}
                      onChange={(e) => setVrFormat(e.target.value as VrFormat)}
                      className="h-8 rounded-lg border border-border bg-background px-2 text-xs focus:border-primary"
                    >
                      {vrFormats.map(f => (
                        <option key={f.value} value={f.value}>{f.label} - {f.desc}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* AUDIO */}
            {activeTab === 'AUDIO' && (
              <>
                {media?.type === 'AUDIO' ? (
                  <div className="space-y-3">
                    <div className="relative flex items-center gap-3 rounded-lg border-2 border-accent/20 bg-accent/5 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 flex-shrink-0">
                        <Volume2 className="h-5 w-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <audio src={media.url} controls className="w-full" />
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {(media.duration ?? 0) > 0 && <Badge variant="secondary" className="font-mono">{formatDuration(media.duration)}</Badge>}
                          {media.size && <Badge variant="outline">{formatSize(media.size)}</Badge>}
                        </div>
                      </div>
                      <button onClick={resetMedia} className="rounded-full p-2 text-muted-foreground hover:text-destructive transition-colors">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ) : recordedBlob ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-lg border-2 border-accent/20 bg-accent/5 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                        <Volume2 className="h-5 w-5 text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-2">录音完成</p>
                        <audio src={URL.createObjectURL(recordedBlob)} controls className="w-full" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button size="sm" onClick={uploadRecordedAudio} disabled={uploading}>
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                        上传录音
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setRecordedBlob(null)}>重新录制</Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const files = e.dataTransfer.files;
                      if (files.length > 0) handleAudioSelect(files);
                    }}
                    className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-accent/30 bg-accent/5 p-4 text-center transition-all hover:border-accent hover:bg-accent/10">
                    {uploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-accent" />
                    ) : (
                      <Mic className="h-6 w-6 text-accent" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{uploading ? '上传中...' : '上传或录制音频'}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">MP3、WAV、AAC、OGG，最大 100MB</p>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <FileUp className="mr-2 h-4 w-4" />
                        选择文件
                      </Button>
                      <Button variant="outline" size="sm" onClick={isRecording ? stopRecording : startRecording}
                        className={isRecording ? 'border-red-300 text-red-500 bg-red-50 dark:bg-red-950/30' : ''}>
                        <Mic className="mr-2 h-4 w-4" />
                        {isRecording ? '停止录制' : '录制音频'}
                      </Button>
                    </div>
                    {isRecording && (
                      <div className="w-full max-w-xs space-y-3 mt-4">
                        <div className="flex items-center justify-center gap-2 text-sm font-medium text-red-500">
                          <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
                          <span className="font-mono">{Math.floor(recordingDuration / 60)}:{String(recordingDuration % 60).padStart(2, '0')}</span>
                          <span className="text-xs text-muted-foreground">录制中</span>
                        </div>
                        <div className="flex h-10 items-end gap-1 rounded-xl bg-red-50 dark:bg-red-950/30 px-3 py-2">
                          {waveform.map((v, i) => (
                            <div key={i} className="w-1 shrink-0 rounded-full bg-red-400/60" style={{ height: `${Math.max(4, v * 32)}px` }} />
                          ))}
                          {waveform.length === 0 && <div className="h-1 w-full rounded-full bg-red-200 dark:bg-red-800" />}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* DIARY - 附加功能 */}
            {activeTab === 'DIARY' && (
              <>
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-100 dark:bg-indigo-900">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">4</span>
                    </span>
                    配图（可选）
                  </label>
                  <MultiImageUploader
                    images={images}
                    onImagesChange={setImages}
                    maxImages={9}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-100 dark:bg-indigo-900">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">5</span>
                    </span>
                    地点（可选）
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input type="text" placeholder="记录你在哪里..." className="pl-10" value={location} onChange={(e) => setLocation(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-100 dark:bg-indigo-900">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">6</span>
                    </span>
                    话题标签（可选）
                  </label>
                  <TopicSelector
                    selectedTopics={selectedTopics}
                    onTopicsChange={setSelectedTopics}
                    maxTopics={5}
                    content={content}
                  />
                </div>
              </>
            )}

            {/* LINK 附加 */}
            {showLinkAddon && (
              <div className="space-y-4 rounded-xl border-2 border-muted bg-muted/30 p-4">
                <div className="flex gap-3">
                  <Input type="url" placeholder="https://example.com" value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleLinkConfirm(); } }}
                    disabled={loadingLink}
                    className="flex-1" />
                  <Button size="sm" onClick={handleLinkConfirm} disabled={!linkUrl.trim() || loadingLink}>
                    {loadingLink ? <Loader2 className="h-4 w-4 animate-spin" /> : '获取预览'}
                  </Button>
                </div>
                {linkData && (
                  <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
                    {linkData.favicon && <img src={linkData.favicon} alt="" className="h-6 w-6 rounded" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{linkData.title}</p>
                      {linkData.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{linkData.description}</p>}
                      <p className="text-xs text-muted-foreground/70 truncate mt-1">{linkData.url}</p>
                    </div>
                    <button onClick={() => setLinkData(null)} className="rounded-full p-2 text-muted-foreground hover:text-destructive transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TRANSLATION 附加 */}
            {showTranslationAddon && (
              <div className="space-y-4 rounded-xl border-2 border-muted bg-muted/30 p-4">
                <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-end">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">源语言</label>
                      <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleAutoDetect}>
                        自动检测
                      </Button>
                    </div>
                    <select
                      className="w-full rounded-lg border-2 border-border bg-background p-2.5 text-sm focus:border-primary"
                      value={sourceLang}
                      onChange={(e) => setSourceLang(e.target.value)}
                    >
                      <option value="zh-CN">中文（简体）</option>
                      <option value="en">English</option>
                      <option value="ja">日本語</option>
                      <option value="ko">한국어</option>
                    </select>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="mb-0.5 h-10 w-10"
                    onClick={handleSwapLanguages}
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">目标语言</label>
                    <select
                      className="w-full rounded-lg border-2 border-border bg-background p-2.5 text-sm focus:border-primary"
                      value={targetLang}
                      onChange={(e) => setTargetLang(e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="zh-CN">中文（简体）</option>
                      <option value="ja">日本語</option>
                      <option value="ko">한국어</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">原文内容</label>
                  <Textarea
                    placeholder="输入需要翻译的文字内容..."
                    className="min-h-[120px] resize-none"
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                  />
                </div>
                <Button
                  variant="default"
                  size="sm"
                  className="w-full"
                  onClick={handleTranslate}
                  disabled={!sourceText.trim() || translating}
                >
                  {translating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Languages className="mr-2 h-4 w-4" />
                  )}
                  {translating ? '翻译中...' : '开始翻译'}
                </Button>
                {translatedText && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">翻译结果</label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => {
                          navigator.clipboard.writeText(translatedText);
                          toast.success('已复制到剪贴板');
                        }}
                      >
                        复制
                      </Button>
                    </div>
                    <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                      <p className="text-sm whitespace-pre-wrap">{translatedText}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 附加内容按钮 - 仅在非日记模式显示 */}
          {activeTab !== 'DIARY' && (
            <div className="flex flex-wrap gap-3">
              <Button
                variant={showLinkAddon ? 'default' : 'outline'}
                size="sm"
                className="gap-1.5"
                onClick={() => setShowLinkAddon(!showLinkAddon)}
              >
                <Link2 className="h-3.5 w-3.5" />
                {showLinkAddon ? '收起链接' : '添加链接'}
              </Button>
              <Button
                variant={showTranslationAddon ? 'default' : 'outline'}
                size="sm"
                className="gap-1.5"
                onClick={() => setShowTranslationAddon(!showTranslationAddon)}
              >
                <Languages className="h-3.5 w-3.5" />
                {showTranslationAddon ? '收起翻译' : '翻译内容'}
              </Button>
            </div>
          )}

          {/* 设置区域 - 仅在非日记模式显示 */}
          {activeTab !== 'DIARY' && (
            <>
              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">发布设置</h3>

                {/* 可见性 + 位置并排 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">可见范围</label>
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value as Visibility)}
                      className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm focus:border-primary"
                    >
                      <option value="PUBLIC">🌐 公开</option>
                      <option value="FOLLOWERS">👥 关注可见</option>
                      <option value="PRIVATE">🔒 仅自己</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">位置信息</label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input type="text" placeholder="添加拍摄地点..." className="h-9 pl-8 text-sm" value={location} onChange={(e) => setLocation(e.target.value)} />
                    </div>
                  </div>
                </div>

                <TopicSelector
                  selectedTopics={selectedTopics}
                  onTopicsChange={setSelectedTopics}
                  maxTopics={5}
                  content={content}
                />

                <CommunitySelector
                  selectedCommunity={selectedCommunity}
                  onCommunityChange={setSelectedCommunity}
                />
              </div>
            </>
          )}

          {/* 发布按钮 */}
          <div className="flex items-center justify-between pt-4 border-t">
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
              <Button variant="outline" size="lg" onClick={() => router.push(activeTab === 'DIARY' ? '/diaries' : '/feed')}>取消</Button>
              <Button variant="outline" size="lg" onClick={handleSaveDraft}>存草稿</Button>
              <Button size="lg" className="gap-2 px-8" disabled={!canPublish} onClick={handlePublish}>
                {isPublishing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                {isPublishing ? '发布中...' : activeTab === 'DIARY' ? '保存日记' : '发布内容'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 隐藏的文件输入 */}
      <input ref={fileInputRef} type="file" accept={getAccept()} className="hidden"
        onChange={(e) => handleFileInput(e.target.files)} />
    </div>
  );
}
