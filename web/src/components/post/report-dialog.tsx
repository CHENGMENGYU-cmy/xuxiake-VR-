'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';

const REPORT_REASONS = [
  '色情低俗', '暴力血腥', '违法信息', '垃圾广告',
  '虚假信息', '侵权内容', '隐私泄露', '其他',
];

interface ReportDialogProps {
  postId: string;
  open: boolean;
  onClose: () => void;
}

export function ReportDialog({ postId, open, onClose }: ReportDialogProps) {
  const [reason, setReason] = useState('');
  const [detail, setDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) { toast.error('请选择举报原因'); return; }
    setSubmitting(true);
    try {
      await apiClient.post(`/posts/${postId}/report`, { reason, detail: detail || undefined });
      toast.success('举报已提交，我们将尽快处理');
      onClose();
      setReason('');
      setDetail('');
    } catch {
      toast.error('举报提交失败');
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            举报内容
          </DialogTitle>
          <DialogDescription>
            请选择举报原因，我们会尽快审核处理
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          {REPORT_REASONS.map((r) => (
            <button
              key={r}
              onClick={() => setReason(r === reason ? '' : r)}
              className={`rounded-lg border p-2.5 text-sm transition-colors ${
                reason === r
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'hover:bg-accent'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <Textarea
          placeholder="补充说明（可选）"
          className="min-h-[80px]"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button onClick={handleSubmit} disabled={submitting || !reason}>
            {submitting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
            提交举报
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
