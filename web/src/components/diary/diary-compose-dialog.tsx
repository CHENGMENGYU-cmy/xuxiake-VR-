'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PenLine, Sparkles, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { SnapPicker, useSnapItems } from './snap-picker';

/** 写日记统一创作引导：先选素材 → 再选「自己写 / AI帮我写」 */
export function DiaryComposeDialog({
  open,
  onOpenChange,
  initialSelectedIds = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSelectedIds?: string[];
}) {
  const router = useRouter();
  const { items, loading, ensureLoaded } = useSnapItems();
  const [step, setStep] = useState<'material' | 'mode'>('material');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const initialKey = initialSelectedIds.join(',');

  useEffect(() => {
    if (!open) return;
    const ids = initialKey ? initialKey.split(',') : [];
    setSelectedIds(new Set(ids));
    setStep(ids.length > 0 ? 'mode' : 'material');
    ensureLoaded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialKey]);

  const ids = Array.from(selectedIds);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 9) next.add(id);
      return next;
    });
  };

  const goWrite = () => {
    router.push(`/upload?level=DIARY${ids.length ? `&snapIds=${ids.join(',')}` : ''}`);
    onOpenChange(false);
  };

  const goAI = () => {
    if (ids.length === 0) {
      toast.warning('AI 写日记需要至少选择 1 张素材');
      setStep('material');
      return;
    }
    router.push(`/snap/generate/batch?ids=${ids.join(',')}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === 'material' ? '选择素材' : '选择创作方式'}
          </DialogTitle>
        </DialogHeader>

        {step === 'material' && (
          <>
            <div className="max-h-[50vh] overflow-y-auto pr-1">
              {loading && items.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                <SnapPicker items={items} selectedIds={selectedIds} onToggle={toggle} max={9} />
              )}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={goWrite}>
                <PenLine className="h-4 w-4" />跳过，直接写
              </Button>
              <Button
                onClick={() => setStep('mode')}
                className="gap-1.5"
                disabled={selectedIds.size === 0}
              >
                下一步<ArrowRight className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'mode' && (
          <>
            <div className="space-y-2.5">
              {ids.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  已选 <span className="font-medium text-foreground">{ids.length}</span> 张素材
                </p>
              )}
              <button
                type="button"
                onClick={goWrite}
                className="group flex w-full items-center gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:border-primary/50 hover:bg-primary/5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                  <PenLine className="h-5 w-5" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold">✍️ 自己写</span>
                  <span className="block text-xs text-muted-foreground">记录今日所见所闻，素材将作为配图</span>
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                type="button"
                onClick={goAI}
                className="group flex w-full items-center gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:border-teal-500/50 hover:bg-teal-50/50 dark:hover:bg-teal-950/20"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-orange-400 text-white shadow-md shadow-teal-500/20">
                  <Sparkles className="h-5 w-5" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold">✨ AI 帮我写</span>
                  <span className="block text-xs text-muted-foreground">基于所选素材智能生成日记草稿，可再润色</span>
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setStep('material')} className="gap-1">
                <ArrowLeft className="h-4 w-4" />返回选素材
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
