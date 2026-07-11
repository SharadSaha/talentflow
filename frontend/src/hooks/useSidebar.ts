import { useContext } from 'react';

import { SidebarContext, type SidebarContextValue } from '@/components/sidebar/sidebar-context';

/**
 * Accesses sidebar state (collapse + mobile drawer). Must be used within a
 * `SidebarProvider`; throws otherwise so misuse fails fast in development.
 */
export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return context;
}
