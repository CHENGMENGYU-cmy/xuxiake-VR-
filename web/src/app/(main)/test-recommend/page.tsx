'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { getRecommendedUsers, getRecommendedCommunities } from '@/lib/social-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestRecommendPage() {
  const { isAuthenticated, user } = useAuthStore();
  const [recommendedUsers, setRecommendedUsers] = useState<any[]>([]);
  const [recommendedCommunities, setRecommendedCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    Promise.all([
      getRecommendedUsers(1, 20).catch(err => {
        console.error('推荐用户API错误:', err);
        return { data: [] };
      }),
      getRecommendedCommunities(1, 20).catch(err => {
        console.error('推荐社群API错误:', err);
        return { data: [] };
      })
    ]).then(([usersRes, communitiesRes]) => {
      setRecommendedUsers(usersRes.data || []);
      setRecommendedCommunities(communitiesRes.data || []);
      setLoading(false);
    });
  }, [isAuthenticated]);

  if (loading) return <div className="p-8">加载中...</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">推荐功能测试</h1>

      <Card>
        <CardHeader>
          <CardTitle>状态信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>用户是否登录：</strong>{isAuthenticated ? '是' : '否'}</p>
            <p><strong>当前用户：</strong>{user?.username || '未登录'}</p>
            <p><strong>推荐用户数量：</strong>{recommendedUsers.length}</p>
            <p><strong>推荐社群数量：</strong>{recommendedCommunities.length}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>推荐用户列表</CardTitle>
        </CardHeader>
        <CardContent>
          {recommendedUsers.length === 0 ? (
            <p className="text-muted-foreground">没有推荐用户数据</p>
          ) : (
            <div className="space-y-3">
              {recommendedUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3 p-2 border rounded">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                    {u.displayName?.[0]}
                  </div>
                  <div>
                    <p className="font-medium">{u.displayName}</p>
                    <p className="text-sm text-muted-foreground">@{u.username}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>推荐社群列表</CardTitle>
        </CardHeader>
        <CardContent>
          {recommendedCommunities.length === 0 ? (
            <p className="text-muted-foreground">没有推荐社群数据</p>
          ) : (
            <div className="space-y-3">
              {recommendedCommunities.map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-2 border rounded">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                    {c.name?.[0]}
                  </div>
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-muted-foreground">{c.memberCount} 成员</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
