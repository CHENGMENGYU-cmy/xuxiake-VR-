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
      <div className="flex pt-14">
        <Sidebar />
        <main className="min-h-[calc(100vh-3.5rem)] flex-1 px-2 py-4 sm:px-4 lg:pb-0 pb-16">
          <div className="mx-auto flex max-w-5xl gap-6">
            {/* 主内容区 */}
            <div className="min-w-0 flex-1">{children}</div>
            {/* 右侧面板 */}
            <RightPanel />
          </div>
        </main>
      </div>
      <MobileNav />
    </AuthGuard>
  );
}
