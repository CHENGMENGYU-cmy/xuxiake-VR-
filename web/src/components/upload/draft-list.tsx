'use client';

import { useState, useEffect } from 'react';
import { FileText, Trash2, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDraftList, deleteDraftFromList } from '@/lib/draft-api';
import { cn } from '@/lib/utils';

interface DraftItem {
  id: string;
  title: string;
  content: string;
  postType: string;
  preview?: string;
  savedAt: string;
}

interface DraftListProps {
  onSelectDraft: (draft: DraftItem) => void;
}

const postTypeLabels: Record<string, string> = {
  NOTE: '笔记',
  VR_MEDIA: 'VR媒体',
  ROUTE: '路线',
  JOURNEY: '旅程',
  GUIDE: '攻略',
};

export function DraftList({ onSelectDraft }: DraftListProps) {
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = () => {
    const list = getDraftList();
    setDrafts(list);
  };

  const handleDelete = (draftId: string) => {
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
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            草稿箱 ({drafts.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? '收起' : '展开'}
          </Button>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent>
          <div className="space-y-2">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {postTypeLabels[draft.postType] || draft.postType}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(draft.savedAt)}
                    </span>
                  </div>
                  <p className="text-sm font-medium mt-1 truncate">
                    {draft.title || '无标题'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {draft.content || draft.preview || '暂无内容'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectDraft(draft)}
                    className="h-8 w-8 p-0"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(draft.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
