'use client';

import { useState } from 'react';
import { Trophy, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { createCommunityChallenge } from '@/lib/social-api';
import { toast } from 'sonner';

interface CreateChallengeDialogProps {
  communityId: string;
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function CreateChallengeDialog({ communityId, open, onClose, onCreated }: CreateChallengeDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('0');
  const [reward, setReward] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error('请输入挑战名称'); return; }
    setSubmitting(true);
    try {
      await createCommunityChallenge(communityId, {
        name: name.trim(),
        description: description || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        maxParticipants: parseInt(maxParticipants) || 0,
        reward: reward || undefined,
        coverUrl: coverUrl || undefined,
      });
      toast.success('挑战创建成功');
      setName(''); setDescription(''); setStartDate(''); setEndDate(''); setMaxParticipants('0'); setReward(''); setCoverUrl('');
      onCreated?.();
      onClose();
    } catch {
      toast.error('创建失败');
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            创建社群挑战
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>挑战名称 *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="如：7天步行打卡挑战" />
          </div>
          <div className="space-y-1.5">
            <Label>描述</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>开始日期</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>结束日期</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>人数上限 (0=不限)</Label>
              <Input type="number" value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>奖励</Label>
              <Input value={reward} onChange={(e) => setReward(e.target.value)} placeholder="如：专属徽章" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>封面图URL</Label>
            <Input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button onClick={handleSubmit} disabled={submitting || !name.trim()}>
            {submitting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Trophy className="mr-1 h-4 w-4" />}
            创建挑战
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
