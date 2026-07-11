import { useMemo } from 'react';

import { getNavigationConfig, type NavigationConfig } from '@/config/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * Resolves the navigation configuration for the authenticated user's role, so
 * the sidebar renders only the routes that role is permitted to see.
 */
export function useNavigationConfig(): NavigationConfig {
  const { role } = useAuth();
  return useMemo(() => getNavigationConfig(role), [role]);
}
