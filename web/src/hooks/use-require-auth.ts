'use client';

import { useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth-store';

export function useRequireAuth() {
  const { user } = useAuthStore();
  const [showPrompt, setShowPrompt] = useState(false);
  const [action, setAction] = useState('此操作');

  const requireAuth = useCallback((actionName?: string) => {
    if (user) return true;
    setAction(actionName || '此操作');
    setShowPrompt(true);
    return false;
  }, [user]);

  return { requireAuth, showPrompt, setShowPrompt, action, isAuthenticated: !!user };
}
