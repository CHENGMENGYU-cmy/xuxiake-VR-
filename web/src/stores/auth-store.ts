'use client';

import { create } from 'zustand';
import { User } from '@/types';
import apiClient from '@/lib/api-client';
import { usePostStore } from './post-store';

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function removeCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (account: string, password: string, captchaKey: string, captchaCode: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  updateUser: (updates: Partial<User>) => void;
}

function getSavedUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function getSavedToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

const savedUser = getSavedUser();
const savedToken = getSavedToken();

export const useAuthStore = create<AuthState>((set) => ({
  user: savedUser,
  isAuthenticated: !!savedToken && !!savedUser,
  isLoading: false,
  error: null,

  login: async (account: string, password: string, captchaKey: string, captchaCode: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiClient.post('/auth/login', {
        account,
        password,
        captchaKey,
        captchaCode,
      });
      const { user, tokens } = data.data;

      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      setCookie('auth_token', tokens.accessToken);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        '登录失败，请检查账号和密码';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  register: async (email: string, username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiClient.post('/auth/register', {
        email,
        username,
        password,
      });
      const { user, tokens } = data.data;

      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      setCookie('auth_token', tokens.accessToken);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        '注册失败，请稍后重试';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    removeCookie('auth_token');
    set({ user: null, isAuthenticated: false, error: null });
  },

  checkAuth: async () => {
    const token = getSavedToken();
    const user = getSavedUser();
    if (!token || !user) {
      set({ user: null, isAuthenticated: false });
      return;
    }
    set({ user, isAuthenticated: true });
    // Refresh user data from server so avatar and profile stay up to date
    try {
      const { data } = await apiClient.get('/users/profile');
      if (data.success && data.data) {
        localStorage.setItem('user', JSON.stringify(data.data));
        set({ user: data.data });
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        removeCookie('auth_token');
        set({ user: null, isAuthenticated: false });
      }
    }
  },

  clearError: () => set({ error: null }),

  updateUser: (updates) => {
    const current = getSavedUser();
    if (current) {
      const updated = { ...current, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      set({ user: updated });
    }
  },
}));
