'use client';

import { useState, useRef, useCallback } from 'react';
import { Image, X, Loader2, Star, GripVertical, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadImage, getImageDimensions } from '@/lib/media-api';
import { toast } from 'sonner';

export interface UploadedImage {
  id: string;
  url: string;
  width: number;
  height: number;
  originalName: string;
  size: number;
  isCover: boolean;
}

interface MultiImageUploaderProps {
  maxImages?: number;
  onImagesChange: (images: UploadedImage[]) => void;
  images: UploadedImage[];
}

export function MultiImageUploader({
  maxImages = 9,
  onImagesChange,
  images,
}: MultiImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const remaining = maxImages - images.length;
      if (remaining <= 0) {
        toast.warning(`最多只能上传 ${maxImages} 张图片`);
        return;
      }

      const filesToUpload = Array.from(files).slice(0, remaining);
      setUploading(true);

      try {
        const uploadPromises = filesToUpload.map(async (file) => {
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

          return {
            id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            url: result.url,
            width,
            height,
            originalName: result.originalName,
            size: result.size,
            isCover: false,
          };
        });

        const newImages = await Promise.all(uploadPromises);
        const updatedImages = [...images, ...newImages];

        // 如果是第一批图片，第一张设为封面
        if (images.length === 0 && updatedImages.length > 0) {
          updatedImages[0].isCover = true;
        }

        onImagesChange(updatedImages);
        toast.success(`成功上传 ${newImages.length} 张图片`);
      } catch (error) {
        toast.error('图片上传失败，请重试');
      }

      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [images, maxImages, onImagesChange]
  );

  const handleRemove = useCallback(
    (index: number) => {
      const newImages = [...images];
      const removedImage = newImages.splice(index, 1)[0];

      // 如果删除的是封面，将第一张设为封面
      if (removedImage.isCover && newImages.length > 0) {
        newImages[0].isCover = true;
      }

      onImagesChange(newImages);
    },
    [images, onImagesChange]
  );

  const handleSetCover = useCallback(
    (index: number) => {
      const newImages = images.map((img, i) => ({
        ...img,
        isCover: i === index,
      }));
      onImagesChange(newImages);
    },
    [images, onImagesChange]
  );

  // 拖拽排序
  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === index) return;
      setDragOverIndex(index);
    },
    [draggedIndex]
  );

  const handleDrop = useCallback(
    (index: number) => {
      if (draggedIndex === null || draggedIndex === index) {
        setDraggedIndex(null);
        setDragOverIndex(null);
        return;
      }

      const newImages = [...images];
      const [draggedImage] = newImages.splice(draggedIndex, 1);
      newImages.splice(index, 0, draggedImage);

      onImagesChange(newImages);
      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [draggedIndex, images, onImagesChange]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          图片 ({images.length}/{maxImages})
        </label>
        {images.length > 0 && (
          <span className="text-xs text-muted-foreground">
            拖拽调整顺序，星标设为封面
          </span>
        )}
      </div>

      {/* 图片网格 - 统一入口 */}
      <div className="grid grid-cols-3 gap-3">
        {images.map((image, index) => (
          <div
            key={image.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
            className={cn(
              'group relative aspect-square overflow-hidden rounded-lg border-2 transition-all',
              draggedIndex === index && 'opacity-50 scale-95',
              dragOverIndex === index && 'border-primary',
              image.isCover ? 'border-primary' : 'border-border'
            )}
          >
            <img
              src={image.url}
              alt={image.originalName}
              className="h-full w-full object-cover"
            />

            {/* 操作按钮 */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleSetCover(index)}
                className={cn(
                  'rounded-full p-2 transition-colors',
                  image.isCover
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white/80 text-gray-700 hover:bg-white'
                )}
                title="设为封面"
              >
                <Star className="h-4 w-4" fill={image.isCover ? 'currentColor' : 'none'} />
              </button>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="rounded-full bg-white/80 p-2 text-gray-700 hover:bg-white hover:text-destructive transition-colors"
                title="删除"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 封面标识 */}
            {image.isCover && (
              <div className="absolute bottom-1.5 left-1.5 rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground font-medium">
                封面
              </div>
            )}

            {/* 拖拽手柄 */}
            <div className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
              <GripVertical className="h-5 w-5 text-white drop-shadow" />
            </div>
          </div>
        ))}

        {/* 添加图片按钮 - 始终显示 */}
        {canAddMore && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={cn(
              'aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 transition-colors hover:border-primary hover:bg-primary/5',
              uploading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <>
                <Plus className="h-8 w-8 text-muted-foreground/50" />
                <span className="text-sm text-muted-foreground">添加图片</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
    </div>
  );
}
