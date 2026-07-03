'use client';

import { useState, useRef } from 'react';
import { Settings, User, Lock, Bell, Palette, Save, Upload, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth-store';
import apiClient from '@/lib/api-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const BACKEND_BASE = API_BASE.replace(/\/api\/?$/, '');

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await apiClient.post('/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        const newUrl = BACKEND_BASE + res.data.data.url + '?v=' + Date.now();
        setAvatarUrl(newUrl);
        // Persist to database immediately so re-login picks up the new avatar
        const profileRes = await apiClient.put('/users/profile', { avatarUrl: newUrl });
        if (profileRes.data.success) {
          updateUser(profileRes.data.data);
        } else {
          updateUser({ avatarUrl: newUrl });
        }
      }
    } catch (err: any) {
      const message = err.response?.data?.message || '头像上传失败';
      alert(message);
    } finally {
      setAvatarUploading(false);
      // Reset input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const payload: Record<string, string> = {};
      if (displayName !== user?.displayName) payload.displayName = displayName;
      if ((bio || '') !== (user?.bio || '')) payload.bio = bio;
      if ((website || '') !== (user?.website || '')) payload.website = website;
      if (avatarUrl !== user?.avatarUrl) payload.avatarUrl = avatarUrl;

      if (Object.keys(payload).length === 0) {
        setSaving(false);
        return;
      }

      const res = await apiClient.put('/users/profile', payload);

      if (res.data.success) {
        updateUser(res.data.data);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || '保存失败';
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-blue-600" />
        <h1 className="text-xl font-bold">设置</h1>
      </div>

      <Tabs defaultValue="profile" orientation="vertical" className="flex gap-6">
        {/* 左侧标签导航 */}
        <TabsList className="h-auto flex-col items-start justify-start border-r bg-transparent p-0">
          <TabsTrigger value="profile" className="w-full justify-start gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
            <User className="h-4 w-4" />
            个人资料
          </TabsTrigger>
          <TabsTrigger value="privacy" className="w-full justify-start gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
            <Lock className="h-4 w-4" />
            隐私设置
          </TabsTrigger>
          <TabsTrigger value="notifications" className="w-full justify-start gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
            <Bell className="h-4 w-4" />
            通知设置
          </TabsTrigger>
          <TabsTrigger value="appearance" className="w-full justify-start gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
            <Palette className="h-4 w-4" />
            外观设置
          </TabsTrigger>
        </TabsList>

        {/* 右侧内容 */}
        <div className="flex-1">
          <TabsContent value="profile" className="mt-0">
            {user ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">个人资料</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 头像 */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={avatarUrl} alt={user.displayName} />
                    <AvatarFallback className="text-xl">{user.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAvatarClick}
                    disabled={avatarUploading}
                  >
                    {avatarUploading ? (
                      <>
                        <Upload className="mr-1 h-4 w-4 animate-pulse" />
                        上传中...
                      </>
                    ) : (
                      '更换头像'
                    )}
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <label className="text-sm font-medium">用户名</label>
                  <Input value={user.username} disabled className="bg-gray-50" />
                  <p className="text-xs text-gray-400">用户名不可修改</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">显示名称</label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="你的显示名称"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">个人简介</label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="介绍一下你自己..."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">个人网站</label>
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://your-website.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">VR设备信息</label>
                  <Input
                    value={user.vrDeviceInfo?.model || ''}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  {saved && (
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <Check className="h-4 w-4" />
                      已保存
                    </span>
                  )}
                  <Button
                    className="gap-1.5 bg-blue-600 hover:bg-blue-700"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4" />
                    {saving ? '保存中...' : '保存修改'}
                  </Button>
                </div>
              </CardContent>
            </Card>
            ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-500">加载中...</p>
              </CardContent>
            </Card>
            )}
          </TabsContent>

          <TabsContent value="privacy" className="mt-0">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-500">隐私设置即将上线</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-500">通知设置即将上线</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="mt-0">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-500">外观设置即将上线</p>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
