'use client';

import {
  Bell, Heart, MessageCircle, UserPlus, Megaphone, Mail,
  Globe, Clock, Save, Loader2, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NotificationSettings {
  // 推送通知类型
  likeNotifications: boolean;
  commentNotifications: boolean;
  followNotifications: boolean;
  systemNotifications: boolean;
  messageNotifications: boolean;
  mentionNotifications: boolean;
  // 通知方式
  inAppNotifications: boolean;
  emailNotifications: boolean;
  browserPush: boolean;
  // 免打扰
  doNotDisturb: boolean;
  dndStart: string;
  dndEnd: string;
  // 邮件频率
  emailFrequency: 'REALTIME' | 'DAILY' | 'WEEKLY' | 'NEVER';
}

interface NotificationsTabProps {
  settings: NotificationSettings;
  onUpdate: (settings: Partial<NotificationSettings>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  saved: boolean;
}

function ToggleSwitch({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-border'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
}

const EMAIL_FREQUENCY_OPTIONS = [
  { value: 'REALTIME', label: '实时', description: '每次有新通知时立即发送' },
  { value: 'DAILY', label: '每日摘要', description: '每天发送一次汇总邮件' },
  { value: 'WEEKLY', label: '每周摘要', description: '每周发送一次汇总邮件' },
  { value: 'NEVER', label: '从不', description: '不发送任何邮件通知' },
];

export function NotificationsTab({
  settings,
  onUpdate,
  onSave,
  saving,
  saved,
}: NotificationsTabProps) {
  const notificationTypes = [
    {
      key: 'likeNotifications' as const,
      icon: Heart,
      color: 'text-destructive',
      label: '点赞通知',
      description: '当有人点赞你的帖子时通知你',
    },
    {
      key: 'commentNotifications' as const,
      icon: MessageCircle,
      color: 'text-primary',
      label: '评论通知',
      description: '当有人评论你的帖子时通知你',
    },
    {
      key: 'followNotifications' as const,
      icon: UserPlus,
      color: 'text-teal-500',
      label: '关注通知',
      description: '当有新用户关注你时通知你',
    },
    {
      key: 'mentionNotifications' as const,
      icon: Globe,
      color: 'text-accent',
      label: '提及通知',
      description: '当有人在帖子中提及你时通知你',
    },
    {
      key: 'systemNotifications' as const,
      icon: Megaphone,
      color: 'text-orange-500',
      label: '系统通知',
      description: '接收系统更新和公告通知',
    },
    {
      key: 'messageNotifications' as const,
      icon: MessageCircle,
      color: 'text-teal-500',
      label: '私信通知',
      description: '当收到新私信时通知你',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 通知类型 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            通知类型
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationTypes.map(({ key, icon: Icon, color, label, description }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${color} shrink-0`} />
                <div>
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={settings[key]}
                onChange={(v) => onUpdate({ [key]: v })}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 通知方式 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-5 w-5 text-green-600" />
            通知方式
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">应用内通知</p>
              <p className="text-xs text-muted-foreground">在应用内显示通知弹窗和角标</p>
            </div>
            <ToggleSwitch
              enabled={settings.inAppNotifications}
              onChange={(v) => onUpdate({ inAppNotifications: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">邮件通知</p>
              <p className="text-xs text-muted-foreground">将通知发送到你的注册邮箱</p>
            </div>
            <ToggleSwitch
              enabled={settings.emailNotifications}
              onChange={(v) => onUpdate({ emailNotifications: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">浏览器推送</p>
              <p className="text-xs text-muted-foreground">通过浏览器发送桌面推送通知</p>
            </div>
            <ToggleSwitch
              enabled={settings.browserPush}
              onChange={(v) => onUpdate({ browserPush: v })}
            />
          </div>
        </CardContent>
      </Card>

      {/* 邮件通知频率 */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-indigo-600 shrink-0" />
              <div>
                <p className="font-medium text-sm">邮件通知频率</p>
                <p className="text-xs text-muted-foreground">设置接收邮件通知的频率</p>
              </div>
            </div>
            <select
              value={settings.emailFrequency}
              onChange={(e) => onUpdate({ emailFrequency: e.target.value as NotificationSettings['emailFrequency'] })}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ml-4"
            >
              {EMAIL_FREQUENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 免打扰 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            免打扰
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">免打扰模式</p>
              <p className="text-xs text-muted-foreground">在指定时间段内静音所有通知</p>
            </div>
            <ToggleSwitch
              enabled={settings.doNotDisturb}
              onChange={(v) => onUpdate({ doNotDisturb: v })}
            />
          </div>
          {settings.doNotDisturb && (
            <div className="flex items-center gap-4 pl-0 pt-2">
              <div className="flex items-center gap-2">
                <label className="text-sm text-foreground">开始</label>
                <input
                  type="time"
                  value={settings.dndStart}
                  onChange={(e) => onUpdate({ dndStart: e.target.value })}
                  className="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-foreground">结束</label>
                <input
                  type="time"
                  value={settings.dndEnd}
                  onChange={(e) => onUpdate({ dndEnd: e.target.value })}
                  className="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 保存按钮 */}
      <div className="flex justify-end">
        <Button
          onClick={onSave}
          disabled={saving}
          className="bg-primary "
        >
          {saving ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />保存中...</>
          ) : saved ? (
            <><Check className="mr-2 h-4 w-4" />已保存</>
          ) : (
            <><Save className="mr-2 h-4 w-4" />保存设置</>
          )}
        </Button>
      </div>
    </div>
  );
}
