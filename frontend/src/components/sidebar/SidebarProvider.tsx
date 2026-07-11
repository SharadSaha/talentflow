import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { SidebarContext, type SidebarContextValue } from '@/components/sidebar/sidebar-context';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { selectSidebarCollapsed, setSidebarCollapsed, toggleSidebar } from '@/reducers/uiSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

interface SidebarProviderProps {
  children: ReactNode;
}

/**
 * Provides sidebar state to the shell. Desktop collapse is delegated to the
 * persisted `ui` slice (so the preference survives reloads); the mobile drawer
 * is transient local state that auto-closes on navigation and when returning to
 * desktop widths. Those resets use React's "adjust state during render" pattern
 * (tracking the previous route/breakpoint) rather than effects.
 */
export function SidebarProvider({ children }: SidebarProviderProps) {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector(selectSidebarCollapsed);
  const isMobile = useMediaQuery('(max-width: 767px)');
  const { pathname } = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [tracker, setTracker] = useState({ pathname, isMobile });

  // Close the drawer when the route changes (navigation) or on desktop widths.
  if (tracker.pathname !== pathname || tracker.isMobile !== isMobile) {
    const navigated = tracker.pathname !== pathname;
    setTracker({ pathname, isMobile });
    if (navigated || !isMobile) setMobileOpen(false);
  }

  const toggleCollapsed = useCallback(() => dispatch(toggleSidebar()), [dispatch]);
  const setCollapsed = useCallback(
    (next: boolean) => dispatch(setSidebarCollapsed(next)),
    [dispatch],
  );

  const value = useMemo<SidebarContextValue>(
    () => ({
      collapsed,
      toggleCollapsed,
      setCollapsed,
      mobileOpen,
      setMobileOpen,
      isMobile,
    }),
    [collapsed, toggleCollapsed, setCollapsed, mobileOpen, isMobile],
  );

  return <SidebarContext value={value}>{children}</SidebarContext>;
}
