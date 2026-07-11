import { Navigate, Outlet } from 'react-router-dom';

import { FullPageLoader } from '@/components/feedback/FullPageLoader';
import { ROUTES } from '@/constants/routes';
import type { UserRole } from '@/constants/roles';
import { useAuth } from '@/hooks/useAuth';

interface RoleRouteProps {
  /** Roles permitted to access the nested routes. */
  allowedRoles: UserRole[];
}

/**
 * Gate for role-restricted routes. Assumes it is nested inside a
 * `ProtectedRoute`, so the user is already authenticated; it only checks the
 * role and redirects unauthorized users to the Unauthorized page. Authorization
 * is always re-enforced by the backend — this is a UX guard, not a security
 * boundary.
 */
export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { role, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <FullPageLoader />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
}
