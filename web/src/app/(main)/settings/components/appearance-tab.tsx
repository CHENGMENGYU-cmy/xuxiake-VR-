'use client';

import { Sun, Moon, Monitor, Type, Layout, Square, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppearance } from '@/hooks/use-appearance';
import type { BorderRadius } from '@/stores/ui-store';

function ThemeOption({
  label,
  icon: Icon,
  selected,
  onClick,
}: {
  label: string;
  icon: typeof Sun;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
        selected
          ? 'border-primary bg-primary/5'
          : 'border-transparent bg-muted hover:bg-muted/80'
      }`}
    >
      <Icon className={`h-6 w-6 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
      <span className={`text-sm font-medium ${selected ? 'text-primary' : 'text-foreground'}`}>
        {label}
      </span>
      {selected && (
        <div className="absolute top-2 right-2">
          <Check className="h-4 w-4 text-primary" />
        </div>
      )}
    </button>
  );
}

function FontSizeOption({
  label,
  preview,
  selected,
  onClick,
}: {
  label: string;
  preview: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
        selected
          ? 'border-primary bg-primary/5'
          : 'border-transparent bg-muted hover:bg-muted/80'
      }`}
    >
      <span className={`font-medium ${selected ? 'text-primary' : 'text-foreground'}`}>
        {preview}
      </span>
      <span className={`text-sm ${selected ? 'text-primary' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </button>
  );
}

function BorderRadiusOption({
  value,
  label,
  selected,
  onClick,
}: {
  value: BorderRadius;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  const radiusMap: Record<BorderRadius, string> = {
    none: '0px',
    small: '4px',
    medium: '8px',
    large: '12px',
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
        selected
          ? 'border-primary bg-primary/5'
          : 'border-transparent bg-muted hover:bg-muted/80'
      }`}
    >
      <div
        className="w-12 h-12 bg-primary/20 border-2 border-primary"
        style={{ borderRadius: radiusMap[value] }}
      />
      <span className={`text-sm font-medium ${selected ? 'text-primary' : 'text-foreground'}`}>
        {label}
      </span>
    </button>
  );
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
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-primary' : 'bg-muted'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export function AppearanceTab() {
  const { appearance, setTheme, setFontSize, setCompactMode, setBorderRadius } = useAppearance();

  return (
    <div className="space-y-6">
      {/* 主题模式 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sun className="h-5 w-5 text-yellow-600" />
            主题模式
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <ThemeOption
              label="浅色"
              icon={Sun}
              selected={appearance.theme === 'light'}
              onClick={() => setTheme('light')}
            />
            <ThemeOption
              label="深色"
              icon={Moon}
              selected={appearance.theme === 'dark'}
              onClick={() => setTheme('dark')}
            />
            <ThemeOption
              label="跟随系统"
              icon={Monitor}
              selected={appearance.theme === 'system'}
              onClick={() => setTheme('system')}
            />
          </div>
        </CardContent>
      </Card>

      {/* 字体大小 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Type className="h-5 w-5 text-blue-600" />
            字体大小
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <FontSizeOption
              label="小"
              preview="A"
              selected={appearance.fontSize === 'small'}
              onClick={() => setFontSize('small')}
            />
            <FontSizeOption
              label="中"
              preview="A"
              selected={appearance.fontSize === 'medium'}
              onClick={() => setFontSize('medium')}
            />
            <FontSizeOption
              label="大"
              preview="A"
              selected={appearance.fontSize === 'large'}
              onClick={() => setFontSize('large')}
            />
          </div>
        </CardContent>
      </Card>

      {/* 紧凑模式 */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Layout className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <p className="font-medium text-sm">紧凑模式</p>
                <p className="text-xs text-muted-foreground">减少界面元素间距，显示更多内容</p>
              </div>
            </div>
            <ToggleSwitch
              enabled={appearance.compactMode}
              onChange={setCompactMode}
            />
          </div>
        </CardContent>
      </Card>

      {/* 圆角大小 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Square className="h-5 w-5 text-purple-600" />
            圆角大小
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <BorderRadiusOption
              value="none"
              label="无"
              selected={appearance.borderRadius === 'none'}
              onClick={() => setBorderRadius('none')}
            />
            <BorderRadiusOption
              value="small"
              label="小"
              selected={appearance.borderRadius === 'small'}
              onClick={() => setBorderRadius('small')}
            />
            <BorderRadiusOption
              value="medium"
              label="中"
              selected={appearance.borderRadius === 'medium'}
              onClick={() => setBorderRadius('medium')}
            />
            <BorderRadiusOption
              value="large"
              label="大"
              selected={appearance.borderRadius === 'large'}
              onClick={() => setBorderRadius('large')}
            />
          </div>
        </CardContent>
      </Card>

      {/* 预览区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">预览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-muted">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-medium">徐</span>
              </div>
              <div>
                <p className="font-medium text-sm">徐霞客</p>
                <p className="text-xs text-muted-foreground">旅行家</p>
              </div>
            </div>
            <p className="text-sm text-foreground mb-3">
              这是一段示例文本，用于预览当前的外观设置效果。您可以调整主题、字体大小和圆角来查看变化。
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md">
                主要按钮
              </button>
              <button className="px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md">
                次要按钮
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
