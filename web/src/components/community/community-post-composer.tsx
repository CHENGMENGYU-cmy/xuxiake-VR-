'use client';

import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/stores/auth-store';
import { createPost } from '@/lib/post-api';
import { ImagePlus, MapPin, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface CommunityPostComposerProps {
  communityId: string;
  onPostCreated?: () => void;
}

export function CommunityPostComposer({ communityId, onPostCreated }: CommunityPostComposerProps) {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [locationName, setLocationName] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      await createPost({
        content: content.trim(),
        communityId,
        location: locationName ? { lat: 0, lng: 0, name: locationName } : undefined,
      });
      setContent('');
      setLocationName('');
      setIsExpanded(false);
      toast.success('动态已发布');
      onPostCreated?.();
    } catch {
      toast.error('发布失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName} />
          <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3">
          <Textarea
            ref={textareaRef}
            placeholder="分享你的VR旅行体验..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            className="min-h-[60px] resize-none border-0 bg-muted/50 px-3 py-2 text-sm focus-visible:ring-0"
            rows={isExpanded ? 3 : 1}
          />

          {isExpanded && (
            <>
              {/* 位置输入 */}
              {locationName !== undefined && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="添加位置..."
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  {locationName && (
                    <button onClick={() => setLocationName('')} className="text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* 操作栏 */}
              <div className="flex items-center justify-between border-t pt-3">
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="text-muted-foreground" disabled>
                    <ImagePlus className="mr-1.5 h-4 w-4" />
                    图片
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setContent('');
                      setLocationName('');
                      setIsExpanded(false);
                    }}
                  >
                    取消
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!content.trim() || submitting}
                  >
                    {submitting ? (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : null}
                    发布
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
