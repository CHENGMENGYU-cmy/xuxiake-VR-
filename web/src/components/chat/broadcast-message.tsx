'use client';

import { Megaphone, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BroadcastMessageProps {
  text: string;
  type: 'ANNOUNCEMENT' | 'ALERT';
  senderName?: string;
}

export function BroadcastMessage({ text, type, senderName }: BroadcastMessageProps) {
  const isAlert = type === 'ALERT';

  return (
    <div
      className={cn(
        'w-full rounded-xl border px-4 py-3',
        isAlert
          ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30'
          : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30'
      )}
    >
      <div className="flex items-center gap-2">
        {isAlert ? (
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        ) : (
          <Megaphone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        )}
        <span
          className={cn(
            'text-xs font-semibold',
            isAlert ? 'text-orange-700 dark:text-orange-300' : 'text-blue-700 dark:text-blue-300'
          )}
        >
          {isAlert ? '安全通报' : '活动公告'}
        </span>
        {senderName && (
          <span className="text-xs text-muted-foreground">· {senderName}</span>
        )}
      </div>
      <p
        className={cn(
          'mt-1.5 text-sm',
          isAlert ? 'text-orange-800 dark:text-orange-200' : 'text-blue-800 dark:text-blue-200'
        )}
      >
        {text}
      </p>
    </div>
  );
}
