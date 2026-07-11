import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import { RouteErrorBoundary } from '@/components/errors/RouteErrorBoundary';
import { PlaceholderPage } from '@/components/dev/PlaceholderPage';
import { ROUTES } from '@/constants/routes';
import { AppLayout } from '@/layouts/AppLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { PublicLayout } from '@/layouts/PublicLayout';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';
import { GuestRoute } from '@/routes/GuestRoute';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

/**
 * Application route tree. Structure, not features: public/auth/app shells,
 * auth guards, and system pages are wired here, with feature slots filled by
 * `PlaceholderPage` until their modules are implemented.
 *
 * Role-restricted areas nest a `RoleRoute` inside the protected branch, e.g.:
 *   { element: <RoleRoute allowedRoles={[USER_ROLE.HR]} />, children: [...] }
 */
const router = createBrowserRouter([
  {
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          {
            index: true,
            element: (
              <PlaceholderPage
                title="Welcome to TalentFlow"
                description="The public landing experience will live here."
              />
            ),
          },
        ],
      },
      {
        element: <GuestRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: ROUTES.LOGIN, element: <PlaceholderPage title="Sign in" /> },
              { path: ROUTES.REGISTER, element: <PlaceholderPage title="Create your account" /> },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: ROUTES.DASHBOARD, element: <PlaceholderPage title="Dashboard" /> },
              { path: ROUTES.JOBS, element: <PlaceholderPage title="Jobs" /> },
              { path: ROUTES.APPLICATIONS, element: <PlaceholderPage title="Applications" /> },
              { path: ROUTES.PROFILE, element: <PlaceholderPage title="Profile" /> },
            ],
          },
        ],
      },
      { path: ROUTES.UNAUTHORIZED, element: <UnauthorizedPage /> },
      { path: ROUTES.NOT_FOUND, element: <NotFoundPage /> },
      { path: '*', element: <Navigate to={ROUTES.NOT_FOUND} replace /> },
    ],
  },
]);

/** Mounts the application router. Rendered within `AppProviders`. */
export function AppRouter() {
  return <RouterProvider router={router} />;
}
