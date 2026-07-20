'use client';

import { Radio, Video, MapPin, Users, Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: Video,
    title: 'VR全景直播',
    description: '支持VR360/VR180沉浸式直播，让观众身临其境',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    icon: MapPin,
    title: '旅行实况',
    description: '直播时自动标记地理位置，观众可在地图上发现附近直播',
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
  },
  {
    icon: Users,
    title: '社群直播',
    description: '在社群内发起直播，与志同道合的旅伴实时互动',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    icon: Calendar,
    title: '直播预约',
    description: '提前发布直播预告，粉丝可预约并接收开播通知',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
];

export default function LivePage() {
  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center gap-2">
        <Radio className="h-6 w-6 text-red-500" />
        <h1 className="text-xl font-bold">直播广场</h1>
        <Badge className="bg-red-500/10 text-red-500 text-xs">即将上线</Badge>
      </div>

      {/* 占位Banner */}
      <Card className="overflow-hidden border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-violet-500/20">
            <Radio className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold">直播功能即将上线</h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            我们正在打造沉浸式VR旅行直播体验，让你能够实时分享旅途中的精彩瞬间
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" disabled>
              <Sparkles className="mr-2 h-4 w-4" />
              敬请期待
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 功能预告 */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">即将推出的功能</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="transition-all hover:shadow-md">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${feature.bg}`}>
                    <Icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium">{feature.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
