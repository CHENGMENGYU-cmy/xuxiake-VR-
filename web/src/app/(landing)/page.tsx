import Link from 'next/link';
import {
  Eye,
  Brain,
  Users,
  MapPin,
  Compass,
  ArrowRight,
  Play,
  MessageCircle,
  Heart,
  Route,
  Glasses,
  Globe,
  Sparkles,
  ChevronRight,
  Mountain,
  Camera,
  Share2,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ========== 顶部导航 ========== */}
      <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-white">
              徐
            </div>
            <span className="text-lg font-bold tracking-wide">徐霞客</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              注册
            </Link>
          </div>
        </div>
      </nav>

      {/* ========== Hero ========== */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-14">
        {/* 背景装饰 */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px]" />
          {/* 网格线 */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <Badge variant="secondary" className="mb-6">
            <Sparkles className="mr-1 h-3 w-3" />
            AI 驱动的旅行社交平台
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            用<span className="text-gradient-brand">第一视角</span>
            <br />
            重新定义旅行社交
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed sm:text-xl">
            戴上智能眼镜，AI 帮你记录、分享、连接。
            在这里，每一位旅行者都是故事的主角，
            每一段旅程都值得被世界看见。
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30 transition-all"
            >
              开始探索
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 rounded-xl border px-8 py-3.5 text-base font-semibold hover:bg-accent transition-colors"
            >
              了解更多
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* 滚动提示 */}
          <div className="mt-16 animate-bounce">
            <div className="mx-auto h-10 w-6 rounded-full border-2 border-muted-foreground/30 p-1">
              <div className="h-2 w-1.5 rounded-full bg-muted-foreground/40 mx-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* ========== 核心理念 ========== */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-14 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">三大核心理念</h2>
            <p className="mt-3 text-muted-foreground">
              以技术驱动体验，重新定义旅行社交的每一个环节
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {/* 第一视角 */}
            <div className="group relative rounded-2xl border bg-card p-8 transition-all hover:shadow-lg hover:border-primary/30">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-lg font-bold">第一视角</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                通过 AR 智能眼镜，以你的眼睛记录旅途。不再是旁观者的叙述，
                而是让每一位旅行者成为故事的主角，身临其境地分享每一个瞬间。
              </p>
            </div>

            {/* AI 驱动 */}
            <div className="group relative rounded-2xl border bg-card p-8 transition-all hover:shadow-lg hover:border-accent/30">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-lg font-bold">AI 驱动</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                大语言模型赋能旅行全流程 —— 智能生成游记、实时翻译标识、
                精准匹配旅伴、个性化行程规划，让繁琐的事情交给 AI。
              </p>
            </div>

            {/* 社交连接 */}
            <div className="group relative rounded-2xl border bg-card p-8 transition-all hover:shadow-lg hover:border-teal-500/30">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 transition-colors group-hover:bg-teal-600 group-hover:text-white">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-lg font-bold">社交连接</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                基于地理位置、旅行风格和兴趣偏好，智能推荐志同道合的旅伴。
                让每一次出行都不再孤单，让旅行者相互连接、分享、启发。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 功能展示 ========== */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-14 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">为旅行者打造的每一个功能</h2>
          <p className="mt-3 text-muted-foreground">
            从记录到分享，从规划到社交，一站式解决
          </p>
        </div>

        <div className="space-y-24">
          {/* 功能 1：沉浸式记录 */}
          <div className="grid items-center gap-10 sm:grid-cols-2">
            <div className="order-2 sm:order-1">
              <Badge variant="outline" className="mb-4">
                <Camera className="mr-1 h-3 w-3" />
                沉浸式记录
              </Badge>
              <h3 className="mb-4 text-2xl font-bold">
                解放双手，用眼睛记录世界
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                戴上 AR 智能眼镜，你只需要专注于眼前的风景。AI 自动识别景点、
                记录轨迹、捕捉精彩瞬间，生成图文并茂的旅行日记。
              </p>
              <ul className="space-y-3">
                {['第一视角视频录制', 'AI 自动识别景点信息', '智能轨迹记录与标注', '语音转文字实时记录'].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
            <div className="order-1 sm:order-2">
              <div className="relative rounded-2xl border bg-gradient-to-br from-primary/5 to-accent/5 p-10">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="h-48 w-48 rounded-3xl bg-gradient-brand opacity-10 blur-xl absolute inset-0" />
                    <Glasses className="h-32 w-32 text-primary/60 relative z-10" />
                  </div>
                </div>
                <div className="mt-6 flex justify-center gap-4">
                  <div className="flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-xs font-medium shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    REC
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-xs font-medium shadow-sm">
                    <MapPin className="h-3 w-3 text-primary" />
                    黄山·光明顶
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 功能 2：AI 智能助手 */}
          <div className="grid items-center gap-10 sm:grid-cols-2">
            <div>
              <div className="relative rounded-2xl border bg-gradient-to-br from-accent/5 to-primary/5 p-10">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
                      <MessageCircle className="h-4 w-4 text-accent" />
                    </div>
                    <div className="rounded-xl bg-background px-4 py-3 text-sm shadow-sm">
                      <p className="text-muted-foreground">这座寺庙建于哪个朝代？</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 justify-end">
                    <div className="rounded-xl bg-primary/10 px-4 py-3 text-sm max-w-[80%]">
                      <p>
                        <span className="font-medium text-primary">AI 助手：</span>
                        法隆寺始建于公元 607 年，由圣德太子主持建造，
                        是世界现存最古老的木构建筑群...
                      </p>
                    </div>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Brain className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
                      <MessageCircle className="h-4 w-4 text-accent" />
                    </div>
                    <div className="rounded-xl bg-background px-4 py-3 text-sm shadow-sm">
                      <p className="text-muted-foreground">帮我生成今天的游记</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Badge variant="outline" className="mb-4">
                <Zap className="mr-1 h-3 w-3" />
                AI 智能助手
              </Badge>
              <h3 className="mb-4 text-2xl font-bold">
                你的随身旅行顾问
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                AI 助手随时待命，解答旅行疑问、翻译外语标识、推荐当地美食、
                生成精美游记。你只管享受旅程，繁琐的事情交给 AI。
              </p>
              <ul className="space-y-3">
                {['实时多语言翻译', '景点历史与文化解读', '智能游记自动生成', '个性化行程推荐'].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          {/* 功能 3：智能行程规划 */}
          <div className="grid items-center gap-10 sm:grid-cols-2">
            <div className="order-2 sm:order-1">
              <Badge variant="outline" className="mb-4">
                <Route className="mr-1 h-3 w-3" />
                智能行程规划
              </Badge>
              <h3 className="mb-4 text-2xl font-bold">
                AI 为你量身定制旅程
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                告诉 AI 你的偏好、预算和时间，它会参考社区里数千位旅行者的
                真实经验，为你生成最优行程方案，并随时根据实际情况动态调整。
              </p>
              <ul className="space-y-3">
                {['基于真实旅行经验的推荐', '考虑天气/人流的智能避堵', '预算自动分配与优化', '行程可一键分享给旅伴'].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
            <div className="order-1 sm:order-2">
              <div className="relative rounded-2xl border bg-gradient-to-br from-teal-500/5 to-primary/5 p-10">
                <div className="space-y-3">
                  {[
                    { time: '09:00', place: '黄山南大门', status: '已完成', color: 'bg-teal-500' },
                    { time: '10:30', place: '迎客松', status: '进行中', color: 'bg-primary animate-pulse' },
                    { time: '12:00', place: '光明顶', status: '待前往', color: 'bg-muted-foreground/30' },
                    { time: '14:00', place: '飞来石', status: '待前往', color: 'bg-muted-foreground/30' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-lg bg-background/80 px-4 py-3">
                      <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                      <span className="text-xs text-muted-foreground font-mono w-12">{item.time}</span>
                      <span className="text-sm font-medium flex-1">{item.place}</span>
                      <span className="text-xs text-muted-foreground">{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 功能 4：沉浸式社交 */}
          <div className="grid items-center gap-10 sm:grid-cols-2">
            <div>
              <div className="relative rounded-2xl border bg-gradient-to-br from-orange-500/5 to-accent/5 p-10">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: '🏔️', label: 'VR全景' },
                    { icon: '🎬', label: '空间视频' },
                    { icon: '🗺️', label: '互动地图' },
                    { icon: '📸', label: '360°照片' },
                    { icon: '🎙️', label: '音频日记' },
                    { icon: '✍️', label: '图文游记' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex flex-col items-center gap-2 rounded-xl bg-background/80 p-4 transition-transform hover:scale-105"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-xs font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <Badge variant="outline" className="mb-4">
                <Share2 className="mr-1 h-3 w-3" />
                沉浸式社交
              </Badge>
              <h3 className="mb-4 text-2xl font-bold">
                让朋友身临其境感受你的旅程
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                你的游记不只是文字和图片。支持 VR 全景、空间视频、互动地图等多种形式，
                让观看者以你的视角重新体验那段旅程，感受真正的沉浸式分享。
              </p>
              <ul className="space-y-3">
                {['多种富媒体内容形式', '第一视角视频分享', '实时位置共享与互动', '多人协作游记创作'].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 数据佐证 ========== */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">一个正在成长的旅行社区</h2>
            <p className="mt-3 text-muted-foreground">
              数以万计的旅行者已经在这里分享他们的故事
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { value: '12,800+', label: '旅行者', icon: Users },
              { value: '45,600+', label: '旅行故事', icon: MessageCircle },
              { value: '1,200+', label: '覆盖城市', icon: MapPin },
              { value: '8,900+', label: 'VR 内容', icon: Play },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== 底部 CTA ========== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-brand" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
            开启你的旅行新篇章
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
            加入徐霞客，用第一视角记录世界，用 AI 连接旅伴，
            让每一段旅程都成为值得珍藏的人生体验。
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-primary shadow-lg hover:bg-white/90 transition-colors"
            >
              免费注册
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-8 py-3.5 text-base font-semibold text-primary-foreground hover:bg-white/10 transition-colors"
            >
              已有账号？登录
            </Link>
          </div>
          <p className="mt-6 text-sm text-primary-foreground/60 italic">
            "大丈夫当朝碧海而暮苍梧" —— 徐霞客
          </p>
        </div>
      </section>

      {/* ========== 页脚 ========== */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-brand text-[10px] font-bold text-white">
                徐
              </div>
              <span className="text-sm font-semibold">徐霞客</span>
              <span className="text-xs text-muted-foreground">
                — AI 时代的旅行社交平台
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <span>© 2026 徐霞客. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
