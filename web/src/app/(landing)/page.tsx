'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  MapPin,
  ArrowRight,
  Route,
  Globe,
  Sparkles,
  ChevronDown,
  Trophy,
  Languages,
  Gift,
  Video,
  FileText,
  Map,
  Film,
  UserPlus,
  Star,
  Quote,
  Eye,
  Wifi,
  Camera,
  Navigation,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth-store';

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
            <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">关于</a>
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">特色</a>
            <a href="#highlights" className="text-sm text-muted-foreground hover:text-foreground transition-colors">功能</a>
            <a href="#scenarios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">场景</a>
          </div>
          <div className="flex items-center gap-3">
            {mounted && isAuthenticated ? (
              <Link
                href="/feed"
                className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
              >
                进入社区
              </Link>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ========== 一、Hero 全屏 ========== */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* 多层渐变背景 */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(160deg, #042f2e 0%, #0f766e 30%, #115e59 60%, #1a1a2e 100%)',
            }}
          />
          <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-accent/8 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            {/* 左侧：文案 */}
            <div className="text-center lg:text-left">
              <Badge variant="secondary" className="mb-8 px-4 py-1.5 text-sm">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                AI 驱动的第一视角旅行社交平台
              </Badge>

              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.1]">
                戴上眼镜
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10">走遍天下</span>
                  <span className="absolute bottom-2 left-0 right-0 h-3 bg-accent/30 -skew-x-3 z-0" />
                </span>
              </h1>

              <p className="mx-auto lg:mx-0 mt-8 max-w-xl text-lg text-white/70 leading-relaxed sm:text-xl">
                AI时代的第一视角旅行社交平台
                <br className="hidden sm:block" />
                用你的眼睛，记录世界；用AI，连接旅伴
              </p>

              <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row lg:justify-start sm:justify-center">
                {mounted && isAuthenticated ? (
                  <Link
                    href="/feed"
                    className="group inline-flex items-center gap-2.5 rounded-2xl bg-white px-10 py-4 text-base font-semibold text-primary shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all hover:-translate-y-0.5"
                  >
                    进入社区
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="group inline-flex items-center gap-2.5 rounded-2xl bg-white px-10 py-4 text-base font-semibold text-primary shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all hover:-translate-y-0.5"
                    >
                      立即加入
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-10 py-4 text-base font-semibold text-white hover:bg-white/10 transition-all backdrop-blur-sm"
                    >
                      已有账号？登录
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* 右侧：AR眼镜图片 */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                <img
                  src="/images/ar-glasses.svg"
                  alt="AR智能眼镜"
                  className="w-80 h-auto sm:w-96 lg:w-[500px] drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 滚动指示器 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </div>
      </section>

      {/* ========== 二、AR眼镜功能展示 ========== */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[100px] rounded-full" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4">
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              AR智能眼镜
            </Badge>
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              你的AI旅行伴侣
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-lg">
              专为旅行设计的AR智能眼镜，让AI成为你的第二双眼睛
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 items-center">
            {/* 左侧：功能列表 */}
            <div className="space-y-6">
              {[
                {
                  icon: Camera,
                  title: '4K第一视角拍摄',
                  desc: '1200万像素超清摄像头，120°广角视野，记录你眼中的每一帧精彩',
                  color: 'text-cyan-500',
                  bg: 'bg-cyan-500/10',
                },
                {
                  icon: Eye,
                  title: 'AR实景叠加',
                  desc: '智能识别景点、建筑、动植物，实时显示介绍、评分、历史故事',
                  color: 'text-primary',
                  bg: 'bg-primary/10',
                },
                {
                  icon: Languages,
                  title: '实时翻译字幕',
                  desc: '看到外文自动翻译，对话实时字幕，打破语言障碍',
                  color: 'text-accent',
                  bg: 'bg-accent/10',
                },
                {
                  icon: Navigation,
                  title: 'AR导航指引',
                  desc: '箭头、路线直接投射在视野中，再复杂的路口也不会迷路',
                  color: 'text-orange-500',
                  bg: 'bg-orange-500/10',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="group flex items-start gap-4 rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20"
                  >
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.bg} ${item.color} transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 右侧：AR眼镜功能环形图 */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-80 h-80">
                {/* 中心圆形 */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <Eye className="h-12 w-12 text-white" />
                </div>

                {/* 环形连接线 */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-2 border-dashed border-muted-foreground/20" />

                {/* 功能点 - 上 */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-card border shadow-md flex items-center justify-center">
                      <Camera className="h-5 w-5 text-cyan-500" />
                    </div>
                    <span className="text-xs font-medium">4K拍摄</span>
                  </div>
                </div>

                {/* 功能点 - 右 */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-card border shadow-md flex items-center justify-center">
                      <Languages className="h-5 w-5 text-accent" />
                    </div>
                    <span className="text-xs font-medium">实时翻译</span>
                  </div>
                </div>

                {/* 功能点 - 下 */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-card border shadow-md flex items-center justify-center">
                      <Navigation className="h-5 w-5 text-orange-500" />
                    </div>
                    <span className="text-xs font-medium">AR导航</span>
                  </div>
                </div>

                {/* 功能点 - 左 */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-card border shadow-md flex items-center justify-center">
                      <Wifi className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xs font-medium">实时连接</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 三、AR功能演示 ========== */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4">
              <Camera className="mr-1.5 h-3.5 w-3.5" />
              实景演示
            </Badge>
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              AR眼镜看世界
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-lg">
              透过AR眼镜，世界变得不同
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* 场景1：景点识别 */}
            <div className="group relative overflow-hidden rounded-3xl border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="aspect-video bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-8 flex items-center justify-center">
                <div className="relative">
                  <div className="w-48 h-32 rounded-xl border-2 border-dashed border-white/50 flex items-center justify-center">
                    <div className="text-center">
                      <Eye className="h-10 w-10 text-white/60 mx-auto mb-2" />
                      <p className="text-xs text-white/60">AR视野</p>
                    </div>
                  </div>
                  {/* AR标注效果 */}
                  <div className="absolute -top-2 -right-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg animate-pulse">
                    <p className="text-xs font-medium text-primary">故宫博物院</p>
                  </div>
                  <div className="absolute -bottom-2 -left-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg animate-pulse" style={{ animationDelay: '0.5s' }}>
                    <p className="text-xs font-medium text-accent">⭐ 4.9分</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold mb-2">智能景点识别</h3>
                <p className="text-sm text-muted-foreground">
                  对准任意景点，AR眼镜自动识别并显示名称、评分、历史介绍
                </p>
              </div>
            </div>

            {/* 场景2：实时翻译 */}
            <div className="group relative overflow-hidden rounded-3xl border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="aspect-video bg-gradient-to-br from-accent/20 to-orange-500/20 p-8 flex items-center justify-center">
                <div className="relative">
                  <div className="w-48 h-32 rounded-xl border-2 border-dashed border-white/50 flex items-center justify-center">
                    <div className="text-center">
                      <Languages className="h-10 w-10 text-white/60 mx-auto mb-2" />
                      <p className="text-xs text-white/60">翻译模式</p>
                    </div>
                  </div>
                  {/* 翻译效果 */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2">
                    <p className="text-white text-sm font-medium">Welcome → 欢迎光临</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold mb-2">实时翻译字幕</h3>
                <p className="text-sm text-muted-foreground">
                  看到外文自动翻译，对话实时字幕，出国旅行不再有语言障碍
                </p>
              </div>
            </div>

            {/* 场景3：AR导航 */}
            <div className="group relative overflow-hidden rounded-3xl border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="aspect-video bg-gradient-to-br from-teal-500/20 to-green-500/20 p-8 flex items-center justify-center">
                <div className="relative">
                  <div className="w-48 h-32 rounded-xl border-2 border-dashed border-white/50 flex items-center justify-center">
                    <div className="text-center">
                      <Navigation className="h-10 w-10 text-white/60 mx-auto mb-2" />
                      <p className="text-xs text-white/60">导航模式</p>
                    </div>
                  </div>
                  {/* 导航箭头 */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[30px] border-b-white/80 animate-bounce" />
                  </div>
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg">
                    <p className="text-xs font-medium text-teal-600">前方200米右转</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold mb-2">AR实景导航</h3>
                <p className="text-sm text-muted-foreground">
                  导航箭头直接投射在视野中，复杂路口也能轻松找到方向
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 四、平台介绍 ========== */}
      <section id="about" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Badge variant="outline" className="mb-6">关于平台</Badge>
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl mb-10">
            什么是徐霞客社区？
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              四百年前，徐霞客用脚步丈量山河，用笔墨记录见闻。
              <br />
              今天，我们用AR眼镜重走霞客路，用AI技术开启旅行新纪元。
            </p>
            <p className="text-foreground font-medium text-xl">
              徐霞客社区是全球首个AI驱动的第一视角旅行社交平台。
              <br />
              在这里，你的双眼就是镜头，你的声音就是游记，AI帮你记录每一步精彩。
            </p>
            <p>
              无论你是探索世界的旅行者，还是身不能至心向往之的观看者，
              <br />
              徐霞客社区都能让你找到志同道合的旅伴，开启属于你的霞客之旅。
            </p>
          </div>
        </div>
      </section>

      {/* ========== 五、核心特色 ========== */}
      <section id="features" className="relative py-24 sm:py-32 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4">核心特色</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              四大核心特色
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-lg">
              以技术驱动体验，以AI赋能创作，以社交连接旅伴
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                num: '01',
                title: '第一视角，身临其境',
                desc: '通过AR眼镜，跟随旅行者的眼睛看世界。不再是隔着屏幕的旁观，而是感同身受的同行。',
                color: 'text-primary',
              },
              {
                num: '02',
                title: 'AI记录，零门槛创作',
                desc: '边走边说，AI自动转文字、配图片、生成游记。无需剪辑技巧，AI帮你把旅途变成精彩故事。',
                color: 'text-accent',
              },
              {
                num: '03',
                title: '智能匹配，找到同路人',
                desc: 'AI分析你的旅行风格、兴趣偏好，为你推荐最合拍的旅伴，一起探索未知的世界。',
                color: 'text-teal-600',
              },
              {
                num: '04',
                title: 'AI助手，全程陪伴',
                desc: '实时翻译、景点讲解、路线推荐、安全提醒。你的专属AI导游，让每一次旅行都安心顺畅。',
                color: 'text-orange-500',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group relative rounded-3xl border bg-card p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20"
              >
                <span className={`mb-6 block text-4xl font-bold ${item.color} opacity-20`}>
                  {item.num}
                </span>
                <h3 className="mb-3 text-lg font-bold">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 六、功能亮点 ========== */}
      <section id="highlights" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4">功能亮点</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              探索无限可能
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-lg">
              从记录到分享，从社交到探索，一站式旅行体验
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Video, title: '第一视角直播', desc: '实时分享你的视角，与好友一起云旅行', color: 'text-primary', bg: 'bg-primary/10' },
              { icon: FileText, title: 'AI自动游记', desc: '语音转文字，AI帮你写游记', color: 'text-accent', bg: 'bg-accent/10' },
              { icon: Map, title: '3D轨迹地图', desc: '在3D地形上回放你的旅行路线', color: 'text-teal-600', bg: 'bg-teal-500/10' },
              { icon: Film, title: 'AI智能剪辑', desc: '自动提取高光，一键生成旅行大片', color: 'text-orange-500', bg: 'bg-orange-500/10' },
              { icon: UserPlus, title: '多人同游', desc: '多人视角共享，一起探索新地方', color: 'text-primary', bg: 'bg-primary/10' },
              { icon: Trophy, title: '探索成就', desc: '收集勋章、打卡地标、里程排行', color: 'text-accent', bg: 'bg-accent/10' },
              { icon: Languages, title: '实时翻译', desc: '打破语言障碍，畅游世界', color: 'text-teal-600', bg: 'bg-teal-500/10' },
              { icon: Gift, title: '虚拟互动', desc: 'AR礼物、空间评论、情感共鸣', color: 'text-orange-500', bg: 'bg-orange-500/10' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20"
                >
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${item.bg} ${item.color} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 font-bold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== 七、AR vs 传统设备 ========== */}
      <section className="relative py-24 sm:py-32 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4">
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              为什么选择AR眼镜
            </Badge>
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              AR眼镜 vs 传统设备
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-lg">
              解放双手，沉浸体验，AI赋能的全新旅行方式
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* AR眼镜 */}
            <div className="relative rounded-3xl border-2 border-primary bg-card p-8 shadow-xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-1.5">推荐</Badge>
              </div>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Eye className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">AR智能眼镜</h3>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  { text: '解放双手，边走边拍', icon: '✅' },
                  { text: '第一视角，沉浸体验', icon: '✅' },
                  { text: 'AI实时识别翻译', icon: '✅' },
                  { text: 'AR导航，所见即所得', icon: '✅' },
                  { text: '语音控制，无需触屏', icon: '✅' },
                  { text: '全天佩戴，轻若无物', icon: '✅' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 手机 */}
            <div className="rounded-3xl border bg-card p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Camera className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold">手机拍摄</h3>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  { text: '需要手持，占用双手', icon: '⚠️' },
                  { text: '第三人视角，距离感', icon: '⚠️' },
                  { text: '需手动打开翻译App', icon: '⚠️' },
                  { text: '地图导航需低头看', icon: '⚠️' },
                  { text: '需手动操作屏幕', icon: '⚠️' },
                  { text: '长时间举着很累', icon: '⚠️' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm text-muted-foreground">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 运动相机 */}
            <div className="rounded-3xl border bg-card p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Video className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold">运动相机</h3>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  { text: '需头戴或胸戴固定', icon: '⚠️' },
                  { text: '视角固定，不够灵活', icon: '⚠️' },
                  { text: '无AI识别功能', icon: '⚠️' },
                  { text: '无导航功能', icon: '⚠️' },
                  { text: '需后期剪辑处理', icon: '⚠️' },
                  { text: '额外负重，不够舒适', icon: '⚠️' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm text-muted-foreground">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 八、使用场景 ========== */}
      <section id="scenarios" className="relative py-24 sm:py-32 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4">使用场景</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              适合谁？
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-lg">
              无论你是哪种旅行者，都能在这里找到属于你的方式
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: '旅行达人',
                subtitle: '记录每一程',
                desc: '用第一视角记录旅行，AI自动生成游记。让更多人跟随你的眼睛，感受世界的精彩。',
                gradient: 'from-primary/10 to-primary/5',
              },
              {
                title: '旅行爱好者',
                subtitle: '云游四方',
                desc: '无法出行？戴上AR眼镜，跟随达人的眼睛，足不出户也能身临其境，探索世界的每个角落。',
                gradient: 'from-accent/10 to-accent/5',
              },
              {
                title: '户外探险者',
                subtitle: '探索未知',
                desc: '徒步、登山、骑行、自驾...记录你的每一次探险，找到志同道合的冒险伙伴。',
                gradient: 'from-teal-500/10 to-teal-500/5',
              },
              {
                title: '文化探索者',
                subtitle: '重走霞客路',
                desc: '追寻徐霞客的足迹，探索中华山河。AI讲解历史人文，让旅行更有深度。',
                gradient: 'from-orange-500/10 to-orange-500/5',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group relative rounded-3xl border bg-card p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative">
                  <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                  <p className="text-sm font-medium text-primary mb-3">{item.subtitle}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 九、数据展示 ========== */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4">社区数据</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              我们的足迹
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-lg">
              数以万计的旅行者已经在这里分享他们的故事
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { value: '10,000+', label: '探索者数量', icon: Users, color: 'text-primary' },
              { value: '50,000+', label: '已记录旅程', icon: MapPin, color: 'text-accent' },
              { value: '5,000+', label: '覆盖景点', icon: Globe, color: 'text-teal-600' },
              { value: '100万公里', label: '累计里程', icon: Route, color: 'text-orange-500' },
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

      {/* ========== 十、用户评价 ========== */}
      <section className="relative py-24 sm:py-32 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4">用户评价</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              他们怎么说
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                quote: '第一次用AR眼镜记录旅行，AI自动生成的游记让我惊喜。朋友说看我的视频就像自己去了一样！',
                name: '小明',
                role: '旅行博主',
                stars: 5,
              },
              {
                quote: '因为工作无法经常出行，但在徐霞客社区，我每天都能跟着不同的旅行者云游世界。',
                name: '小红',
                role: '上班族',
                stars: 5,
              },
              {
                quote: '在这里找到了一群热爱户外的朋友，我们一起徒步、露营、探索，AI推荐的旅伴真的很合拍！',
                name: '小刚',
                role: '户外爱好者',
                stars: 5,
              },
            ].map((item) => (
              <div
                key={item.name}
                className="group rounded-3xl border bg-card p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <Quote className="h-8 w-8 text-primary/20 mb-4" />
                <p className="text-muted-foreground leading-relaxed mb-6">
                  "{item.quote}"
                </p>
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: item.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-white">
                    {item.name[0]}
                  </div>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 十一、号召行动 CTA ========== */}
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
            开启你的霞客之旅
          </h2>
          <p className="mx-auto max-w-xl text-lg text-white/70 mb-12">
            无论你身在何处，世界就在你眼前。
            <br />
            戴上眼镜，与千万旅行者一起，探索无限可能。
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            {mounted && isAuthenticated ? (
              <Link
                href="/feed"
                className="group inline-flex items-center gap-2.5 rounded-2xl bg-white px-10 py-4 text-base font-semibold text-primary shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
              >
                进入社区
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <>
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
                <a
                  href="#about"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-10 py-4 text-base font-semibold text-white/80 hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  了解更多
                </a>
              </>
            )}
          </div>
          <p className="mt-12 text-sm text-white/40 italic">
            "大丈夫当朝碧海而暮苍梧" —— 徐霞客
          </p>
        </div>
      </section>

      {/* ========== 十二、页脚 ========== */}
      <footer className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-12 sm:grid-cols-4">
            {/* 品牌 */}
            <div className="sm:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-white shadow-lg">
                  徐
                </div>
                <span className="text-xl font-bold">徐霞客社区</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                AI时代的第一视角旅行社交平台
                <br />
                用你的眼睛，记录世界；用AI，连接旅伴
              </p>
              <div className="flex items-center gap-4 mt-6">
                {['微信', '微博', '抖音', '小红书'].map((platform) => (
                  <span
                    key={platform}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                  >
                    {platform[0]}
                  </span>
                ))}
              </div>
            </div>

            {/* 快速链接 */}
            <div>
              <h4 className="font-medium mb-4">快速链接</h4>
              <div className="space-y-3">
                {['首页', '功能', '下载', '关于', '帮助', '联系我们'].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* 联系方式 */}
            <div>
              <h4 className="font-medium mb-4">联系我们</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>邮箱：hello@xuxiake.com</p>
                <p>微信公众号：徐霞客社区</p>
                <p>客服热线：400-888-0000</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              © 2026 徐霞客社区. All Rights Reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">隐私政策</a>
              <a href="#" className="hover:text-foreground transition-colors">服务条款</a>
              <a href="#" className="hover:text-foreground transition-colors">用户协议</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
