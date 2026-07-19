'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Loader2, Send, MapPin, Sun, Wallet, Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { usePostStore } from '@/stores/post-store';
import { CreatePostPayload } from '@/lib/post-api';
import type { GuideCategory, BudgetLevel } from '@/types';
import { cn } from '@/lib/utils';
import { MultiImageUploader, UploadedImage } from '@/components/upload/multi-image-uploader';

const categories: { value: GuideCategory; label: string; icon: string }[] = [
  { value: 'FOOD', label: '美食', icon: '🍜' },
  { value: 'STAY', label: '住宿', icon: '🏨' },
  { value: 'TRANSPORT', label: '交通', icon: '🚌' },
  { value: 'TICKET', label: '门票', icon: '🎫' },
  { value: 'TIPS', label: '贴士', icon: '💡' },
];

const budgetLevels: { value: BudgetLevel; label: string; description: string }[] = [
  { value: 'BUDGET', label: '经济', description: '人均 < ¥200/天' },
  { value: 'MID', label: '中等', description: '人均 ¥200-500/天' },
  { value: 'LUXURY', label: '高端', description: '人均 > ¥500/天' },
];

const seasons = ['春季', '夏季', '秋季', '冬季', '全年'];

export default function GuideCreatorPage() {
  const router = useRouter();
  const { publishPost, isPublishing } = usePostStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [destination, setDestination] = useState('');
  const [category, setCategory] = useState<GuideCategory>('TIPS');
  const [budgetLevel, setBudgetLevel] = useState<BudgetLevel>('MID');
  const [bestSeason, setBestSeason] = useState('');
  const [richContent, setRichContent] = useState('');
  const [images, setImages] = useState<UploadedImage[]>([]);

  // 发布
  const canPublish = title.trim().length > 0 && content.trim().length > 0 && !isPublishing;

  const handlePublish = async () => {
    if (!canPublish) return;

    const payload: CreatePostPayload = {
      content: content.trim(),
      visibility: 'PUBLIC',
      postType: 'GUIDE',
      guideDetail: {
        destination: destination || undefined,
        category,
        bestSeason: bestSeason || undefined,
        budgetLevel,
        richContent: richContent || undefined,
      },
      mediaItems: images.length > 0 ? images.map((img, index) => ({
        type: 'IMAGE' as const,
        url: img.url,
        width: img.width,
        height: img.height,
        sortOrder: index,
      })) : undefined,
    };

    try {
      await publishPost(payload);
      toast.success('攻略发布成功');
      router.push('/feed');
    } catch {
      toast.error('发布失败，请重试');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">创建攻略</h1>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* 标题 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">攻略标题 *</label>
            <Input
              placeholder="给你的攻略起个名字..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* 摘要 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">攻略摘要 *</label>
            <Textarea
              placeholder="简要描述这篇攻略的内容..."
              className="min-h-[80px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* 目的地 */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              目的地
            </label>
            <Input
              placeholder="例如：云南大理、日本东京"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>

          <Separator />

          {/* 攻略分类 */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Tag className="h-4 w-4" />
              攻略分类
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors',
                    category === cat.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 预算等级 */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Wallet className="h-4 w-4" />
              预算等级
            </label>
            <div className="grid grid-cols-3 gap-3">
              {budgetLevels.map((budget) => (
                <button
                  key={budget.value}
                  type="button"
                  onClick={() => setBudgetLevel(budget.value)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition-colors',
                    budgetLevel === budget.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  <span className="text-sm font-medium">{budget.label}</span>
                  <span className="text-xs text-muted-foreground">{budget.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 最佳季节 */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Sun className="h-4 w-4" />
              最佳旅行季节
            </label>
            <div className="flex flex-wrap gap-2">
              {seasons.map((season) => (
                <button
                  key={season}
                  type="button"
                  onClick={() => setBestSeason(bestSeason === season ? '' : season)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-sm transition-colors',
                    bestSeason === season
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {season}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* 详细内容 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">详细内容</label>
            <p className="text-xs text-muted-foreground">
              分享你的旅行经验、实用建议、注意事项等
            </p>
            <Textarea
              placeholder="在这里写下你的详细攻略内容...

例如：
📍 景点推荐
🍜 美食推荐
🏨 住宿建议
🚗 交通攻略
💡 实用贴士"
              className="min-h-[300px]"
              value={richContent}
              onChange={(e) => setRichContent(e.target.value)}
            />
          </div>

          <Separator />

          {/* 攻略图片 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">攻略图片</label>
            <p className="text-xs text-muted-foreground">
              上传景点、美食、住宿等相关图片，让攻略更生动
            </p>
            <MultiImageUploader
              images={images}
              onImagesChange={setImages}
              maxImages={12}
            />
          </div>

          <Separator />

          {/* 发布按钮 */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.push('/upload')}>
              取消
            </Button>
            <Button className="gap-2" disabled={!canPublish} onClick={handlePublish}>
              {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isPublishing ? '发布中...' : '发布攻略'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
