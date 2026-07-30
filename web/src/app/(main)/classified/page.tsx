'use client';

import { useState, useEffect } from 'react';
import { FolderOpen, MapPin, Calendar, Tag } from 'lucide-react';
import { HierarchyList } from '@/components/feed/hierarchy-list';
import apiClient from '@/lib/api-client';

type Dimension = { name: string; count: number };
type TypeDim = { type: string; count: number };
type TimeDim = { month: string; count: number };

const typeLabels: Record<string, string> = {
  VR_MEDIA: '第一视角',
  IMAGE: '瞬间影像',
  AUDIO: '语音记录',
  JOURNEY: '游记',
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
    { id: 'location' as const, label: '目的地', icon: MapPin },
    { id: 'type' as const, label: '内容形式', icon: Tag },
    { id: 'time' as const, label: '时间', icon: Calendar },
  ];

  // 根据当前维度和选中值构建过滤参数
  const filterParams = selectedValue ? (
    activeDim === 'location' ? { location: selectedValue } :
    activeDim === 'type' ? { mediaType: selectedValue } :
    { month: selectedValue }
  ) : {};

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <FolderOpen className="h-6 w-6 text-amber-500" />
        <h1 className="text-xl font-bold">旅途档案</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        所有内容的归档整理，多维度浏览。
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

      {/* 按地点 - 目的地 */}
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
                <p className="text-xs text-muted-foreground">{loc.count} 条内容</p>
              </div>
            </button>
          ))}
          {byLocation.length === 0 && (
            <p className="col-span-full text-center text-sm text-muted-foreground py-8">
              暂无地点数据
            </p>
          )}
        </div>
      )}

      {/* 按类型 - 内容形式 */}
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
                <p className="text-xs text-muted-foreground">{t.count} 条内容</p>
              </div>
            </button>
          ))}
          {byType.length === 0 && (
            <p className="col-span-full text-center text-sm text-muted-foreground py-8">
              暂无内容类型数据
            </p>
          )}
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
                <p className="text-xs text-muted-foreground">{m.count} 条内容</p>
              </div>
            </button>
          ))}
          {byTime.length === 0 && (
            <p className="col-span-full text-center text-sm text-muted-foreground py-8">
              暂无时间数据
            </p>
          )}
        </div>
      )}

      {/* 选中分类后的内容列表 — 使用层级API按维度过滤 */}
      {selectedValue && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            {activeDim === 'location' ? '目的地' :
             activeDim === 'type' ? '内容形式' : '时间'}: {selectedValue}
          </h3>
          <HierarchyList
            key={`${activeDim}-${selectedValue}`}
            level="SNAPSHOT"
            emptyText="该分类下暂无内容"
            {...filterParams}
          />
        </div>
      )}
    </div>
  );
}
