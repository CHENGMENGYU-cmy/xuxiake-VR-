'use client';

import { useState, useEffect } from 'react';
import { Users, ChevronDown, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUserCommunities } from '@/lib/social-api';
import type { Community } from '@/types';

interface CommunitySelectorProps {
  selectedCommunity: Community | null;
  onCommunityChange: (community: Community | null) => void;
}

export function CommunitySelector({
  selectedCommunity,
  onCommunityChange,
}: CommunitySelectorProps) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // 加载用户社群
  useEffect(() => {
    const loadCommunities = async () => {
      setIsLoading(true);
      try {
        const data = await getUserCommunities();
        setCommunities(data);
      } catch (error) {
        console.error('加载社群失败:', error);
      }
      setIsLoading(false);
    };
    loadCommunities();
  }, []);

  const handleSelect = (community: Community | null) => {
    onCommunityChange(community);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-1.5">
        <Users className="h-4 w-4" />
        发布到社群（可选）
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            {selectedCommunity ? (
              <>
                {selectedCommunity.avatarUrl ? (
                  <img
                    src={selectedCommunity.avatarUrl}
                    alt={selectedCommunity.name}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-3 w-3 text-primary" />
                  </div>
                )}
                <span className="truncate">{selectedCommunity.name}</span>
              </>
            ) : (
              <span className="text-muted-foreground">选择要发布的社群...</span>
            )}
          </div>
          <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">加载中...</span>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto p-1">
                {/* 不选择社群 */}
                <button
                  type="button"
                  onClick={() => handleSelect(null)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors',
                    !selectedCommunity && 'bg-accent'
                  )}
                >
                  <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <span className="flex-1 text-left">不发布到社群</span>
                  {!selectedCommunity && <Check className="h-4 w-4 text-primary" />}
                </button>

                {/* 社群列表 */}
                {communities.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    还没有加入任何社群
                  </div>
                ) : (
                  communities.map((community) => (
                    <button
                      key={community.id}
                      type="button"
                      onClick={() => handleSelect(community)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors',
                        selectedCommunity?.id === community.id && 'bg-accent'
                      )}
                    >
                      {community.avatarUrl ? (
                        <img
                          src={community.avatarUrl}
                          alt={community.name}
                          className="h-5 w-5 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-3 w-3 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 text-left min-w-0">
                        <p className="truncate">{community.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {community.memberCount ?? 0} 成员
                        </p>
                      </div>
                      {selectedCommunity?.id === community.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
