'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Clock, X, Users, FileText } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { mockUsers, mockPosts } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

interface SearchSuggestionsProps {
  query: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

const SEARCH_HISTORY_KEY = 'search-history';
const MAX_HISTORY = 5;

function getSearchHistory(): string[] {
  if (typeof window === 'undefined') return [];
  const history = localStorage.getItem(SEARCH_HISTORY_KEY);
  return history ? JSON.parse(history) : [];
}

function addToSearchHistory(query: string) {
  const history = getSearchHistory().filter((h) => h !== query);
  history.unshift(query);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

function removeFromSearchHistory(query: string) {
  const history = getSearchHistory().filter((h) => h !== query);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
}

export function SearchSuggestions({ query, onSelect, onClose }: SearchSuggestionsProps) {
  const router = useRouter();
  const [history, setHistory] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(getSearchHistory());
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const filteredUsers = query.trim()
    ? mockUsers.filter(
        (u) =>
          u.displayName.toLowerCase().includes(query.toLowerCase()) ||
          u.username.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3)
    : [];

  const filteredPosts = query.trim()
    ? mockPosts.filter((p) => p.content?.toLowerCase().includes(query.toLowerCase())).slice(0, 3)
    : [];

  const hasResults = filteredUsers.length > 0 || filteredPosts.length > 0;
  const showHistory = !query.trim() && history.length > 0;

  const handleSelect = (value: string) => {
    addToSearchHistory(value);
    onSelect(value);
  };

  const handleRemoveHistory = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    removeFromSearchHistory(item);
    setHistory(getSearchHistory());
  };

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 z-50 mt-1 w-full rounded-lg border bg-card p-2 shadow-lg"
    >
      {/* 搜索历史 */}
      {showHistory && (
        <div>
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-xs font-medium text-muted-foreground">最近搜索</span>
          </div>
          {history.map((item) => (
            <div
              key={item}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted"
              onClick={() => handleSelect(item)}
            >
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-sm">{item}</span>
              <button
                className="rounded p-0.5 hover:bg-background"
                onClick={(e) => handleRemoveHistory(e, item)}
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 搜索建议 */}
      {query.trim() && hasResults && (
        <div>
          {/* 用户建议 */}
          {filteredUsers.length > 0 && (
            <div>
              <div className="flex items-center gap-1 px-2 py-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">用户</span>
              </div>
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted"
                  onClick={() => {
                    addToSearchHistory(user.displayName);
                    router.push(`/profile/${user.username}`);
                    onClose();
                  }}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                    <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{user.displayName}</p>
                    <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredUsers.length > 0 && filteredPosts.length > 0 && (
            <Separator className="my-1" />
          )}

          {/* 内容建议 */}
          {filteredPosts.length > 0 && (
            <div>
              <div className="flex items-center gap-1 px-2 py-1">
                <FileText className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">内容</span>
              </div>
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted"
                  onClick={() => handleSelect(post.content?.slice(0, 30) || '')}
                >
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 truncate text-sm">{post.content}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 搜索全部 */}
      {query.trim() && (
        <div
          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted"
          onClick={() => handleSelect(query)}
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            搜索 <span className="font-medium">&quot;{query}&quot;</span>
          </span>
        </div>
      )}

      {/* 无结果 */}
      {query.trim() && !hasResults && (
        <div className="px-2 py-4 text-center text-sm text-muted-foreground">
          输入关键词搜索用户和内容
        </div>
      )}
    </div>
  );
}
