import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { Logo } from '@/components/branding/Logo';
import { FullPageLoader } from '@/components/feedback/FullPageLoader';
import { ThemeToggle } from '@/components/ui/theme-toggle';

/**
 * Layout for unauthenticated auth screens (login, register). Centers a compact
 * content column with the brand above and a theme toggle in the corner. Auth
 * pages are lazily loaded, so a suspense boundary preserves the layout while the
 * chunk loads.
 */
export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <Logo />
        <div className="w-full">
          <Suspense fallback={<FullPageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
