'use client';

import { useState, useEffect } from 'react';
import { FolderOpen, MapPin, Calendar, Tag } from 'lucide-react';
import { FeedList } from '@/components/feed/feed-list';
import apiClient from '@/lib/api-client';

type Dimension = { name: string; count: number };
type TypeDim = { type: string; count: number };
type TimeDim = { month: string; count: number };

const typeLabels: Record<string, string> = {
  VR_MEDIA: '第一视角',
  IMAGE: '瞬间影像',
  AUDIO: '语音记录',
  ROUTE: '路线',
  JOURNEY: '旅程',
  GUIDE: '攻略',
  MOMENT: '瞬间',
  NOTE: '随记',
};

export default function ClassifiedPage() {
  const [activeDim, setActiveDim] = useState<'location' | 'type' | 'time'>('location');
  const [byLocation, setByLocation] = useState<Dimension[]>([]);
  const [byType, setByType] = useState<TypeDim[]>([]);
  const [byTime, setByTime] = useState<TimeDim[]>([]);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get('/posts/classified/dimensions').then((res) => {
      if (res.data?.success) {
        setByLocation(res.data.data.byLocation || []);
        setByType(res.data.data.byType || []);
        setByTime(res.data.data.byTime || []);
      }
    }).catch(() => {});
  }, []);

  const dimTabs = [
    { id: 'location' as const, label: '按地点', icon: MapPin },
    { id: 'type' as const, label: '按类型', icon: Tag },
    { id: 'time' as const, label: '按时间', icon: Calendar },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <FolderOpen className="h-6 w-6 text-amber-500" />
        <h1 className="text-xl font-bold">内容分类</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        自动按地点、类型、时间整理您的瞬间捕获，不带主观色彩。
      </p>

      {/* 分类维度切换 */}
      <div className="flex gap-1 border-b">
        {dimTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeDim === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveDim(tab.id); setSelectedValue(null); }}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 按地点 */}
      {activeDim === 'location' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {byLocation.map((loc) => (
            <button
              key={loc.name}
              onClick={() => setSelectedValue(selectedValue === loc.name ? null : loc.name)}
              className={`flex items-center gap-2 rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                selectedValue === loc.name ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <MapPin className="h-4 w-4 text-teal-500 shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{loc.name}</p>
                <p className="text-xs text-muted-foreground">{loc.count} 条瞬间</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 按类型 */}
      {activeDim === 'type' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {byType.map((t) => (
            <button
              key={t.type}
              onClick={() => setSelectedValue(selectedValue === t.type ? null : t.type)}
              className={`flex items-center gap-2 rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                selectedValue === t.type ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <Tag className="h-4 w-4 text-orange-500 shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{typeLabels[t.type] || t.type}</p>
                <p className="text-xs text-muted-foreground">{t.count} 条瞬间</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 按时间 */}
      {activeDim === 'time' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {byTime.map((m) => (
            <button
              key={m.month}
              onClick={() => setSelectedValue(selectedValue === m.month ? null : m.month)}
              className={`flex items-center gap-2 rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                selectedValue === m.month ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{m.month}</p>
                <p className="text-xs text-muted-foreground">{m.count} 条瞬间</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 选中分类后的内容列表 */}
      {selectedValue && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            分类结果: {selectedValue}
          </h3>
          <FeedList postType="VR_MEDIA" followingOnly={false} />
        </div>
      )}
    </div>
  );
}
