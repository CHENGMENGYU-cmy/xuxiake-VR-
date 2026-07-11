'use client';

import { Sun, Type, Layout, Square } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAppearance } from '@/hooks/use-appearance';
import type { Theme, FontSize, BorderRadius } from '@/stores/ui-store';

const THEME_OPTIONS = [
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' },
  { value: 'system', label: '跟随系统' },
];

const FONT_SIZE_OPTIONS = [
  { value: 'small', label: '小' },
  { value: 'medium', label: '中' },
  { value: 'large', label: '大' },
];

const BORDER_RADIUS_OPTIONS = [
  { value: 'none', label: '无' },
  { value: 'small', label: '小' },
  { value: 'medium', label: '中' },
  { value: 'large', label: '大' },
];

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
    <div className="space-y-4">
      {/* 主题模式 */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sun className="h-5 w-5 text-orange-500 shrink-0" />
              <div>
                <p className="font-medium text-sm">主题模式</p>
                <p className="text-xs text-muted-foreground">选择界面显示主题</p>
              </div>
            </div>
            <select
              value={appearance.theme}
              onChange={(e) => setTheme(e.target.value as Theme)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {THEME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 字体大小 */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Type className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-medium text-sm">字体大小</p>
                <p className="text-xs text-muted-foreground">调整界面文字大小</p>
              </div>
            </div>
            <select
              value={appearance.fontSize}
              onChange={(e) => setFontSize(e.target.value as FontSize)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {FONT_SIZE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 紧凑模式 */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Layout className="h-5 w-5 text-teal-600 shrink-0" />
              <div>
                <p className="font-medium text-sm">紧凑模式</p>
                <p className="text-xs text-muted-foreground">减少界面间距，显示更多内容</p>
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
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Square className="h-5 w-5 text-purple-600 shrink-0" />
              <div>
                <p className="font-medium text-sm">圆角大小</p>
                <p className="text-xs text-muted-foreground">调整卡片和按钮的圆角</p>
              </div>
            </div>
            <select
              value={appearance.borderRadius}
              onChange={(e) => setBorderRadius(e.target.value as BorderRadius)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {BORDER_RADIUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
