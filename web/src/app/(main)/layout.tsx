import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { RightPanel } from '@/components/layout/right-panel';
import { MobileNav } from '@/components/layout/mobile-nav';
import { SnapUploadDialog } from '@/components/upload/snap-upload-dialog';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="flex h-[calc(100vh-3.5rem)] gap-0 pt-14">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 lg:pb-0 pb-16">
          <div className="mx-auto max-w-3xl">
            {children}
          </div>
        </main>
        <RightPanel />
      </div>
      <MobileNav />
    </>
  );
}
