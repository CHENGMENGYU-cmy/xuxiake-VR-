'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

const ROLE_LEVEL: Record<string, number> = { USER: 1, MODERATOR: 2, ADMIN: 3 };

interface Props {
  children: React.ReactNode;
  /** 所需最低角色，不传则只检查登录状态 */
  requiredRole?: 'USER' | 'MODERATOR' | 'ADMIN';
}

export function AuthGuard({ children, requiredRole }: Props) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, checkAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, isLoading, router]);

  // 角色检查 — 同步判断，不等异步 effect
  const hasRole = !requiredRole || (user && ROLE_LEVEL[user.role || 'USER'] >= ROLE_LEVEL[requiredRole]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">正在验证登录状态...</p>
        </div>
      </div>
    );
  }

  if (!hasRole) {
    // 立即重定向
    router.replace('/');
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">无权访问，正在跳转...</p>
      </div>
    );
  }

  return <>{children}</>;
}
