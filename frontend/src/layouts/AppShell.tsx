import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { FullPageLoader } from '@/components/feedback/FullPageLoader';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { SidebarProvider } from '@/components/sidebar/SidebarProvider';
import { AppTopbar } from '@/layouts/AppTopbar';

/**
 * The reusable authenticated application shell: a role-aware, collapsible
 * sidebar (permanent on desktop, a slide-over drawer on mobile), a top bar, and
 * a suspense-wrapped content outlet for lazily loaded feature pages. Navigation
 * is derived from the authenticated role's configuration, so this shell holds no
 * role-specific or feature logic and is shared by both portals.
 */
export function AppShell() {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopbar />

          <main className="relative flex-1 overflow-y-auto">
            {/* Subtle depth: a faint grid that fades out, plus a soft primary glow. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              <div className="absolute inset-0 bg-grid opacity-[0.4] [mask-image:radial-gradient(ellipse_90%_55%_at_50%_0%,black,transparent_70%)]" />
              <div className="absolute -top-32 left-1/2 h-[360px] w-[820px] -translate-x-1/2 rounded-full bg-primary/[0.05] blur-[120px]" />
            </div>

            <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <Suspense fallback={<FullPageLoader />}>
                <Outlet />
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
