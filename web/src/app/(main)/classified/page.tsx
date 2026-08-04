'use client';

import { useState, useEffect } from 'react';
import { FolderOpen, MapPin, Calendar, Tag } from 'lucide-react';
import { HierarchyList } from '@/components/feed/hierarchy-list';
import { useAuthStore } from '@/stores/auth-store';
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
  NOTE: '笔记',
};

export default function ClassifiedPage() {
  const { user } = useAuthStore();
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
        <h1 className="text-xl font-bold">我的日志</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        私人日志记录，按目的地、内容形式、时间分类浏览。日志为个人素材，不会公开。
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
        <div className="flex flex-wrap gap-2">
          {byLocation.map((loc) => (
            <button
              key={loc.name}
              onClick={() => setSelectedValue(selectedValue === loc.name ? null : loc.name)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors hover:bg-accent ${
                selectedValue === loc.name ? 'border-primary bg-primary/10 text-primary' : ''
              }`}
            >
              <MapPin className="h-3 w-3 text-teal-500" />
              {loc.name}
              <span className="text-muted-foreground">{loc.count}</span>
            </button>
          ))}
          {byLocation.length === 0 && (
            <p className="w-full text-center text-sm text-muted-foreground py-8">暂无地点数据</p>
          )}
        </div>
      )}

      {/* 按类型 - 内容形式 */}
      {activeDim === 'type' && (
        <div className="flex flex-wrap gap-2">
          {byType.map((t) => (
            <button
              key={t.type}
              onClick={() => setSelectedValue(selectedValue === t.type ? null : t.type)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors hover:bg-accent ${
                selectedValue === t.type ? 'border-primary bg-primary/10 text-primary' : ''
              }`}
            >
              <Tag className="h-3 w-3 text-orange-500" />
              {typeLabels[t.type] || t.type}
              <span className="text-muted-foreground">{t.count}</span>
            </button>
          ))}
          {byType.length === 0 && (
            <p className="w-full text-center text-sm text-muted-foreground py-8">暂无内容类型数据</p>
          )}
        </div>
      )}

      {/* 按时间 */}
      {activeDim === 'time' && (
        <div className="flex flex-wrap gap-2">
          {byTime.map((m) => (
            <button
              key={m.month}
              onClick={() => setSelectedValue(selectedValue === m.month ? null : m.month)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors hover:bg-accent ${
                selectedValue === m.month ? 'border-primary bg-primary/10 text-primary' : ''
              }`}
            >
              <Calendar className="h-3 w-3 text-primary" />
              {m.month}
              <span className="text-muted-foreground">{m.count}</span>
            </button>
          ))}
          {byTime.length === 0 && (
            <p className="w-full text-center text-sm text-muted-foreground py-8">暂无时间数据</p>
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
            userId={user?.id}
            emptyText="该分类下暂无内容"
            {...filterParams}
          />
        </div>
      )}
    </div>
  );
}
