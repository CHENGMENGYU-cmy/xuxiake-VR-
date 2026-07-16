import { Metadata } from 'next';
import Link from 'next/link';
import {
  Sparkles,
  Users,
  MapPin,
  Compass,
  ArrowRight,
  Play,
  MessageCircle,
  Heart,
  Route,
  Brain,
  Glasses,
  Globe,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { mockUsers } from '@/lib/mock-data';

export const metadata: Metadata = {
  title: '关于徐霞客 - AI时代的旅行社交平台',
  description: '以第一视角重新定义旅行社交体验，融合AR技术与AI智能，开启探索世界的新方式',
};

const featuredStories = [
  {
    id: 1,
    author: mockUsers[0],
    title: '用AR眼镜记录的黄山日出',
    excerpt: '当我戴上眼镜站在光明顶，第一缕阳光穿透云海的那一刻，我知道这不只是照片能记录的...',
    likes: 2341,
    comments: 189,
    location: '安徽·黄山',
    tag: 'VR全景',
  },
  {
    id: 2,
    author: mockUsers[1],
    title: '在京都寺庙里遇见AI翻译的惊喜',
    excerpt: '走进伏见稻荷大社，AI助手自动识别出千本鸟居的历史，用中文为我讲述这座千年神社的故事...',
    likes: 1892,
    comments: 156,
    location: '日本·京都',
    tag: 'AI翻译',
  },
  {
    id: 3,
    author: mockUsers[2],
    title: '和陌生旅伴一起穿越张家界天门山',
    excerpt: '在平台上发布了天门山徒步计划，没想到找到了三个志同道合的伙伴。我们一起走过了玻璃栈道...',
    likes: 1567,
    comments: 203,
    location: '湖南·张家界',
    tag: '旅伴匹配',
  },
];

const communityStats = [
  { label: '旅行者', value: '12,800+', icon: Users },
  { label: '旅行故事', value: '45,600+', icon: MessageCircle },
  { label: '覆盖城市', value: '1,200+', icon: MapPin },
  { label: 'VR内容', value: '8,900+', icon: Play },
];

const features = [
  {
    icon: Glasses,
    title: '第一视角记录',
    description: '戴上AR眼镜，解放双手，用你的眼睛记录旅途中的每一个瞬间。不再是旁观者的叙述，而是你就是故事的主角。',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Brain,
    title: 'AI智能助手',
    description: 'AI帮你自动生成游记、推荐景点、翻译标识、匹配旅伴。你只管享受旅程，繁琐的事情交给AI。',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  {
    icon: Route,
    title: '智能行程规划',
    description: '告诉AI你的偏好、预算和时间，它会参考社区里真实的旅行经验，为你量身定制行程方案。',
    color: 'text-teal-600',
    bgColor: 'bg-teal-500/10',
  },
  {
    icon: Globe,
    title: '沉浸式分享',
    description: '你的游记不只是文字和图片，还可以是360°全景、空间视频、互动地图。让朋友身临其境地感受你的旅程。',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-5 pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-brand-subtle">
        <div className="relative z-10 px-6 py-6">
          <div className="mx-auto max-w-[640px]">
            <Badge variant="secondary" className="mb-3">
              <Sparkles className="mr-1 h-3 w-3" />
              AI 时代的旅行社区
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              用<span className="text-gradient-brand">第一视角</span>，重新定义旅行社交
            </h1>
            <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
              在这里，每一位旅行者都是故事的主角。戴上智能眼镜，AI帮你记录、分享、连接。
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/feed"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                开始探索
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-lg border bg-background px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
              >
                <Compass className="h-4 w-4" />
                发现旅行者
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 -z-10">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
        </div>
      </section>

      {/* 社区数据 */}
      <section className="grid grid-cols-4 gap-3">
        {communityStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex flex-col items-center gap-1 rounded-xl bg-muted/50 py-3">
              <Icon className="h-4 w-4 text-primary" />
              <span className="text-lg font-bold">{stat.value}</span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          );
        })}
      </section>

      {/* 精选故事 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Heart className="h-4 w-4 text-accent" />
            旅行者的故事
          </h2>
          <Link href="/feed" className="text-xs text-primary hover:underline flex items-center gap-1">
            查看更多 <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {featuredStories.map((story) => (
            <Card key={story.id} className="group cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={story.author.avatarUrl} alt={story.author.displayName} />
                    <AvatarFallback>{story.author.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{story.author.displayName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {story.location}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {story.tag}
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-1">
                  {story.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {story.excerpt}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" /> {story.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" /> {story.comments}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 核心功能 */}
      <section>
        <h2 className="text-base font-bold mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          在徐霞客，你可以...
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${feature.bgColor}`}>
                    <Icon className={`h-4 w-4 ${feature.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-0.5">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 社区理念 */}
      <section className="rounded-xl bg-primary/5 border border-primary/10 px-5 py-4 text-center">
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
          我们用AI技术降低记录的门槛，用第一视角提升分享的真实感，
          让每一次旅行都成为值得珍藏的人生体验。
        </p>
        <p className="mt-3 text-xs text-muted-foreground/70 italic">
          "大丈夫当朝碧海而暮苍梧" —— 徐霞客
        </p>
      </section>

      {/* 快速入口 */}
      <section className="grid gap-3 sm:grid-cols-3">
        <Link href="/feed">
          <Card className="group cursor-pointer hover:border-primary/50 transition-colors">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Compass className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm group-hover:text-primary transition-colors">浏览动态</p>
                <p className="text-xs text-muted-foreground">看看旅行者们在分享什么</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/explore">
          <Card className="group cursor-pointer hover:border-primary/50 transition-colors">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                <Users className="h-4 w-4 text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm group-hover:text-primary transition-colors">发现旅伴</p>
                <p className="text-xs text-muted-foreground">找到志同道合的旅行者</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/upload">
          <Card className="group cursor-pointer hover:border-primary/50 transition-colors">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10">
                <Play className="h-4 w-4 text-teal-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm group-hover:text-primary transition-colors">分享旅程</p>
                <p className="text-xs text-muted-foreground">用第一视角记录你的旅行</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </section>
    </div>
  );
}
