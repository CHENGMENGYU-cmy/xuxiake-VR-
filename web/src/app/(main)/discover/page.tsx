'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/auth-store';
import { RecommendedUsers } from './recommended-users';
import { RecommendedCommunities } from './recommended-communities';
import { MyCommunities } from './my-communities';

export default function DiscoverPage() {
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-lg font-medium">发现新朋友</h2>
          <p className="mb-4 text-sm text-muted-foreground">登录后查看智能推荐</p>
          <Link href="/login">
            <Button>立即登录</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-3">
          <TabsTrigger value="users">推荐用户</TabsTrigger>
          <TabsTrigger value="communities">推荐社群</TabsTrigger>
          <TabsTrigger value="my-communities">我的社群</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <RecommendedUsers />
        </TabsContent>

        <TabsContent value="communities">
          <RecommendedCommunities />
        </TabsContent>

        <TabsContent value="my-communities">
          <MyCommunities />
        </TabsContent>
      </Tabs>
    </div>
  );
}
