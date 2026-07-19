'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Crop, RotateCw, Check, X, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface ImageCropperProps {
  imageUrl: string;
  onCrop: (croppedImageUrl: string) => void;
  onCancel: () => void;
  aspectRatio?: number; // 宽高比，如 1 表示 1:1，16/9 表示 16:9
}

export function ImageCropper({
  imageUrl,
  onCrop,
  onCancel,
  aspectRatio = 1,
}: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // 加载图片
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setImageSize({ width: img.width, height: img.height });
      setImageLoaded(true);

      // 初始化裁剪区域
      const container = containerRef.current;
      if (container) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const imgAspect = img.width / img.height;
        const containerAspect = containerWidth / containerHeight;

        let displayWidth, displayHeight;
        if (imgAspect > containerAspect) {
          displayWidth = containerWidth * 0.8;
          displayHeight = displayWidth / imgAspect;
        } else {
          displayHeight = containerHeight * 0.8;
          displayWidth = displayHeight * imgAspect;
        }

        const cropWidth = Math.min(displayWidth * 0.8, 300);
        const cropHeight = cropWidth / aspectRatio;

        setCropArea({
          x: (containerWidth - cropWidth) / 2,
          y: (containerHeight - cropHeight) / 2,
          width: cropWidth,
          height: cropHeight,
        });
      }
    };
    img.src = imageUrl;
  }, [imageUrl, aspectRatio]);

  // 绘制裁剪预览
  useEffect(() => {
    if (!imageLoaded || !canvasRef.current || !imageRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    canvas.width = containerWidth;
    canvas.height = containerHeight;

    ctx.clearRect(0, 0, containerWidth, containerHeight);

    // 绘制半透明遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, containerWidth, containerHeight);

    // 计算图片显示尺寸
    const img = imageRef.current;
    const imgAspect = img.width / img.height;
    const containerAspect = containerWidth / containerHeight;

    let displayWidth, displayHeight;
    if (imgAspect > containerAspect) {
      displayWidth = containerWidth * 0.8;
      displayHeight = displayWidth / imgAspect;
    } else {
      displayHeight = containerHeight * 0.8;
      displayWidth = displayHeight * imgAspect;
    }

    const offsetX = (containerWidth - displayWidth) / 2;
    const offsetY = (containerHeight - displayHeight) / 2;

    // 绘制裁剪区域（清除遮罩）
    ctx.save();
    ctx.beginPath();
    ctx.rect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    ctx.clip();
    ctx.clearRect(0, 0, containerWidth, containerHeight);

    // 绘制图片
    ctx.translate(containerWidth / 2, containerHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.drawImage(
      img,
      -displayWidth / 2 + (offsetX - containerWidth / 2 + displayWidth / 2),
      -displayHeight / 2 + (offsetY - containerHeight / 2 + displayHeight / 2),
      displayWidth,
      displayHeight
    );
    ctx.restore();

    // 绘制裁剪框边框
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

    // 绘制网格线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    const gridX = cropArea.width / 3;
    const gridY = cropArea.height / 3;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(cropArea.x + gridX * i, cropArea.y);
      ctx.lineTo(cropArea.x + gridX * i, cropArea.y + cropArea.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cropArea.x, cropArea.y + gridY * i);
      ctx.lineTo(cropArea.x + cropArea.width, cropArea.y + gridY * i);
      ctx.stroke();
    }
  }, [imageLoaded, cropArea, rotation, scale]);

  // 拖拽裁剪区域
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (
      x >= cropArea.x &&
      x <= cropArea.x + cropArea.width &&
      y >= cropArea.y &&
      y <= cropArea.y + cropArea.height
    ) {
      setIsDragging(true);
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
    }
  }, [cropArea]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragStart.x;
    const y = e.clientY - rect.top - dragStart.y;

    setCropArea((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(x, containerRef.current!.clientWidth - prev.width)),
      y: Math.max(0, Math.min(y, containerRef.current!.clientHeight - prev.height)),
    }));
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 裁剪图片
  const handleCrop = useCallback(() => {
    if (!imageRef.current || !containerRef.current) return;

    const img = imageRef.current;
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // 计算图片显示尺寸
    const imgAspect = img.width / img.height;
    const containerAspect = containerWidth / containerHeight;

    let displayWidth, displayHeight;
    if (imgAspect > containerAspect) {
      displayWidth = containerWidth * 0.8;
      displayHeight = displayWidth / imgAspect;
    } else {
      displayHeight = containerHeight * 0.8;
      displayWidth = displayHeight * imgAspect;
    }

    const offsetX = (containerWidth - displayWidth) / 2;
    const offsetY = (containerHeight - displayHeight) / 2;

    // 计算裁剪区域在原图中的位置
    const scaleX = img.width / displayWidth;
    const scaleY = img.height / displayHeight;

    const cropX = (cropArea.x - offsetX) * scaleX;
    const cropY = (cropArea.y - offsetY) * scaleY;
    const cropWidth = cropArea.width * scaleX;
    const cropHeight = cropArea.height * scaleY;

    // 创建裁剪后的图片
    const canvas = document.createElement('canvas');
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCrop(croppedImageUrl);
  }, [cropArea, onCrop]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-2xl bg-background rounded-xl overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">裁剪图片</h3>
          <button onClick={onCancel} className="rounded-full p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 裁剪区域 */}
        <div
          ref={containerRef}
          className="relative h-[400px] cursor-move overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>

        {/* 工具栏 */}
        <div className="p-4 border-t space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <ZoomOut className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[scale * 100]}
                onValueChange={([value]) => setScale(value / 100)}
                min={50}
                max={200}
                step={1}
                className="flex-1"
              />
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
            >
              <RotateCw className="h-4 w-4 mr-1" />
              旋转
            </Button>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              取消
            </Button>
            <Button onClick={handleCrop}>
              <Check className="h-4 w-4 mr-1" />
              确认裁剪
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
