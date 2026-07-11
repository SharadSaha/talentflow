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

          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
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
