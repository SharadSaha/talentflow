import { useContext } from 'react';

import { ThemeContext, type ThemeContextValue } from '@/providers/theme/theme-context';

/**
 * Accesses the current theme and controls. Must be used within a
 * `ThemeProvider`; throws otherwise so misuse fails fast during development.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider.');
  }
  return context;
}
