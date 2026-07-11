import { createContext } from 'react';

/**
 * Sidebar UI state shared across the shell without prop drilling. `collapsed`
 * (desktop mini mode) is backed by the persisted `ui` slice; `mobileOpen` is
 * transient drawer state. Kept in its own module so the provider file only
 * exports a component (satisfies react-refresh).
 */
export interface SidebarContextValue {
  /** Desktop mini (icon-only) mode. Persisted. */
  collapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  /** Mobile slide-over drawer open state. */
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  /** True below the `md` breakpoint (drawer mode). */
  isMobile: boolean;
}

export const SidebarContext = createContext<SidebarContextValue | null>(null);
