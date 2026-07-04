'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large';
export type BorderRadius = 'none' | 'small' | 'medium' | 'large';

interface AppearanceSettings {
  theme: Theme;
  fontSize: FontSize;
  compactMode: boolean;
  borderRadius: BorderRadius;
}

interface UIState {
  sidebarOpen: boolean;
  rightPanelOpen: boolean;
  appearance: AppearanceSettings;
  toggleSidebar: () => void;
  toggleRightPanel: () => void;
  setSidebarOpen: (open: boolean) => void;
  updateAppearance: (settings: Partial<AppearanceSettings>) => void;
}

const defaultAppearance: AppearanceSettings = {
  theme: 'system',
  fontSize: 'medium',
  compactMode: false,
  borderRadius: 'medium',
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      rightPanelOpen: true,
      appearance: defaultAppearance,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
      updateAppearance: (settings) =>
        set((state) => ({
          appearance: { ...state.appearance, ...settings },
        })),
    }),
    {
      name: 'xuxiake-ui-storage',
      partialize: (state) => ({ appearance: state.appearance }),
    }
  )
);
