import { createContext } from 'react';

import type { ResolvedTheme, Theme } from '@/constants/theme';

/**
 * Value exposed by the theme context: the user's selected preference
 * (`theme`, which may be `system`) and the concrete `resolvedTheme` applied to
 * the DOM. Kept in its own module so the provider file only exports a
 * component (satisfies react-refresh).
 */
export interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
