'use client';

import { Eye, Globe, MessageCircle, Shield, Lock, ChevronRight, Check, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

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

interface PrivacyTabProps {
  profileVisibility: string;
  setProfileVisibility: (v: string) => void;
  defaultPostVisibility: string;
  setDefaultPostVisibility: (v: string) => void;
  messagePermission: string;
  setMessagePermission: (v: string) => void;
  showOnlineStatus: boolean;
  setShowOnlineStatus: (v: boolean) => void;
  allowSearchDiscovery: boolean;
  setAllowSearchDiscovery: (v: boolean) => void;
  allowRecommendations: boolean;
  setAllowRecommendations: (v: boolean) => void;
  // 密码对话框
  showPasswordDialog: boolean;
  setShowPasswordDialog: (v: boolean) => void;
  currentPassword: string;
  setCurrentPassword: (v: string) => void;
  newPassword: string;
  setNewPassword: (v: string) => void;
  confirmNewPassword: string;
  setConfirmNewPassword: (v: string) => void;
  showCurrentPassword: boolean;
  setShowCurrentPassword: (v: boolean) => void;
  showNewPassword: boolean;
  setShowNewPassword: (v: boolean) => void;
  passwordChanging: boolean;
  passwordError: string;
  passwordSuccess: boolean;
  passwordValidationErrors: { currentPassword?: string; newPassword?: string; confirmNewPassword?: string };
  setPasswordValidationErrors: (v: any) => void;
  onChangePassword: () => void;
  onResetPasswordDialog: () => void;
}

export function PrivacyTab({
  profileVisibility,
  setProfileVisibility,
  defaultPostVisibility,
  setDefaultPostVisibility,
  messagePermission,
  setMessagePermission,
  showOnlineStatus,
  setShowOnlineStatus,
  allowSearchDiscovery,
  setAllowSearchDiscovery,
  allowRecommendations,
  setAllowRecommendations,
  showPasswordDialog,
  setShowPasswordDialog,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  showCurrentPassword,
  setShowCurrentPassword,
  showNewPassword,
  setShowNewPassword,
  passwordChanging,
  passwordError,
  passwordSuccess,
  passwordValidationErrors,
  setPasswordValidationErrors,
  onChangePassword,
  onResetPasswordDialog,
}: PrivacyTabProps) {
  const getPasswordStrength = (password: string): { level: number; label: string; color: string } => {
    if (!password) return { level: 0, label: '', color: 'bg-border' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[a-zA-Z]/.test(password) && /[0-9]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    if (score <= 1) return { level: 1, label: '弱', color: 'bg-destructive' };
    if (score <= 3) return { level: 2, label: '中', color: 'bg-yellow-500' };
    return { level: 3, label: '强', color: 'bg-teal-50 dark:bg-teal-900/200' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="space-y-6">
      {/* 个人资料可见性 */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-medium text-sm">资料可见性</p>
                <p className="text-xs text-muted-foreground">控制谁可以查看你的个人资料</p>
              </div>
            </div>
            <select
              value={profileVisibility}
              onChange={(e) => setProfileVisibility(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ml-4"
            >
              {PRIVACY_OPTIONS.profileVisibility.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
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
                <p className="text-xs text-muted-foreground">发布新帖子时的默认隐私级别</p>
              </div>
            </div>
            <select
              value={defaultPostVisibility}
              onChange={(e) => setDefaultPostVisibility(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ml-4"
            >
              {PRIVACY_OPTIONS.defaultPostVisibility.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
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
              <MessageCircle className="h-5 w-5 text-teal-600 shrink-0" />
              <div>
                <p className="font-medium text-sm">私信权限</p>
                <p className="text-xs text-muted-foreground">控制谁可以给你发送私信</p>
              </div>
            </div>
            <select
              value={messagePermission}
              onChange={(e) => setMessagePermission(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ml-4"
            >
              {PRIVACY_OPTIONS.messagePermission.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
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
              <p className="text-xs text-muted-foreground">其他用户可以看到你是否在线</p>
            </div>
            <button
              onClick={() => setShowOnlineStatus(!showOnlineStatus)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showOnlineStatus ? 'bg-primary' : 'bg-border'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showOnlineStatus ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">允许搜索发现</p>
              <p className="text-xs text-muted-foreground">其他用户可以通过搜索找到你</p>
            </div>
            <button
              onClick={() => setAllowSearchDiscovery(!allowSearchDiscovery)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${allowSearchDiscovery ? 'bg-primary' : 'bg-border'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${allowSearchDiscovery ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">允许推荐</p>
              <p className="text-xs text-muted-foreground">在探索页面向其他用户推荐你的内容</p>
            </div>
            <button
              onClick={() => setAllowRecommendations(!allowRecommendations)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${allowRecommendations ? 'bg-primary' : 'bg-border'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${allowRecommendations ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 数据与安全 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-5 w-5 text-destructive" />
            数据与安全
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <button
            onClick={() => setShowPasswordDialog(true)}
            className="flex items-center justify-between w-full p-3 rounded-lg border border-border hover:border-border hover:bg-muted/50 transition-colors"
          >
            <div className="text-left">
              <p className="font-medium text-sm">修改密码</p>
              <p className="text-xs text-muted-foreground">更新你的账户密码</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="flex items-center justify-between w-full p-3 rounded-lg border border-border hover:border-border hover:bg-muted/50 transition-colors">
            <div className="text-left">
              <p className="font-medium text-sm">两步验证</p>
              <p className="text-xs text-muted-foreground">增强账户安全性</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="flex items-center justify-between w-full p-3 rounded-lg border border-border hover:border-border hover:bg-muted/50 transition-colors">
            <div className="text-left">
              <p className="font-medium text-sm">登录活动</p>
              <p className="text-xs text-muted-foreground">查看和管理登录设备</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>

      {/* 修改密码对话框 */}
      <Dialog open={showPasswordDialog} onOpenChange={(open) => {
        if (!open) onResetPasswordDialog();
        setShowPasswordDialog(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>修改密码</DialogTitle>
            <DialogDescription>请输入当前密码和新密码来更新你的账户密码</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {passwordError && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}
            {passwordSuccess && (
              <div className="flex items-center gap-2 rounded-md bg-teal-50 dark:bg-teal-900/20 p-3 text-sm text-teal-600">
                <Check className="h-4 w-4 flex-shrink-0" />
                <span>密码修改成功！</span>
              </div>
            )}
            {/* 当前密码 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">当前密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="输入当前密码"
                  className={`pl-10 pr-10 ${passwordValidationErrors.currentPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (passwordValidationErrors.currentPassword) {
                      setPasswordValidationErrors((prev: any) => ({ ...prev, currentPassword: undefined }));
                    }
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordValidationErrors.currentPassword && (
                <p className="text-xs text-destructive">{passwordValidationErrors.currentPassword}</p>
              )}
            </div>
            {/* 新密码 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">新密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="输入新密码（字母+数字，至少6位）"
                  className={`pl-10 pr-10 ${passwordValidationErrors.newPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordValidationErrors.newPassword) {
                      setPasswordValidationErrors((prev: any) => ({ ...prev, newPassword: undefined }));
                    }
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordValidationErrors.newPassword && (
                <p className="text-xs text-destructive">{passwordValidationErrors.newPassword}</p>
              )}
              {newPassword && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${passwordStrength.level >= level ? passwordStrength.color : 'bg-border'}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">密码强度: {passwordStrength.label}</p>
                </div>
              )}
            </div>
            {/* 确认新密码 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">确认新密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="再次输入新密码"
                  className={`pl-10 ${passwordValidationErrors.confirmNewPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  value={confirmNewPassword}
                  onChange={(e) => {
                    setConfirmNewPassword(e.target.value);
                    if (passwordValidationErrors.confirmNewPassword) {
                      setPasswordValidationErrors((prev: any) => ({ ...prev, confirmNewPassword: undefined }));
                    }
                  }}
                />
              </div>
              {passwordValidationErrors.confirmNewPassword && (
                <p className="text-xs text-destructive">{passwordValidationErrors.confirmNewPassword}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>取消</DialogClose>
            <Button
              onClick={onChangePassword}
              disabled={passwordChanging || passwordSuccess}
              className="bg-primary "
            >
              {passwordChanging ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />修改中...</>
              ) : passwordSuccess ? (
                <><Check className="mr-2 h-4 w-4" />已修改</>
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
