'use client';

import { useRef, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Loader2, Upload, X, Image as ImageIcon, Video as VideoIcon, Mic, Check,
} from 'lucide-react';
import { uploadImage, uploadVideo, uploadAudio } from '@/lib/media-api';
import { createPost } from '@/lib/post-api';
import { useUIStore } from '@/stores/ui-store';
import { useSnapStore } from '@/stores/snap-store';

type MediaKind = 'IMAGE' | 'VIDEO' | 'AUDIO';

interface PendingFile {
  id: string;
  file: File;
  kind: MediaKind;
}

const KIND_META: Record<MediaKind, { label: string; icon: typeof ImageIcon; color: string }> = {
  IMAGE: { label: '图片', icon: ImageIcon, color: 'text-orange-500' },
  VIDEO: { label: '视频', icon: VideoIcon, color: 'text-teal-500' },
  AUDIO: { label: '语音', icon: Mic, color: 'text-accent' },
};

function detectKind(file: File): MediaKind {
  if (file.type.startsWith('image/')) return 'IMAGE';
  if (file.type.startsWith('video/')) return 'VIDEO';
  if (file.type.startsWith('audio/')) return 'AUDIO';
  return 'IMAGE';
}

/** 全局「上传素材」弹窗：把本地文件存为私有素材（闪拍 SNAPSHOT），供日记/游记创作引用 */
export function SnapUploadDialog() {
  const open = useUIStore((s) => s.uploadDialogOpen);
  const closeUpload = useUIStore((s) => s.closeUploadDialog);
  const fetchSnaps = useSnapStore((s) => s.fetchSnaps);
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [note, setNote] = useState('');
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setPending([]);
    setNote('');
    setDone(0);
  };

  const handleClose = (nextOpen: boolean) => {
    closeUpload();
    if (!nextOpen) reset();
  };

  const pickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const next = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      kind: detectKind(file),
    }));
    setPending((prev) => [...prev, ...next].slice(0, 9));
    e.target.value = '';
  };

  const removeFile = (id: string) => {
    setPending((prev) => prev.filter((p) => p.id !== id));
  };

  const uploadMedia = async (item: PendingFile) => {
    if (item.kind === 'VIDEO') {
      const res = await uploadVideo(item.file);
      return { type: 'VIDEO' as const, url: res.url, duration: res.duration || 0 };
    }
    if (item.kind === 'AUDIO') {
      const res = await uploadAudio(item.file);
      return { type: 'AUDIO' as const, url: res.url, duration: res.duration || 0 };
    }
    const res = await uploadImage(item.file);
    return { type: 'IMAGE' as const, url: res.url, width: res.width || 0, height: res.height || 0 };
  };

  const handleUpload = async () => {
    if (pending.length === 0) return;
    setUploading(true);
    setDone(0);
    try {
      for (let i = 0; i < pending.length; i++) {
        const media = await uploadMedia(pending[i]);
        await createPost({
          content: note.trim(),
          visibility: 'PRIVATE',
          contentLevel: 'SNAPSHOT',
          mediaItems: [media],
        });
        setDone(i + 1);
      }
      toast.success(`已存入素材库 ${pending.length} 条素材`);
      fetchSnaps();
      reset();
      closeUpload();
    } catch {
      toast.error('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>上传素材</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {pending.length === 0 ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center transition-all hover:border-primary hover:bg-primary/10"
            >
              {uploading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <Upload className="h-6 w-6 text-primary" />}
              <div>
                <p className="text-sm font-medium">点击选择本地文件</p>
                <p className="mt-0.5 text-xs text-muted-foreground">支持图片（可多张）、视频、语音 · 存入后为私有素材</p>
              </div>
            </button>
          ) : (
            <div className="space-y-2">
              {pending.map((item) => {
                const meta = KIND_META[item.kind];
                const Icon = meta.icon;
                return (
                  <div key={item.id} className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                    <Icon className={`h-5 w-5 shrink-0 ${meta.color}`} />
                    <span className="min-w-0 flex-1 truncate text-sm">{item.file.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{meta.label}</span>
                    <button type="button" onClick={() => removeFile(item.id)} className="rounded-full p-1 text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
              <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                继续添加
              </Button>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">文字备注（可选）</label>
            <Textarea
              placeholder="比如：漓江晨雾、山顶日落... AI 生成时会引用"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[60px] resize-none text-sm"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {pending.length > 0 ? `${done}/${pending.length} 已入库` : '素材仅自己可见，不会发布到社区'}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleClose(false)} disabled={uploading}>取消</Button>
              <Button size="sm" onClick={handleUpload} disabled={pending.length === 0 || uploading} className="gap-1.5">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {uploading ? '上传中...' : `存入素材库${pending.length > 0 ? `（${pending.length}）` : ''}`}
              </Button>
            </div>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*"
          className="hidden"
          onChange={pickFiles}
        />
      </DialogContent>
    </Dialog>
  );
}
