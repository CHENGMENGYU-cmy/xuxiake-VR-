'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Eye,
  Brain,
  Users,
  MapPin,
  ArrowRight,
  Play,
  MessageCircle,
  Route,
  Glasses,
  Globe,
  Sparkles,
  ChevronDown,
  Share2,
  Zap,
  Mountain,
  Camera,
  Compass,
  Heart,
  Shield,
  Wifi,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth-store';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // 已登录用户直接跳转到社区
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/feed');
    }
  }, [isAuthenticated, router]);

  // 已登录时不渲染落地页内容
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ========== 顶部导航 ========== */}
      <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-white shadow-lg">
              徐
            </div>
            <span className="text-xl font-bold tracking-wide">徐霞客</span>
          </Link>
          <div className="hidden items-center gap-8 sm:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">功能</a>
            <a href="#philosophy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">理念</a>
            <a href="#community" className="text-sm text-muted-foreground hover:text-foreground transition-colors">社区</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            >
              免费注册
            </Link>
          </div>
        </div>
      </nav>

      {/* ========== Hero 全屏 ========== */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* 多层渐变背景 */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(160deg, #042f2e 0%, #0f766e 30%, #115e59 60%, #1a1a2e 100%)',
            }}
          />
          {/* 动态光晕 */}
          <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-accent/8 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          {/* 网格点阵 */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          {/* 渐变遮罩 */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <Badge variant="secondary" className="mb-8 px-4 py-1.5 text-sm">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            AI 驱动的下一代旅行社交平台
          </Badge>

          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl leading-[1.1]">
            用<span className="relative inline-block">
              <span className="relative z-10">第一视角</span>
              <span className="absolute bottom-2 left-0 right-0 h-3 bg-accent/30 -skew-x-3 z-0" />
            </span>
            <br />
            <span className="text-white/90">重新定义旅行社交</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg text-white/70 leading-relaxed sm:text-xl">
            戴上智能眼镜，AI 帮你记录、分享、连接。
            <br className="hidden sm:block" />
            在这里，每一位旅行者都是故事的主角，每一段旅程都值得被世界看见。
          </p>

          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-white px-10 py-4 text-base font-semibold text-primary shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all hover:-translate-y-0.5"
            >
              开始探索
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-10 py-4 text-base font-semibold text-white hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              了解更多
            </a>
          </div>
        </div>

        {/* 滚动指示器 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </div>
      </section>

      {/* ========== 核心理念 ========== */}
      <section id="philosophy" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4">核心理念</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              三大核心，重新定义旅行
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-lg">
              以技术驱动体验，以社交连接人心，以第一视角记录真实
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: Eye,
                title: '第一视角',
                desc: '通过 AR 智能眼镜，以你的眼睛记录旅途。不再是旁观者的叙述，而是让每一位旅行者成为故事的主角，身临其境地分享每一个瞬间。',
                color: 'primary',
                gradient: 'from-primary/10 to-primary/5',
              },
              {
                icon: Brain,
                title: 'AI 驱动',
                desc: '大语言模型赋能旅行全流程——智能生成游记、实时翻译标识、精准匹配旅伴、个性化行程规划，让繁琐的事情交给 AI。',
                color: 'accent',
                gradient: 'from-accent/10 to-accent/5',
              },
              {
                icon: Users,
                title: '社交连接',
                desc: '基于地理位置、旅行风格和兴趣偏好，智能推荐志同道合的旅伴。让每一次出行都不再孤单，让旅行者相互连接、分享、启发。',
                color: 'teal-600',
                gradient: 'from-teal-500/10 to-teal-500/5',
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group relative rounded-3xl border bg-card p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20"
                >
                  <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-${item.color} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== 功能展示 ========== */}
      <section id="features" className="relative py-24 sm:py-32 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4">核心功能</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              为旅行者打造的每一个功能
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-lg">
              从记录到分享，从规划到社交，一站式解决
            </p>
          </div>

          <div className="space-y-32">
            {/* 功能 1：沉浸式记录 */}
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                  <Glasses className="h-4 w-4" />
                  沉浸式记录
                </div>
                <h3 className="mb-5 text-3xl font-bold leading-tight">
                  解放双手，<br />用眼睛记录世界
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-8 text-lg">
                  戴上 AR 智能眼镜，你只需要专注于眼前的风景。AI 自动识别景点、
                  记录轨迹、捕捉精彩瞬间，生成图文并茂的旅行日记。
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Camera, label: '第一视角视频录制' },
                    { icon: MapPin, label: 'AI 自动识别景点' },
                    { icon: Route, label: '智能轨迹记录' },
                    { icon: MessageCircle, label: '语音转文字记录' },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-3 rounded-xl bg-background p-3 border">
                      <f.icon className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="relative rounded-3xl border bg-gradient-to-br from-primary/5 to-accent/5 p-12 overflow-hidden">
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
                      <Glasses className="relative z-10 h-36 w-36 text-primary/50" />
                    </div>
                  </div>
                  <div className="mt-8 flex justify-center gap-4">
                    <div className="flex items-center gap-2 rounded-full bg-background/90 px-4 py-2 text-xs font-medium shadow-md backdrop-blur-sm">
                      <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      正在录制
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-background/90 px-4 py-2 text-xs font-medium shadow-md backdrop-blur-sm">
                      <MapPin className="h-3 w-3 text-primary" />
                      安徽·黄山·光明顶
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 rounded-full bg-background/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm">
                    4K · 60fps
                  </div>
                </div>
              </div>
            </div>

            {/* 功能 2：AI 智能助手 */}
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <div className="relative rounded-3xl border bg-gradient-to-br from-accent/5 to-primary/5 p-10 overflow-hidden">
                  <div className="space-y-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10">
                        <MessageCircle className="h-4 w-4 text-accent" />
                      </div>
                      <div className="rounded-2xl bg-background px-5 py-3.5 text-sm shadow-sm max-w-[80%]">
                        这座寺庙建于哪个朝代？有什么历史故事？
                      </div>
                    </div>
                    <div className="flex items-start gap-3 justify-end">
                      <div className="rounded-2xl bg-primary/10 px-5 py-3.5 text-sm max-w-[85%]">
                        <p className="font-medium text-primary mb-1.5">AI 助手</p>
                        <p className="text-foreground/80">
                          法隆寺始建于公元 607 年，由圣德太子主持建造，
                          是世界现存最古老的木构建筑群。它融合了中国南北朝时期的建筑风格...
                        </p>
                      </div>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Brain className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10">
                        <MessageCircle className="h-4 w-4 text-accent" />
                      </div>
                      <div className="rounded-2xl bg-background px-5 py-3.5 text-sm shadow-sm">
                        帮我生成今天的游记
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 rounded-full bg-background/60 px-2.5 py-1 text-[10px] text-muted-foreground backdrop-blur-sm">
                    AI 实时对话
                  </div>
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent mb-6">
                  <Zap className="h-4 w-4" />
                  AI 智能助手
                </div>
                <h3 className="mb-5 text-3xl font-bold leading-tight">
                  你的随身<br />旅行顾问
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-8 text-lg">
                  AI 助手随时待命，解答旅行疑问、翻译外语标识、推荐当地美食、
                  生成精美游记。你只管享受旅程，繁琐的事情交给 AI。
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Globe, label: '实时多语言翻译' },
                    { icon: Brain, label: '景点文化解读' },
                    { icon: Sparkles, label: '智能游记生成' },
                    { icon: Compass, label: '个性化行程推荐' },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-3 rounded-xl bg-background p-3 border">
                      <f.icon className="h-4 w-4 text-accent shrink-0" />
                      <span className="text-sm">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 功能 3：智能行程规划 */}
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-4 py-1.5 text-sm font-medium text-teal-600 mb-6">
                  <Route className="h-4 w-4" />
                  智能行程规划
                </div>
                <h3 className="mb-5 text-3xl font-bold leading-tight">
                  AI 为你<br />量身定制旅程
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-8 text-lg">
                  告诉 AI 你的偏好、预算和时间，它会参考社区里数千位旅行者的
                  真实经验，为你生成最优行程方案。
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Users, label: '基于真实经验推荐' },
                    { icon: Shield, label: '天气/人流智能避堵' },
                    { icon: Sparkles, label: '预算自动优化' },
                    { icon: Share2, label: '一键分享给旅伴' },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-3 rounded-xl bg-background p-3 border">
                      <f.icon className="h-4 w-4 text-teal-600 shrink-0" />
                      <span className="text-sm">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="relative rounded-3xl border bg-gradient-to-br from-teal-500/5 to-primary/5 p-10 overflow-hidden">
                  <div className="space-y-4">
                    {[
                      { time: '09:00', place: '黄山南大门', status: '已完成', icon: '✅', active: false },
                      { time: '10:30', place: '迎客松', status: '进行中', icon: '📍', active: true },
                      { time: '12:00', place: '光明顶', status: '待前往', icon: '🏔️', active: false },
                      { time: '14:00', place: '飞来石', status: '待前往', icon: '🪨', active: false },
                      { time: '16:00', place: '云谷寺', status: '待前往', icon: '⛩️', active: false },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-4 rounded-xl px-5 py-3.5 transition-all ${
                          item.active
                            ? 'bg-primary/10 border border-primary/20 shadow-sm'
                            : 'bg-background/60 border border-transparent'
                        }`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-xs text-muted-foreground font-mono w-12">{item.time}</span>
                        <span className={`text-sm font-medium flex-1 ${item.active ? 'text-primary' : ''}`}>
                          {item.place}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.active ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="absolute top-4 right-4 rounded-full bg-background/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm">
                    AI 智能规划
                  </div>
                </div>
              </div>
            </div>

            {/* 功能 4：沉浸式社交 */}
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <div className="relative rounded-3xl border bg-gradient-to-br from-orange-500/5 to-accent/5 p-10 overflow-hidden">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { icon: '🏔️', label: 'VR全景', desc: '360° 沉浸' },
                      { icon: '🎬', label: '空间视频', desc: '身临其境' },
                      { icon: '🗺️', label: '互动地图', desc: '轨迹回放' },
                      { icon: '📸', label: '360°照片', desc: '全景记录' },
                      { icon: '🎙️', label: '音频日记', desc: '声音记忆' },
                      { icon: '✍️', label: '图文游记', desc: '经典分享' },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex flex-col items-center gap-2 rounded-2xl bg-background/80 p-5 transition-all hover:scale-105 hover:shadow-md border"
                      >
                        <span className="text-3xl">{item.icon}</span>
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-[10px] text-muted-foreground">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-4 py-1.5 text-sm font-medium text-orange-600 mb-6">
                  <Share2 className="h-4 w-4" />
                  沉浸式社交
                </div>
                <h3 className="mb-5 text-3xl font-bold leading-tight">
                  让朋友身临其境<br />感受你的旅程
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-8 text-lg">
                  你的游记不只是文字和图片。支持 VR 全景、空间视频、互动地图等多种形式，
                  让观看者以你的视角重新体验那段旅程。
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Play, label: '多种富媒体形式' },
                    { icon: Eye, label: '第一视角视频' },
                    { icon: Wifi, label: '实时位置共享' },
                    { icon: Heart, label: '多人协作游记' },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-3 rounded-xl bg-background p-3 border">
                      <f.icon className="h-4 w-4 text-orange-500 shrink-0" />
                      <span className="text-sm">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 数据佐证 ========== */}
      <section id="community" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4">社区数据</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              一个正在成长的旅行社区
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-lg">
              数以万计的旅行者已经在这里分享他们的故事
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { value: '12,800+', label: '旅行者', icon: Users, color: 'text-primary' },
              { value: '45,600+', label: '旅行故事', icon: MessageCircle, color: 'text-accent' },
              { value: '1,200+', label: '覆盖城市', icon: MapPin, color: 'text-teal-600' },
              { value: '8,900+', label: 'VR 内容', icon: Play, color: 'text-orange-500' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="group text-center rounded-2xl border bg-card p-8 transition-all hover:shadow-lg hover:-translate-y-1">
                  <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted ${stat.color} transition-transform group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="text-4xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== 平台愿景 ========== */}
      <section className="relative py-24 sm:py-32 bg-muted/30">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Badge variant="outline" className="mb-6">平台愿景</Badge>
          <h2 className="text-3xl font-bold sm:text-4xl mb-8">
            我们相信，最好的旅行分享<br />不是告诉别人你看到了什么
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-4">
            而是让他们感受到你当时的震撼与感动。
          </p>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            徐霞客致力于打造 AI 时代最前沿的旅行社交平台，
            让每一次旅行都成为值得珍藏的人生体验，
            让每一位旅行者都能找到属于自己的旅行圈子。
          </p>
        </div>
      </section>

      {/* ========== 底部 CTA ========== */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(160deg, #042f2e 0%, #0f766e 30%, #115e59 60%, #f97316 100%)',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent_50%)]" />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          <h2 className="text-4xl font-bold text-white sm:text-5xl mb-6">
            开启你的旅行新篇章
          </h2>
          <p className="mx-auto max-w-xl text-lg text-white/70 mb-12">
            加入徐霞客，用第一视角记录世界，用 AI 连接旅伴，
            让每一段旅程都成为值得珍藏的人生体验。
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-white px-10 py-4 text-base font-semibold text-primary shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
            >
              免费注册
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/25 px-10 py-4 text-base font-semibold text-white hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              已有账号？登录
            </Link>
          </div>
          <p className="mt-12 text-sm text-white/40 italic">
            "大丈夫当朝碧海而暮苍梧" —— 徐霞客
          </p>
        </div>
      </section>

      {/* ========== 页脚 ========== */}
      <footer className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-white">
                徐
              </div>
              <div>
                <span className="text-sm font-bold">徐霞客</span>
                <span className="text-xs text-muted-foreground ml-2">
                  AI 时代的旅行社交平台
                </span>
              </div>
            </div>
            <div className="flex items-center gap-8 text-xs text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">功能</a>
              <a href="#philosophy" className="hover:text-foreground transition-colors">理念</a>
              <a href="#community" className="hover:text-foreground transition-colors">社区</a>
              <span>© 2026 徐霞客</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
