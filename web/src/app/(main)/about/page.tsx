import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '关于徐霞客 - AI时代的旅行社交平台',
  description: '以第一视角重新定义旅行社交体验，融合AR技术与AI智能，开启探索世界的新方式',
};

export default function AboutPage() {
  return (
    <div className="space-y-12 pb-8">
      {/* Hero 区域 */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-brand-subtle">
        <div className="relative z-10 px-6 py-16 sm:px-12 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-gradient-brand">徐霞客</span>
            </h1>
            <p className="mt-4 text-xl text-muted-foreground sm:text-2xl">
              以第一视角，重新定义旅行社交
            </p>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              融合AR眼镜的第一视角体验，构建以旅行记录和游记分享为核心的社交生态系统
            </p>
          </div>
        </div>
        {/* 装饰性背景元素 */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
        </div>
      </section>

      {/* 第一视角理念 */}
      <section className="rounded-xl border bg-card p-6 sm:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
                <line x1="21.17" y1="8" x2="12" y2="8" />
                <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
                <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">第一视角理念</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">身临其境的记录方式</h3>
              <p className="text-muted-foreground leading-relaxed">
                徐霞客平台首创第一视角旅行记录理念，通过AR眼镜等智能设备，
                让旅行者以最自然的方式记录旅途中的每一个精彩瞬间。
                不再是旁观者的叙述，而是让每一位旅行者成为故事的主角。
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">沉浸式的分享体验</h3>
              <p className="text-muted-foreground leading-relaxed">
                当你分享旅行经历时，观看者能够以你的视角重新体验那段旅程。
                这种前所未有的分享方式，让社交不再局限于文字和图片，
                而是真正的情感共鸣和体验传递。
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground italic">
              "我们相信，最好的旅行分享不是告诉别人你看到了什么，
              而是让他们感受到你当时的震撼与感动。"
            </p>
          </div>
        </div>
      </section>

      {/* AI时代设计理念 */}
      <section className="rounded-xl border bg-card p-6 sm:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-accent"
              >
                <path d="M12 2a4 4 0 0 0-4 4c0 2 2 3 2 6h4c0-3 2-4 2-6a4 4 0 0 0-4-4z" />
                <path d="M10 14h4" />
                <path d="M12 14v6" />
                <path d="M8 22h8" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">AI时代的设计理念</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-3 rounded-lg bg-background p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                01
              </div>
              <h3 className="font-semibold">智能内容生成</h3>
              <p className="text-sm text-muted-foreground">
                利用大语言模型技术，AI助手能够智能分析旅行轨迹、
                识别景点信息，自动生成精美的游记文案和旅行攻略。
              </p>
            </div>

            <div className="space-y-3 rounded-lg bg-background p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                02
              </div>
              <h3 className="font-semibold">精准兴趣匹配</h3>
              <p className="text-sm text-muted-foreground">
                基于用户的旅行偏好、兴趣标签和行为数据，
                AI算法能够精准推荐志同道合的旅伴和个性化内容。
              </p>
            </div>

            <div className="space-y-3 rounded-lg bg-background p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                03
              </div>
              <h3 className="font-semibold">智能交互体验</h3>
              <p className="text-sm text-muted-foreground">
                AI驱动的智能助手随时解答旅行疑问，
                提供实时翻译、文化解读等贴心服务，
                让旅行更加轻松愉快。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 社交平台特色 */}
      <section className="rounded-xl border bg-card p-6 sm:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-teal-600"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">社交平台特色</h2>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-teal-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">旅行者社区</h3>
                <p className="text-sm text-muted-foreground">
                  构建专属旅行者的社交圈层，基于地理位置、旅行风格和兴趣偏好，
                  智能推荐志同道合的旅伴，让每一次出行都不再孤单。
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-teal-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">沉浸式游记</h3>
                <p className="text-sm text-muted-foreground">
                  突破传统图文形式，支持AR/VR内容、第一视角视频、
                  互动地图等多种富媒体形式，让游记真正"活"起来。
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-teal-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">智能行程规划</h3>
                <p className="text-sm text-muted-foreground">
                  AI根据你的偏好、预算和时间，智能生成个性化行程方案，
                  并可参考社区内其他旅行者的真实经验进行优化。
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-teal-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">实时互动体验</h3>
                <p className="text-sm text-muted-foreground">
                  支持直播、实时位置共享、多人协作游记等功能，
                  让旅行社交突破时空限制，随时随地与旅伴互动。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 平台愿景 */}
      <section className="rounded-xl bg-gradient-brand p-6 sm:p-8 text-primary-foreground">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">我们的愿景</h2>
          <p className="mt-4 text-lg leading-8 opacity-90">
            徐霞客致力于打造AI时代最前沿的旅行社交平台，
            让每一次旅行都成为值得珍藏的人生体验，
            让每一位旅行者都能找到属于自己的旅行圈子。
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/feed"
              className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary shadow-sm hover:bg-white/90 transition-colors"
            >
              开始探索
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-white/10 transition-colors"
            >
              发现更多
            </Link>
          </div>
        </div>
      </section>

      {/* 技术架构 */}
      <section className="rounded-xl border bg-card p-6 sm:p-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold mb-6">技术架构</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-background p-4 text-center">
              <div className="text-2xl font-bold text-primary">Next.js</div>
              <p className="mt-1 text-xs text-muted-foreground">前端框架</p>
            </div>
            <div className="rounded-lg border bg-background p-4 text-center">
              <div className="text-2xl font-bold text-primary">Spring Boot</div>
              <p className="mt-1 text-xs text-muted-foreground">后端服务</p>
            </div>
            <div className="rounded-lg border bg-background p-4 text-center">
              <div className="text-2xl font-bold text-primary">AI/ML</div>
              <p className="mt-1 text-xs text-muted-foreground">智能推荐</p>
            </div>
            <div className="rounded-lg border bg-background p-4 text-center">
              <div className="text-2xl font-bold text-primary">AR/VR</div>
              <p className="mt-1 text-xs text-muted-foreground">沉浸体验</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
