'use client';

import { useState } from 'react';
import { Upload, Video, Image, Mic, Link2, Languages, FileUp, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';

type UploadTab = 'VIDEO' | 'IMAGE' | 'AUDIO' | 'LINK' | 'TRANSLATION';

const tabs: { key: UploadTab; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'VIDEO', label: 'VR视频', icon: Video, color: 'text-primary' },
  { key: 'IMAGE', label: 'VR图片', icon: Image, color: 'text-teal-500' },
  { key: 'AUDIO', label: '音频', icon: Mic, color: 'text-accent' },
  { key: 'LINK', label: '链接', icon: Link2, color: 'text-orange-500' },
  { key: 'TRANSLATION', label: '翻译', icon: Languages, color: 'text-teal-400' },
];

export default function UploadPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<UploadTab>('VIDEO');
  const [content, setContent] = useState('');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Upload className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">上传内容</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* 媒体类型选择 */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <Button
                  key={tab.key}
                  variant={isActive ? 'default' : 'outline'}
                  className={cn(
                    'gap-2',
                    isActive && ''
                  )}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <Icon className={cn('h-4 w-4', !isActive && tab.color)} />
                  {tab.label}
                </Button>
              );
            })}
          </div>

          <Separator className="my-4" />

          {/* 文字内容 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">说点什么...</label>
            <Textarea
              placeholder="分享你的VR旅程体验..."
              className="min-h-[100px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* 根据类型显示不同的上传区域 */}
          <div className="mt-4">
            {activeTab === 'VIDEO' && (
              <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary">
                <Video className="h-10 w-10 text-primary" />
                <div>
                  <p className="text-sm font-medium">拖拽VR视频到此处，或点击上传</p>
                  <p className="text-xs text-gray-500 mt-1">支持 MP4、MOV、WebM 格式，最大 2GB</p>
                  <p className="text-xs text-gray-400">支持 VR180、VR360、空间视频格式</p>
                </div>
                <Button variant="outline" size="sm">
                  <FileUp className="mr-1.5 h-4 w-4" />
                  选择视频文件
                </Button>
              </div>
            )}

            {activeTab === 'IMAGE' && (
              <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-green-400">
                <Image className="h-10 w-10 text-green-400" />
                <div>
                  <p className="text-sm font-medium">拖拽VR全景图片到此处，或点击上传</p>
                  <p className="text-xs text-gray-500 mt-1">支持 JPG、PNG、WebP、HEIC 格式，最大 50MB</p>
                  <p className="text-xs text-gray-400">支持 360° 全景图片</p>
                </div>
                <Button variant="outline" size="sm">
                  <FileUp className="mr-1.5 h-4 w-4" />
                  选择图片文件
                </Button>
              </div>
            )}

            {activeTab === 'AUDIO' && (
              <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-purple-400">
                <Mic className="h-10 w-10 text-purple-400" />
                <div>
                  <p className="text-sm font-medium">上传音频文件</p>
                  <p className="text-xs text-gray-500 mt-1">支持 MP3、WAV、AAC、OGG 格式，最大 100MB</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <FileUp className="mr-1.5 h-4 w-4" />
                    选择音频文件
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mic className="mr-1.5 h-4 w-4" />
                    录制音频
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'LINK' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">网页链接</label>
                  <Input type="url" placeholder="https://example.com" />
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">
                    输入链接后，系统会自动抓取网页标题、描述和图标
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'TRANSLATION' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">源语言</label>
                    <select className="w-full rounded-md border border-gray-200 p-2 text-sm">
                      <option value="zh-CN">中文（简体）</option>
                      <option value="en">English</option>
                      <option value="ja">日本語</option>
                      <option value="ko">한국어</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">目标语言</label>
                    <select className="w-full rounded-md border border-gray-200 p-2 text-sm">
                      <option value="en">English</option>
                      <option value="zh-CN">中文（简体）</option>
                      <option value="ja">日本語</option>
                      <option value="ko">한국어</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">原文内容</label>
                  <Textarea placeholder="输入需要翻译的文字内容..." className="min-h-[120px]" />
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Languages className="mr-1.5 h-4 w-4" />
                  开始翻译
                </Button>
              </div>
            )}
          </div>

          {/* 位置信息 */}
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium">位置信息（可选）</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input type="text" placeholder="添加拍摄地点..." className="pl-10" />
            </div>
          </div>

          {/* 发布按钮 */}
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline">保存草稿</Button>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Upload className="h-4 w-4" />
              发布内容
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
