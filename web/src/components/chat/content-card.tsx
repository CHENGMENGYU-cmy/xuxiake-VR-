'use client';

import { MapPin, Route, Video, Calendar, User as UserIcon, Heart, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CardType = 'POST' | 'ROUTE' | 'VR' | 'ACTIVITY' | 'USER';

export interface ContentCardData {
  type: CardType;
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  extra?: Record<string, any>;
  link?: string;
}

interface ContentCardProps {
  data: ContentCardData;
  isMine: boolean;
}

const CARD_ICONS: Record<CardType, typeof MapPin> = {
  POST: Heart,
  ROUTE: Route,
  VR: Video,
  ACTIVITY: Calendar,
  USER: UserIcon,
};

const CARD_LABELS: Record<CardType, string> = {
  POST: '笔记',
  ROUTE: '路线',
  VR: 'VR内容',
  ACTIVITY: '活动',
  USER: '用户',
};

export function ContentCard({ data, isMine }: ContentCardProps) {
  const Icon = CARD_ICONS[data.type];
  const label = CARD_LABELS[data.type];

  return (
    <a
      href={data.link || '#'}
      className={cn(
        'block w-[260px] rounded-xl overflow-hidden border transition-colors hover:border-primary/50',
        isMine ? 'border-primary/20' : 'border-muted-foreground/20'
      )}
    >
      {/* 封面图 */}
      {data.coverUrl && (
        <div className="h-[120px] w-full overflow-hidden">
          <img
            src={data.coverUrl}
            alt={data.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* 内容区 */}
      <div className="p-3">
        {/* 类型标签 */}
        <div className="mb-1.5 flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground">{label}</span>
        </div>

        {/* 标题 */}
        <h3 className="text-sm font-semibold leading-tight line-clamp-2">{data.title}</h3>

        {/* 描述 */}
        {data.description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{data.description}</p>
        )}

        {/* 额外数据 */}
        {data.extra && (
          <div className="mt-2 flex flex-wrap gap-2">
            {data.extra.likes !== undefined && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Heart className="h-3 w-3" /> {data.extra.likes}
              </span>
            )}
            {data.extra.comments !== undefined && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageCircle className="h-3 w-3" /> {data.extra.comments}
              </span>
            )}
            {data.extra.distance && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Route className="h-3 w-3" /> {data.extra.distance}
              </span>
            )}
            {data.extra.duration && (
              <span className="text-xs text-muted-foreground">⏱ {data.extra.duration}</span>
            )}
            {data.extra.participants && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <UserIcon className="h-3 w-3" /> {data.extra.participants}人参与
              </span>
            )}
            {data.extra.format && (
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                {data.extra.format}
              </span>
            )}
          </div>
        )}
      </div>
    </a>
  );
}
