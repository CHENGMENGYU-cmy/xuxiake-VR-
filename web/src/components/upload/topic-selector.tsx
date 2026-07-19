'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Hash, X, Search, TrendingUp, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getHotTopics, searchTopics } from '@/lib/post-api';
import type { Topic } from '@/types';

interface TopicSelectorProps {
  selectedTopics: Topic[];
  onTopicsChange: (topics: Topic[]) => void;
  maxTopics?: number;
  content?: string; // 用于智能推荐
}

// 提取关键词（简单实现）
function extractKeywords(text: string): string[] {
  // 移除标点符号和特殊字符
  const cleaned = text.replace(/[^一-龥a-zA-Z0-9\s]/g, ' ');

  // 中文分词（简单按空格和常见词分割）
  const chineseWords = cleaned.match(/[一-龥]{2,}/g) || [];

  // 英文单词
  const englishWords = cleaned.match(/[a-zA-Z]{3,}/g) || [];

  // 合并并去重
  const allWords = [...chineseWords, ...englishWords.map(w => w.toLowerCase())];

  // 过滤常见停用词
  const stopWords = new Set([
    '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
    '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
    '自己', '这', '他', '她', '它', '们', '那', '些', '什么', '怎么', '如何', '可以',
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her',
    'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its',
    'may', 'new', 'now', 'old', 'see', 'way', 'who', 'did', 'got', 'let', 'say',
    'she', 'too', 'use',
  ]);

  const keywords = allWords.filter(word => !stopWords.has(word) && word.length >= 2);

  // 去重并返回
  return [...new Set(keywords)];
}

export function TopicSelector({
  selectedTopics,
  onTopicsChange,
  maxTopics = 5,
  content = '',
}: TopicSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Topic[]>([]);
  const [hotTopics, setHotTopics] = useState<Topic[]>([]);
  const [recommendedTopics, setRecommendedTopics] = useState<Topic[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 加载热门话题
  useEffect(() => {
    const loadHotTopics = async () => {
      try {
        const topics = await getHotTopics(10);
        setHotTopics(topics);
      } catch (error) {
        console.error('加载热门话题失败:', error);
      }
    };
    loadHotTopics();
  }, []);

  // 智能推荐话题（基于内容关键词）
  useEffect(() => {
    if (!content.trim()) {
      setRecommendedTopics([]);
      return;
    }

    const analyzeContent = async () => {
      try {
        // 提取关键词
        const keywords = extractKeywords(content);
        if (keywords.length === 0) {
          setRecommendedTopics([]);
          return;
        }

        // 搜索相关话题
        const allResults: Topic[] = [];
        for (const keyword of keywords.slice(0, 3)) {
          try {
            const results = await searchTopics(keyword);
            allResults.push(...results);
          } catch {}
        }

        // 去重并过滤已选择的
        const uniqueTopics = allResults.filter(
          (topic, index, self) =>
            index === self.findIndex((t) => t.id === topic.id) &&
            !selectedTopics.some((s) => s.id === topic.id)
        );

        // 按热度排序，取前5个
        const sorted = uniqueTopics
          .sort((a, b) => (b.postCount || 0) - (a.postCount || 0))
          .slice(0, 5);

        setRecommendedTopics(sorted);
      } catch (error) {
        console.error('智能推荐失败:', error);
        setRecommendedTopics([]);
      }
    };

    // 防抖
    const timer = setTimeout(analyzeContent, 500);
    return () => clearTimeout(timer);
  }, [content, selectedTopics]);

  // 搜索话题（防抖）
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchTopics(searchQuery.trim());
        setSearchResults(results);
      } catch (error) {
        console.error('搜索话题失败:', error);
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTopic = useCallback(
    (topic: Topic) => {
      if (selectedTopics.length >= maxTopics) {
        return;
      }
      if (selectedTopics.some((t) => t.id === topic.id)) {
        return;
      }
      onTopicsChange([...selectedTopics, topic]);
      setSearchQuery('');
      setSearchResults([]);
    },
    [selectedTopics, maxTopics, onTopicsChange]
  );

  const handleRemoveTopic = useCallback(
    (topicId: string) => {
      onTopicsChange(selectedTopics.filter((t) => t.id !== topicId));
    },
    [selectedTopics, onTopicsChange]
  );

  const handleCreateTopic = useCallback(() => {
    const name = searchQuery.trim();
    if (!name || selectedTopics.length >= maxTopics) return;

    // 创建临时话题对象
    const newTopic: Topic = {
      id: `new-${Date.now()}`,
      name: name.startsWith('#') ? name.slice(1) : name,
      postCount: 0,
    };

    onTopicsChange([...selectedTopics, newTopic]);
    setSearchQuery('');
    setSearchResults([]);
    setIsOpen(false);
  }, [searchQuery, selectedTopics, maxTopics, onTopicsChange]);

  // 过滤已选择的话题
  const filteredHotTopics = hotTopics.filter(
    (t) => !selectedTopics.some((s) => s.id === t.id)
  );

  const filteredSearchResults = searchResults.filter(
    (t) => !selectedTopics.some((s) => s.id === t.id)
  );

  const canCreateNew =
    searchQuery.trim() &&
    !filteredSearchResults.some(
      (t) => t.name.toLowerCase() === searchQuery.trim().toLowerCase()
    ) &&
    !selectedTopics.some(
      (t) => t.name.toLowerCase() === searchQuery.trim().toLowerCase()
    );

  return (
    <div className="space-y-2" ref={containerRef}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-1.5">
          <Hash className="h-4 w-4" />
          话题标签
        </label>
        {selectedTopics.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {selectedTopics.length}/{maxTopics}
          </span>
        )}
      </div>

      {/* 已选话题 */}
      {selectedTopics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTopics.map((topic) => (
            <span
              key={topic.id}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary"
            >
              #{topic.name}
              <button
                type="button"
                onClick={() => handleRemoveTopic(topic.id)}
                className="rounded-full hover:bg-primary/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 搜索输入框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="搜索或创建话题..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          disabled={selectedTopics.length >= maxTopics}
          className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* 下拉列表 */}
      {isOpen && (
        <div className="rounded-lg border bg-popover shadow-md max-h-60 overflow-y-auto">
          {/* 搜索结果 */}
          {searchQuery.trim() && filteredSearchResults.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1 text-xs text-muted-foreground">搜索结果</p>
              {filteredSearchResults.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => handleSelectTopic(topic)}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                >
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-left">{topic.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {topic.postCount} 篇内容
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* 创建新话题 */}
          {searchQuery.trim() && canCreateNew && (
            <div className="p-2 border-t">
              <button
                type="button"
                onClick={handleCreateTopic}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <Hash className="h-4 w-4 text-primary" />
                <span>创建话题 "{searchQuery.trim()}"</span>
              </button>
            </div>
          )}

          {/* 热门话题 */}
          {!searchQuery.trim() && filteredHotTopics.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1 text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                热门话题
              </p>
              {filteredHotTopics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => handleSelectTopic(topic)}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                >
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-left">{topic.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {topic.postCount} 篇内容
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* 空状态 */}
          {searchQuery.trim() && filteredSearchResults.length === 0 && !canCreateNew && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              未找到相关话题
            </div>
          )}
        </div>
      )}
    </div>
  );
}
