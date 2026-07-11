import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { FullPageLoader } from '@/components/feedback/FullPageLoader';
import { getLoginRouteForPath } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';

/**
 * Gate for authenticated-only routes. While the session is still bootstrapping
 * it shows a loader (never a premature redirect); once resolved, unauthenticated
 * users are sent to the role-appropriate login (inferred from the attempted
 * path) with the location preserved for post-login return.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate to={getLoginRouteForPath(location.pathname)} state={{ from: location }} replace />
    );
  }

  return <Outlet />;
}
