import { Outlet } from 'react-router-dom';

import { Logo } from '@/components/branding/Logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';

/**
 * Layout for unauthenticated auth screens (login, register). Centers a compact
 * content column on a plain background, with the brand above and a theme toggle
 * in the corner. Feature auth pages render into the `Outlet`.
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
          <Outlet />
        </div>
      </div>
    </div>
  );
}
