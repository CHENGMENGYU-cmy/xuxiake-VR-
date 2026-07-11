import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: 'url(/images/login-bg.svg)' }}
    >
      {/* 内容层 */}
      <div className="relative z-10 flex w-full min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm shadow-lg ring-1 ring-white/20">
                <span className="text-2xl font-bold text-white">徐</span>
              </div>
              <span className="text-3xl font-bold text-white tracking-wide">徐霞客</span>
            </Link>
            <p className="mt-3 text-sm text-white/50">
              戴智能眼镜，连接志同道合的探索者
            </p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
