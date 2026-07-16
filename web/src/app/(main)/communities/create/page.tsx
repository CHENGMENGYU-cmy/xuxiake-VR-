'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/auth-store';
import { getAllTags, createCommunity } from '@/lib/social-api';
import type { InterestTag, TagCategory } from '@/types';
import Link from 'next/link';

const categoryLabels: Record<TagCategory, string> = {
  TRAVEL: '旅行',
  VR: 'VR技术',
  ACTIVITY: '活动',
  CULTURE: '文化',
  OTHER: '其他',
};

export default function CreateCommunityPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<Record<string, InterestTag[]>>({});
  const [loading, setLoading] = useState(false);
  const [tagsLoading, setTagsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchTags = async () => {
      try {
        const tags = await getAllTags();
        setAllTags(tags);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      } finally {
        setTagsLoading(false);
      }
    };

    fetchTags();
  }, [isAuthenticated, router]);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const community = await createCommunity({
        name: name.trim(),
        description: description.trim() || undefined,
        tagIds: selectedTags,
        isPublic,
      });
      router.push(`/communities/${community.id}`);
    } catch (error) {
      console.error('Failed to create community:', error);
      alert('创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (tagsLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/discover">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">创建社群</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">社群名称 *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入社群名称"
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">社群描述</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="介绍你的社群主题和目标"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>公开社群</Label>
                <p className="text-sm text-muted-foreground">
                  公开社群会被推荐给感兴趣的用户
                </p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>兴趣标签</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              选择标签帮助志同道合的用户找到你的社群（最多选择5个）
            </p>
            {Object.entries(allTags).map(([category, tags]) => (
              <div key={category} className="mb-4">
                <h4 className="mb-2 font-medium">
                  {categoryLabels[category as TagCategory] || category}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        if (selectedTags.length < 5 || selectedTags.includes(tag.id)) {
                          toggleTag(tag.id);
                        }
                      }}
                    >
                      {tag.icon} {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
            {selectedTags.length > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                已选择 {selectedTags.length} 个标签
              </p>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-4">
          <Link href="/discover">
            <Button type="button" variant="outline">取消</Button>
          </Link>
          <Button type="submit" disabled={!name.trim() || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            创建社群
          </Button>
        </div>
      </form>
    </div>
  );
}
