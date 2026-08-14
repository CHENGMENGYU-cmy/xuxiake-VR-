'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useSnapStore } from '@/stores/snap-store';

export interface SnapPickerItem {
  id: string;
  image: string | null;
  locationName: string;
  content: string | null;
  createdAt?: string;
  _type?: string;
}

/** 取素材封面图 URL（mediaItems 优先，兼容 vrMetadata.image） */
export function getItemImage(item: any): string | null {
  if (item?.mediaItems?.length > 0) {
    const img = item.mediaItems[0];
    return img.thumbnailUrl || img.url || null;
  }
  try {
    const meta = typeof item?.vrMetadata === 'string' ? JSON.parse(item.vrMetadata) : item?.vrMetadata;
    if (meta?.image) return meta.image;
  } catch {}
  return null;
}

/** 合并闪拍素材，供选择器/引导共用 */
export function useSnapItems() {
  const { snaps, snapsLoading, fetchSnaps } = useSnapStore();
  const items = useMemo<SnapPickerItem[]>(() => {
    const merged = [...snaps]
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return merged.map((item: any) => ({
      id: item.id,
      image: getItemImage(item),
      locationName: item.locationName || item.location?.name || '',
      content: item.content || null,
      createdAt: item.createdAt,
      _type: 'SNAPSHOT',
    }));
  }, [snaps]);
  const loading = snapsLoading;
  const ensureLoaded = useCallback(() => {
    if (snaps.length === 0) fetchSnaps();
  }, [snaps.length, fetchSnaps]);
  return { items, loading, ensureLoaded };
}

/** 素材多选网格（纯展示），带月份分组/筛选，支持跨月选图 */
export function SnapPicker({
  items,
  selectedIds,
  onToggle,
  max = 9,
}: {
  items: SnapPickerItem[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  max?: number;
}) {
  const [monthFilter, setMonthFilter] = useState<string | null>(null);
  const atLimit = selectedIds.size >= max;

  // 提取所有素材的月份（如"2026年8月"），倒序
  const monthList = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) {
      if (!it.createdAt) continue;
      const d = new Date(it.createdAt);
      if (isNaN(d.getTime())) continue;
      set.add(`${d.getFullYear()}年${d.getMonth() + 1}月`);
    }
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [items]);

  const visibleItems = monthFilter
    ? items.filter((it) => {
        if (!it.createdAt) return false;
        const d = new Date(it.createdAt);
        return `${d.getFullYear()}年${d.getMonth() + 1}月` === monthFilter;
      })
    : items;

  return (
    <div>
      {monthList.length > 1 && (
        <div className="-mx-1 mb-2 flex gap-1.5 overflow-x-auto px-1 pb-1">
          <button
            type="button"
            onClick={() => setMonthFilter(null)}
            className={cn(
              'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
              monthFilter === null ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            全部
          </button>
          {monthList.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMonthFilter(m)}
              className={cn(
                'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                monthFilter === m ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {m}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-4 gap-2">
        {visibleItems.map((item) => {
          const selected = selectedIds.has(item.id);
          const disabled = !selected && atLimit;
          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => onToggle(item.id)}
              className={cn(
                'group relative aspect-square overflow-hidden rounded-xl border transition-all',
                selected ? 'border-primary ring-2 ring-primary/40' : 'border-transparent',
                disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:border-primary/40'
              )}
            >
              {item.image ? (
                <img src={item.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <FileText className="h-6 w-6 text-muted-foreground/40" />
                </div>
              )}
              {selected && <div className="absolute inset-0 bg-primary/25" />}
              {item.locationName && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-1 pb-0.5 pt-3">
                  <p className="truncate text-left text-[10px] text-white">{item.locationName}</p>
                </div>
              )}
              <div
                className={cn(
                  'absolute bottom-1.5 right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all',
                  selected
                    ? 'border-primary bg-primary text-white shadow-md ring-2 ring-white/80'
                    : 'border-slate-300 bg-white/90 text-transparent shadow-sm'
                )}
              >
                {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </div>
            </button>
          );
        })}
        {visibleItems.length === 0 && (
          <div className="col-span-4 py-12 text-center text-sm text-muted-foreground">
            {monthFilter ? '该月暂无素材' : '暂无素材，可跳过此步'}
          </div>
        )}
      </div>
    </div>
  );
}

/** 素材选择弹层（选完回传 ids） */
export function SnapPickerDialog({
  open,
  onOpenChange,
  initialIds = [],
  max = 9,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIds?: string[];
  max?: number;
  onConfirm: (ids: string[]) => void;
}) {
  const { items, loading, ensureLoaded } = useSnapItems();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const initialKey = initialIds.join(',');

  useEffect(() => {
    if (!open) return;
    setSelectedIds(new Set(initialKey ? initialKey.split(',') : []));
    ensureLoaded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialKey]);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < max) next.add(id);
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>选择素材</DialogTitle>
        </DialogHeader>
        <div className="max-h-[50vh] overflow-y-auto pr-1">
          {loading && items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            <SnapPicker items={items} selectedIds={selectedIds} onToggle={toggle} max={max} />
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={() => { onConfirm(Array.from(selectedIds)); onOpenChange(false); }}>
            确认（{selectedIds.size}/{max}）
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
