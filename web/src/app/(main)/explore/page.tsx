import { Compass, TrendingUp, Flame, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FeedList } from '@/components/feed/feed-list';
import { mockPosts } from '@/lib/mock-data';

export default function ExplorePage() {
  return (
    <div className="space-y-4">
      {/* 页面标题 */}
      <div className="flex items-center gap-2">
        <Compass className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">探索发现</h1>
      </div>

      {/* 标签切换 */}
      <Tabs defaultValue="trending" className="w-full">
        <TabsList className="w-full justify-start border-b bg-transparent p-0">
          <TabsTrigger value="trending" className="gap-1.5 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600">
            <TrendingUp className="h-4 w-4" />
            热门内容
          </TabsTrigger>
          <TabsTrigger value="latest" className="gap-1.5 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600">
            <Clock className="h-4 w-4" />
            最新发布
          </TabsTrigger>
          <TabsTrigger value="hot" className="gap-1.5 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600">
            <Flame className="h-4 w-4" />
            精选推荐
          </TabsTrigger>
        </TabsList>

        {/* 热门内容 */}
        <TabsContent value="trending" className="mt-4">
          <FeedList
            initialPosts={[...mockPosts].sort((a, b) => b.viewCount - a.viewCount)}
            showComposer={false}
          />
        </TabsContent>

        {/* 最新发布 */}
        <TabsContent value="latest" className="mt-4">
          <FeedList
            initialPosts={[...mockPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())}
            showComposer={false}
          />
        </TabsContent>

        {/* 精选推荐 */}
        <TabsContent value="hot" className="mt-4">
          <FeedList
            initialPosts={[...mockPosts].sort((a, b) => b.likeCount - a.likeCount)}
            showComposer={false}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
