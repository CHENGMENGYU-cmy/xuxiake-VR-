'use client';

import { useEffect } from 'react';
import { useTheme } from '@/components/theme-provider';
import { useUIStore, type Theme, type FontSize, type BorderRadius } from '@/stores/ui-store';

const fontSizeMap: Record<FontSize, string> = {
  small: '14px',
  medium: '16px',
  large: '18px',
};

const borderRadiusMap: Record<BorderRadius, string> = {
  none: '0px',
  small: '4px',
  medium: '8px',
  large: '12px',
};

export function useAppearance() {
  const { theme: nextTheme, setTheme: setNextTheme } = useTheme();
  const { appearance, updateAppearance } = useUIStore();

  // 同步next-themes和ui-store的theme
  useEffect(() => {
    if (nextTheme && nextTheme !== appearance.theme) {
      updateAppearance({ theme: nextTheme as Theme });
    }
  }, [nextTheme]);

  // 应用字体大小
  useEffect(() => {
    document.documentElement.style.setProperty('--font-size-base', fontSizeMap[appearance.fontSize]);
    document.documentElement.style.fontSize = fontSizeMap[appearance.fontSize];
  }, [appearance.fontSize]);

  // 应用圆角大小
  useEffect(() => {
    document.documentElement.style.setProperty('--radius', borderRadiusMap[appearance.borderRadius]);
  }, [appearance.borderRadius]);

  // 应用紧凑模式
  useEffect(() => {
    if (appearance.compactMode) {
      document.documentElement.classList.add('compact');
    } else {
      document.documentElement.classList.remove('compact');
    }
  }, [appearance.compactMode]);

  const setTheme = (theme: Theme) => {
    setNextTheme(theme);
    updateAppearance({ theme });
  };

  const setFontSize = (fontSize: FontSize) => {
    updateAppearance({ fontSize });
  };

  const setCompactMode = (compactMode: boolean) => {
    updateAppearance({ compactMode });
  };

  const setBorderRadius = (borderRadius: BorderRadius) => {
    updateAppearance({ borderRadius });
  };

  return {
    appearance,
    setTheme,
    setFontSize,
    setCompactMode,
    setBorderRadius,
  };
}
