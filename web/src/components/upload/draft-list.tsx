'use client';

import { useState, useEffect } from 'react';
import { FileText, Trash2, Clock, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDraftList, deleteDraftFromList } from '@/lib/draft-api';

interface DraftItem {
  id: string;
  title: string;
  content: string;
  postType: string;
  formData?: Record<string, any>;
  preview?: string;
  savedAt: string;
}

interface DraftListProps {
  onSelectDraft: (draft: DraftItem) => void;
  refreshKey?: number;
}

const postTypeLabels: Record<string, string> = {
  '第一视角': '第一视角',
  '瞬间捕获': '瞬间捕获',
  '语音记录': '语音记录',
  '日记': '日记',
  '游记': '游记',
  NOTE: '随记',
  VR_MEDIA: '第一视角',
  JOURNEY: '游记',
  MOMENT: '瞬间',
};

const contentPreview = (text: string | undefined, maxLen = 10) => {
  const t = (text || '').replace(/\n/g, ' ');
  return t.length > maxLen ? t.slice(0, maxLen) + '...' : t;
};

export function DraftList({ onSelectDraft, refreshKey }: DraftListProps) {
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadDrafts();
  }, [refreshKey]);

  const loadDrafts = () => {
    const list = getDraftList();
    setDrafts(list);
  };

  const handleDelete = (e: React.MouseEvent, draftId: string) => {
    e.stopPropagation();
    deleteDraftFromList(draftId);
    loadDrafts();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  if (drafts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="py-2 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            草稿箱 ({drafts.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? '收起' : '展开'}
            {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="px-2 pb-2 pt-0">
          <div className="space-y-0.5">
            {drafts.map((draft) => (
              <button
                key={draft.id}
                onClick={() => onSelectDraft(draft)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-medium">
                      {postTypeLabels[draft.postType] || draft.postType}
                    </span>
                    <Clock className="h-3 w-3 shrink-0" />
                    <span className="shrink-0">{formatDate(draft.savedAt)}</span>
                  </div>
                  <p className="text-sm mt-0.5 truncate">
                    {contentPreview(draft.content, 35)}
                  </p>
                </div>
                <span
                  className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive transition-colors"
                  onClick={(e) => handleDelete(e, draft.id)}
                  role="button"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
