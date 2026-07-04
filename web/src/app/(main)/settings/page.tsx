'use client';

import { useState, useEffect } from 'react';
import { Settings, User, Lock, Bell, Palette } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/auth-store';
import apiClient from '@/lib/api-client';
import { ProfileTab } from './components/profile-tab';
import { PrivacyTab } from './components/privacy-tab';
import { NotificationsTab } from './components/notifications-tab';
import { AppearanceTab } from './components/appearance-tab';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // 个人资料状态
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

  // 隐私设置状态
  const [profileVisibility, setProfileVisibility] = useState('PUBLIC');
  const [defaultPostVisibility, setDefaultPostVisibility] = useState('PUBLIC');
  const [messagePermission, setMessagePermission] = useState('EVERYONE');
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [allowSearchDiscovery, setAllowSearchDiscovery] = useState(true);
  const [allowRecommendations, setAllowRecommendations] = useState(true);

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

  // 保存个人资料
  const handleSaveProfile = async () => {
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

  // 保存隐私设置
  const handleSavePrivacy = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await apiClient.put('/users/privacy', {
        profileVisibility,
        defaultPostVisibility,
        messagePermission,
        showOnlineStatus,
        allowSearchDiscovery,
        allowRecommendations,
      });

      if (res.data.success) {
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
              <ProfileTab
                user={user}
                displayName={displayName}
                setDisplayName={setDisplayName}
                bio={bio}
                setBio={setBio}
                website={website}
                setWebsite={setWebsite}
                gender={gender}
                setGender={setGender}
                birthday={birthday}
                setBirthday={setBirthday}
                region={region}
                setRegion={setRegion}
                occupation={occupation}
                setOccupation={setOccupation}
                avatarUrl={avatarUrl}
                setAvatarUrl={setAvatarUrl}
                avatarUploading={avatarUploading}
                setAvatarUploading={setAvatarUploading}
                saving={saving}
                saved={saved}
                onSave={handleSaveProfile}
                updateUser={updateUser}
              />
            ) : null}
          </TabsContent>

          <TabsContent value="privacy" className="mt-0">
            <PrivacyTab
              profileVisibility={profileVisibility}
              setProfileVisibility={setProfileVisibility}
              defaultPostVisibility={defaultPostVisibility}
              setDefaultPostVisibility={setDefaultPostVisibility}
              messagePermission={messagePermission}
              setMessagePermission={setMessagePermission}
              showOnlineStatus={showOnlineStatus}
              setShowOnlineStatus={setShowOnlineStatus}
              allowSearchDiscovery={allowSearchDiscovery}
              setAllowSearchDiscovery={setAllowSearchDiscovery}
              allowRecommendations={allowRecommendations}
              setAllowRecommendations={setAllowRecommendations}
              saving={saving}
              saved={saved}
              onSave={handleSavePrivacy}
              showPasswordDialog={showPasswordDialog}
              setShowPasswordDialog={setShowPasswordDialog}
              currentPassword={currentPassword}
              setCurrentPassword={setCurrentPassword}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmNewPassword={confirmNewPassword}
              setConfirmNewPassword={setConfirmNewPassword}
              showCurrentPassword={showCurrentPassword}
              setShowCurrentPassword={setShowCurrentPassword}
              showNewPassword={showNewPassword}
              setShowNewPassword={setShowNewPassword}
              passwordChanging={passwordChanging}
              passwordError={passwordError}
              passwordSuccess={passwordSuccess}
              passwordValidationErrors={passwordValidationErrors}
              setPasswordValidationErrors={setPasswordValidationErrors}
              onChangePassword={handleChangePassword}
              onResetPasswordDialog={resetPasswordDialog}
            />
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <NotificationsTab />
          </TabsContent>

          <TabsContent value="appearance" className="mt-0">
            <AppearanceTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
