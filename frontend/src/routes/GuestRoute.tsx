import { Navigate, Outlet } from 'react-router-dom';

import { FullPageLoader } from '@/components/feedback/FullPageLoader';
import { getHomeRouteForRole } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';

/**
 * Gate for guest-only routes (login, register). Authenticated users are
 * redirected to their role home so they never see the auth screens again.
 */
export function GuestRoute() {
  const { isAuthenticated, isBootstrapping, role } = useAuth();

  if (isBootstrapping) {
    return <FullPageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to={getHomeRouteForRole(role)} replace />;
  }

  return <Outlet />;
}
