import { Suspense } from 'react';
import { Link, Outlet } from 'react-router-dom';

import { Logo } from '@/components/branding/Logo';
import { FullPageLoader } from '@/components/feedback/FullPageLoader';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ROUTES } from '@/constants/routes';

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
        <Link
          to={ROUTES.HOME}
          aria-label="TalentFlow home"
          className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Logo />
        </Link>
        <div className="w-full">
          <Suspense fallback={<FullPageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
