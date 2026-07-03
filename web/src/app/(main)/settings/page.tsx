'use client';

import { useState, useRef } from 'react';
import { Settings, User, Lock, Bell, Palette, Save, Upload, Check, Camera, MapPin, Briefcase, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth-store';
import apiClient from '@/lib/api-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const BACKEND_BASE = API_BASE.replace(/\/api\/?$/, '');

const GENDER_OPTIONS = [
  { value: 'PRIVATE', label: '保密' },
  { value: 'MALE', label: '男' },
  { value: 'FEMALE', label: '女' },
  { value: 'OTHER', label: '其他' },
];

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | 'PRIVATE'>(user?.gender || 'PRIVATE');
  const [birthday, setBirthday] = useState(user?.birthday || '');
  const [region, setRegion] = useState(user?.region || '');
  const [occupation, setOccupation] = useState(user?.occupation || '');
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
      if (gender !== user?.gender) payload.gender = gender;
      if ((birthday || '') !== (user?.birthday || '')) payload.birthday = birthday;
      if ((region || '') !== (user?.region || '')) payload.region = region;
      if ((occupation || '') !== (user?.occupation || '')) payload.occupation = occupation;

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
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">设置</h1>
      </div>

      <Tabs defaultValue="profile" orientation="vertical" className="flex gap-6">
        {/* 左侧标签导航 */}
        <TabsList className="h-auto min-w-[160px] flex-col items-start justify-start border-r bg-transparent p-0">
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
              <div className="space-y-6">
                {/* 头像卡片 - 居中设计 */}
                <Card className="overflow-hidden">
                  <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-500" />
                  <CardContent className="relative pb-6">
                    <div className="flex flex-col items-center -mt-16">
                      <div className="relative group">
                        <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
                          <AvatarImage src={avatarUrl} alt={user.displayName} />
                          <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                            {user.displayName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <button
                          onClick={handleAvatarClick}
                          disabled={avatarUploading}
                          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          {avatarUploading ? (
                            <Upload className="h-6 w-6 text-white animate-pulse" />
                          ) : (
                            <Camera className="h-6 w-6 text-white" />
                          )}
                        </button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAvatarClick}
                        disabled={avatarUploading}
                        className="mt-2 text-blue-600 hover:text-blue-700"
                      >
                        {avatarUploading ? '上传中...' : '更换头像'}
                      </Button>
                      <h2 className="text-xl font-bold mt-2">{user.displayName}</h2>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                      <Badge variant="secondary" className="mt-2">
                        徐霞客号: {user.xxkNumber}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* 基本信息卡片 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      基本信息
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">用户名</label>
                        <Input value={user.username} disabled className="bg-gray-50" />
                        <p className="text-xs text-gray-400">用户名不可修改</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">显示名称</label>
                        <Input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="你的显示名称"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">个人简介</label>
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="介绍一下你自己..."
                        className="min-h-[100px] resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">个人网站</label>
                      <Input
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://your-website.com"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 个人信息卡片 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      个人信息
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          性别
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                          {GENDER_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          生日
                        </label>
                        <Input
                          type="date"
                          value={birthday}
                          onChange={(e) => setBirthday(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          地区
                        </label>
                        <Input
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                          placeholder="例如：北京"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          职业
                        </label>
                        <Input
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                          placeholder="例如：软件工程师"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* VR设备信息卡片 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 8a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                        <circle cx="8" cy="12" r="2" />
                        <circle cx="16" cy="12" r="2" />
                        <path d="M10 12h4" />
                      </svg>
                      VR 设备信息
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      value={user.vrDeviceInfo?.model || '未绑定设备'}
                      disabled
                      className="bg-gray-50"
                    />
                  </CardContent>
                </Card>

                {/* 保存按钮 */}
                <div className="flex items-center justify-end gap-3 sticky bottom-4 bg-white/80 backdrop-blur-sm p-4 rounded-lg border shadow-sm">
                  {saved && (
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <Check className="h-4 w-4" />
                      已保存
                    </span>
                  )}
                  <Button
                    className="gap-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4" />
                    {saving ? '保存中...' : '保存修改'}
                  </Button>
                </div>
              </div>
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
