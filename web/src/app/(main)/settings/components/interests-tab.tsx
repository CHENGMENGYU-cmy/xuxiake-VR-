'use client';

import { useState, useEffect } from 'react';
import { Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getAllTags, getUserInterests, setUserInterests } from '@/lib/social-api';
import type { InterestTag, TagCategory } from '@/types';

const categoryLabels: Record<TagCategory, { label: string; description: string }> = {
  TRAVEL: { label: '旅行目的地', description: '你喜欢去什么样的地方旅行？' },
  VR: { label: 'VR技术', description: '你对哪些VR技术感兴趣？' },
  ACTIVITY: { label: '户外活动', description: '你喜欢哪些活动？' },
  CULTURE: { label: '文化体验', description: '你对哪些文化体验感兴趣？' },
  OTHER: { label: '其他', description: '其他兴趣偏好' },
};

export function InterestsTab() {
  const [allTags, setAllTags] = useState<Record<string, InterestTag[]>>({});
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [initialTags, setInitialTags] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tags, userInterests] = await Promise.all([
          getAllTags(),
          getUserInterests(),
        ]);
        setAllTags(tags);
        const tagIds = new Set(userInterests.map((t) => t.id));
        setSelectedTags(tagIds);
        setInitialTags(tagIds);
      } catch (error) {
        console.error('Failed to fetch interests data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) {
        next.delete(tagId);
      } else {
        next.add(tagId);
      }
      return next;
    });
  };

  const hasChanges = () => {
    if (selectedTags.size !== initialTags.size) return true;
    for (const id of selectedTags) {
      if (!initialTags.has(id)) return true;
    }
    return false;
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await setUserInterests(Array.from(selectedTags));
      setInitialTags(new Set(selectedTags));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save interests:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>兴趣标签</CardTitle>
        <CardDescription>
          选择你感兴趣的标签，帮助我们为你推荐志同道合的朋友和社群。至少选择 3 个标签。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(categoryLabels).map(([category, { label, description }]) => {
          const tags = allTags[category] || [];
          if (tags.length === 0) return null;

          return (
            <div key={category}>
              <h3 className="mb-1 font-medium">{label}</h3>
              <p className="mb-3 text-sm text-muted-foreground">{description}</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const isSelected = selectedTags.has(tag.id);
                  return (
                    <Badge
                      key={tag.id}
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer select-none transition-colors hover:opacity-80"
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.icon && <span className="mr-1">{tag.icon}</span>}
                      {tag.name}
                      {isSelected && <Check className="ml-1 h-3 w-3" />}
                    </Badge>
                  );
                })}
              </div>
              <Separator className="mt-4" />
            </div>
          );
        })}

        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            已选择 <span className="font-medium text-foreground">{selectedTags.size}</span> 个标签
          </p>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <Check className="h-4 w-4" /> 已保存
              </span>
            )}
            <Button onClick={handleSave} disabled={saving || !hasChanges()}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
