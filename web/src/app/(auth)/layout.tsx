import Link from 'next/link';

const VR_IMAGE_URL =
  'https://images.unsplash.com/photo-1548131089-d5d36b219767?w=1920&q=80&auto=format&fit=crop';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${VR_IMAGE_URL})` }}
    >
      {/* 全屏遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/85 via-indigo-950/80 to-slate-950/85" />

      {/* 内容层 */}
      <div className="relative z-10 flex w-full min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm shadow-lg">
                <span className="text-2xl font-bold text-white">徐</span>
              </div>
              <span className="text-3xl font-bold text-white">徐霞客</span>
            </Link>
            <p className="mt-3 text-sm text-white/60">用VR记录旅程，让世界触手可及 🌍</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
