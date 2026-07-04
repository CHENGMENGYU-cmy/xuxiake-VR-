'use client';

import { useState, useRef, useEffect } from 'react';
import { Settings, User, Lock, Bell, Palette, Save, Upload, Check, Camera, MapPin, Briefcase, Calendar, Users, Shield, Eye, EyeOff, MessageCircle, Search, Globe, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
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

const PRIVACY_OPTIONS = {
  profileVisibility: [
    { value: 'PUBLIC', label: '所有人', description: '任何人都可以查看你的个人资料' },
    { value: 'FOLLOWERS', label: '仅关注者', description: '只有关注你的人可以查看' },
    { value: 'PRIVATE', label: '仅自己', description: '只有你自己可以查看' },
  ],
  defaultPostVisibility: [
    { value: 'PUBLIC', label: '公开', description: '所有人可见' },
    { value: 'FOLLOWERS', label: '仅关注者', description: '仅关注者可见' },
    { value: 'PRIVATE', label: '私密', description: '仅自己可见' },
  ],
  messagePermission: [
    { value: 'EVERYONE', label: '所有人', description: '任何人都可以给你发私信' },
    { value: 'FOLLOWERS', label: '仅关注者', description: '只有关注你的人可以发私信' },
    { value: 'NOBODY', label: '无人', description: '不允许任何人发私信' },
  ],
};

const REGION_OPTIONS = [
  { value: '', label: '请选择地区' },
  { value: '北京', label: '北京' },
  { value: '上海', label: '上海' },
  { value: '天津', label: '天津' },
  { value: '重庆', label: '重庆' },
  { value: '河北', label: '河北' },
  { value: '山西', label: '山西' },
  { value: '辽宁', label: '辽宁' },
  { value: '吉林', label: '吉林' },
  { value: '黑龙江', label: '黑龙江' },
  { value: '江苏', label: '江苏' },
  { value: '浙江', label: '浙江' },
  { value: '安徽', label: '安徽' },
  { value: '福建', label: '福建' },
  { value: '江西', label: '江西' },
  { value: '山东', label: '山东' },
  { value: '河南', label: '河南' },
  { value: '湖北', label: '湖北' },
  { value: '湖南', label: '湖南' },
  { value: '广东', label: '广东' },
  { value: '海南', label: '海南' },
  { value: '四川', label: '四川' },
  { value: '贵州', label: '贵州' },
  { value: '云南', label: '云南' },
  { value: '陕西', label: '陕西' },
  { value: '甘肃', label: '甘肃' },
  { value: '青海', label: '青海' },
  { value: '台湾', label: '台湾' },
  { value: '内蒙古', label: '内蒙古' },
  { value: '广西', label: '广西' },
  { value: '西藏', label: '西藏' },
  { value: '宁夏', label: '宁夏' },
  { value: '新疆', label: '新疆' },
  { value: '香港', label: '香港' },
  { value: '澳门', label: '澳门' },
];

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
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

  // 修改密码状态
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordValidationErrors, setPasswordValidationErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
  }>({});

  // 隐私设置状态
  const [profileVisibility, setProfileVisibility] = useState('PUBLIC');
  const [defaultPostVisibility, setDefaultPostVisibility] = useState('PUBLIC');
  const [messagePermission, setMessagePermission] = useState('EVERYONE');
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [allowSearchDiscovery, setAllowSearchDiscovery] = useState(true);
  const [allowRecommendations, setAllowRecommendations] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 密码强度计算
  const getPasswordStrength = (password: string): { level: number; label: string; color: string } => {
    if (!password) return { level: 0, label: '', color: 'bg-gray-200' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[a-zA-Z]/.test(password) && /[0-9]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: '弱', color: 'bg-red-500' };
    if (score <= 3) return { level: 2, label: '中', color: 'bg-yellow-500' };
    return { level: 3, label: '强', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  // 验证修改密码表单
  const validatePasswordForm = (): boolean => {
    const errors: { currentPassword?: string; newPassword?: string; confirmNewPassword?: string } = {};

    if (!currentPassword) {
      errors.currentPassword = '请输入当前密码';
    }

    if (!newPassword) {
      errors.newPassword = '请输入新密码';
    } else if (newPassword.length < 6) {
      errors.newPassword = '密码长度至少6位';
    } else if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      errors.newPassword = '密码必须包含字母和数字';
    } else if (newPassword === currentPassword) {
      errors.newPassword = '新密码不能与当前密码相同';
    }

    if (!confirmNewPassword) {
      errors.confirmNewPassword = '请确认新密码';
    } else if (newPassword !== confirmNewPassword) {
      errors.confirmNewPassword = '两次密码输入不一致';
    }

    setPasswordValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 处理修改密码
  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);
    if (!validatePasswordForm()) return;

    setPasswordChanging(true);
    try {
      const { data } = await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (data.success) {
        setPasswordSuccess(true);
        setTimeout(() => {
          setShowPasswordDialog(false);
          setPasswordSuccess(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmNewPassword('');
          setPasswordValidationErrors({});
        }, 1500);
      } else {
        setPasswordError(data.message || '修改密码失败');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || '修改密码失败，请重试';
      setPasswordError(message);
    } finally {
      setPasswordChanging(false);
    }
  };

  // 重置密码对话框状态
  const resetPasswordDialog = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setPasswordError('');
    setPasswordSuccess(false);
    setPasswordValidationErrors({});
    setShowCurrentPassword(false);
    setShowNewPassword(false);
  };

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

      <Tabs defaultValue="profile" orientation="vertical" className="gap-0">
        {/* 左侧标签导航 */}
        <TabsList className="h-auto min-w-[110px] flex-col items-start justify-start bg-transparent p-0 pr-2 rounded-none">
          <TabsTrigger value="profile" className="w-full justify-start gap-2 data-active:bg-blue-50 data-active:text-blue-600">
            <User className="h-4 w-4" />
            个人资料
          </TabsTrigger>
          <TabsTrigger value="privacy" className="w-full justify-start gap-2 data-active:bg-blue-50 data-active:text-blue-600">
            <Lock className="h-4 w-4" />
            隐私设置
          </TabsTrigger>
          <TabsTrigger value="notifications" className="w-full justify-start gap-2 data-active:bg-blue-50 data-active:text-blue-600">
            <Bell className="h-4 w-4" />
            通知设置
          </TabsTrigger>
          <TabsTrigger value="appearance" className="w-full justify-start gap-2 data-active:bg-blue-50 data-active:text-blue-600">
            <Palette className="h-4 w-4" />
            外观设置
          </TabsTrigger>
        </TabsList>

        {/* 右侧内容 */}
        <div className="flex-1">
          <TabsContent value="profile" className="mt-0">
            {mounted && user ? (
              <div className="space-y-6">
                {/* 头像卡片 - 居中设计 */}
                <Card>
                  <CardContent className="pb-6">
                    <div className="flex flex-col items-center">
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
                      <h2 className="text-xl font-bold mt-4">{user.displayName}</h2>
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
                          onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE' | 'OTHER' | 'PRIVATE')}
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
                        <select
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                          {REGION_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
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
                <div className="flex items-center justify-end gap-3 sticky bottom-4 py-4">
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
            <div className="space-y-6">
              {/* 个人资料可见性 */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Eye className="h-5 w-5 text-blue-600 shrink-0" />
                      <div>
                        <p className="font-medium text-sm">资料可见性</p>
                        <p className="text-xs text-gray-500">控制谁可以查看你的个人资料</p>
                      </div>
                    </div>
                    <select
                      value={profileVisibility}
                      onChange={(e) => setProfileVisibility(e.target.value)}
                      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ml-4"
                    >
                      {PRIVACY_OPTIONS.profileVisibility.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* 帖子默认可见性 */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-purple-600 shrink-0" />
                      <div>
                        <p className="font-medium text-sm">帖子默认可见性</p>
                        <p className="text-xs text-gray-500">发布新帖子时的默认隐私级别</p>
                      </div>
                    </div>
                    <select
                      value={defaultPostVisibility}
                      onChange={(e) => setDefaultPostVisibility(e.target.value)}
                      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ml-4"
                    >
                      {PRIVACY_OPTIONS.defaultPostVisibility.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* 消息权限 */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 text-green-600 shrink-0" />
                      <div>
                        <p className="font-medium text-sm">私信权限</p>
                        <p className="text-xs text-gray-500">控制谁可以给你发送私信</p>
                      </div>
                    </div>
                    <select
                      value={messagePermission}
                      onChange={(e) => setMessagePermission(e.target.value)}
                      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ml-4"
                    >
                      {PRIVACY_OPTIONS.messagePermission.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* 其他隐私选项 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-600" />
                    其他设置
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">显示在线状态</p>
                      <p className="text-xs text-gray-500">其他用户可以看到你是否在线</p>
                    </div>
                    <button
                      onClick={() => setShowOnlineStatus(!showOnlineStatus)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        showOnlineStatus ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          showOnlineStatus ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">允许搜索发现</p>
                      <p className="text-xs text-gray-500">其他用户可以通过搜索找到你</p>
                    </div>
                    <button
                      onClick={() => setAllowSearchDiscovery(!allowSearchDiscovery)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        allowSearchDiscovery ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          allowSearchDiscovery ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">允许推荐</p>
                      <p className="text-xs text-gray-500">在探索页面向其他用户推荐你的内容</p>
                    </div>
                    <button
                      onClick={() => setAllowRecommendations(!allowRecommendations)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        allowRecommendations ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          allowRecommendations ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* 数据与安全 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lock className="h-5 w-5 text-red-600" />
                    数据与安全
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <button
                    onClick={() => setShowPasswordDialog(true)}
                    className="flex items-center justify-between w-full p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-left">
                      <p className="font-medium text-sm">修改密码</p>
                      <p className="text-xs text-gray-500">更新你的账户密码</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>

                  <button className="flex items-center justify-between w-full p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                    <div className="text-left">
                      <p className="font-medium text-sm">两步验证</p>
                      <p className="text-xs text-gray-500">增强账户安全性</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>

                  <button className="flex items-center justify-between w-full p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                    <div className="text-left">
                      <p className="font-medium text-sm">登录活动</p>
                      <p className="text-xs text-gray-500">查看和管理登录设备</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>
                </CardContent>
              </Card>

              {/* 保存按钮 */}
              <div className="flex items-center justify-end gap-3 sticky bottom-4 py-4">
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
                  {saving ? '保存中...' : '保存设置'}
                </Button>
              </div>
            </div>
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

      {/* 修改密码对话框 */}
      <Dialog open={showPasswordDialog} onOpenChange={(open) => {
        if (!open) resetPasswordDialog();
        setShowPasswordDialog(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>修改密码</DialogTitle>
            <DialogDescription>请输入当前密码和新密码来更新你的账户密码</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 错误提示 */}
            {passwordError && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {/* 成功提示 */}
            {passwordSuccess && (
              <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-600">
                <Check className="h-4 w-4 flex-shrink-0" />
                <span>密码修改成功！</span>
              </div>
            )}

            {/* 当前密码 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">当前密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="输入当前密码"
                  className={`pl-10 pr-10 ${passwordValidationErrors.currentPassword ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (passwordValidationErrors.currentPassword) {
                      setPasswordValidationErrors((prev) => ({ ...prev, currentPassword: undefined }));
                    }
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordValidationErrors.currentPassword && (
                <p className="text-xs text-red-500">{passwordValidationErrors.currentPassword}</p>
              )}
            </div>

            {/* 新密码 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">新密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="输入新密码（字母+数字，至少6位）"
                  className={`pl-10 pr-10 ${passwordValidationErrors.newPassword ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordValidationErrors.newPassword) {
                      setPasswordValidationErrors((prev) => ({ ...prev, newPassword: undefined }));
                    }
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordValidationErrors.newPassword && (
                <p className="text-xs text-red-500">{passwordValidationErrors.newPassword}</p>
              )}
              {/* 密码强度指示器 */}
              {newPassword && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          passwordStrength.level >= level ? passwordStrength.color : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">密码强度: {passwordStrength.label}</p>
                </div>
              )}
            </div>

            {/* 确认新密码 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">确认新密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="password"
                  placeholder="再次输入新密码"
                  className={`pl-10 ${passwordValidationErrors.confirmNewPassword ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                  value={confirmNewPassword}
                  onChange={(e) => {
                    setConfirmNewPassword(e.target.value);
                    if (passwordValidationErrors.confirmNewPassword) {
                      setPasswordValidationErrors((prev) => ({ ...prev, confirmNewPassword: undefined }));
                    }
                  }}
                />
              </div>
              {passwordValidationErrors.confirmNewPassword && (
                <p className="text-xs text-red-500">{passwordValidationErrors.confirmNewPassword}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              取消
            </DialogClose>
            <Button
              onClick={handleChangePassword}
              disabled={passwordChanging || passwordSuccess}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {passwordChanging ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  修改中...
                </>
              ) : passwordSuccess ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  已修改
                </>
              ) : (
                '确认修改'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
