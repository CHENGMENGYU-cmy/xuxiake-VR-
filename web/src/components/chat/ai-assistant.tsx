'use client';

import { Bot, MapPin, Route, Calendar, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AIResponse {
  type: 'TRAVEL_TIP' | 'ROUTE_SUGGESTION' | 'WEATHER' | 'TRANSLATION' | 'GENERAL';
  title: string;
  content: string;
  suggestions?: string[];
}

interface AIAssistantMessageProps {
  data: AIResponse;
  isMine: boolean;
}

const TYPE_CONFIG: Record<string, { icon: typeof Bot; label: string; color: string }> = {
  TRAVEL_TIP: { icon: Lightbulb, label: '旅行贴士', color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800' },
  ROUTE_SUGGESTION: { icon: Route, label: '路线推荐', color: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' },
  WEATHER: { icon: Calendar, label: '天气信息', color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800' },
  TRANSLATION: { icon: MapPin, label: '翻译', color: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800' },
  GENERAL: { icon: Bot, label: 'AI助手', color: 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-950/30 dark:border-gray-800' },
};

export function AIAssistantMessage({ data, isMine }: AIAssistantMessageProps) {
  const config = TYPE_CONFIG[data.type] || TYPE_CONFIG.GENERAL;
  const Icon = config.icon;

  return (
    <div className={cn('w-[280px] rounded-xl border overflow-hidden', config.color)}>
      {/* 头部 */}
      <div className="flex items-center gap-2 border-b px-3 py-2" style={{ borderColor: 'inherit' }}>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-current/10">
          <Bot className="h-3.5 w-3.5" />
        </div>
        <span className="text-xs font-semibold">{config.label}</span>
        <span className="ml-auto text-[10px] opacity-60">AI</span>
      </div>

      {/* 内容 */}
      <div className="p-3">
        {data.title && (
          <h3 className="text-sm font-semibold">{data.title}</h3>
        )}
        <p className="mt-1 text-sm leading-relaxed opacity-90">{data.content}</p>

        {/* 建议选项 */}
        {data.suggestions && data.suggestions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {data.suggestions.map((s, i) => (
              <button
                key={i}
                className="rounded-full border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-current/10"
                style={{ borderColor: 'inherit' }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
