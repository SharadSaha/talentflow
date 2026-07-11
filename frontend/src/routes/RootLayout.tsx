import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { FullPageLoader } from '@/components/feedback/FullPageLoader';

/**
 * Root layout wrapping the entire route tree in a Suspense boundary, so lazily
 * loaded route elements (e.g. the landing page and auth pages) have a graceful
 * fallback without a blank screen.
 */
export function RootLayout() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Outlet />
    </Suspense>
  );
}
