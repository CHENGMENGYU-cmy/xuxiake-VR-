import { Navbar } from '@/components/layout/navbar'; {/*顶部导航栏*/}
import { Sidebar } from '@/components/layout/sidebar';{/*左侧菜单*/}
import { RightPanel } from '@/components/layout/right-panel';{/*右侧版面*/}
import { MobileNav } from '@/components/layout/mobile-nav';{/*底部移动端导航*/}
import { AuthGuard } from '@/components/auth-guard';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <Navbar />
      <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto px-2 py-4 sm:px-4 lg:pb-0 pb-16">
          <div className="mx-auto max-w-5xl">
            {children}
          </div>
        </main>
        <RightPanel />
      </div>
      <MobileNav />
    </AuthGuard>
  );
}
