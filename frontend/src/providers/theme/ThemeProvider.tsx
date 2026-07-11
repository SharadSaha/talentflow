import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import {
  DARK_CLASS,
  DEFAULT_THEME,
  type ResolvedTheme,
  THEME,
  type Theme,
} from '@/constants/theme';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { localStorageService } from '@/services/storage/local-storage.service';
import { ThemeContext, type ThemeContextValue } from '@/providers/theme/theme-context';

const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';

function isTheme(value: string | null): value is Theme {
  return value === THEME.LIGHT || value === THEME.DARK || value === THEME.SYSTEM;
}

function readStoredTheme(): Theme {
  const stored = localStorageService.get(STORAGE_KEYS.THEME);
  return isTheme(stored) ? stored : DEFAULT_THEME;
}

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Provides theme state to the app. The concrete `resolvedTheme` is derived
 * during render from the selected preference and the live OS setting (tracked
 * via `useMediaQuery`), so a single effect only mirrors it onto the document —
 * no effect-driven state updates. The preference persists across sessions.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);
  const systemPrefersDark = useMediaQuery(SYSTEM_DARK_QUERY);

  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (theme === THEME.SYSTEM) {
      return systemPrefersDark ? THEME.DARK : THEME.LIGHT;
    }
    return theme;
  }, [theme, systemPrefersDark]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle(DARK_CLASS, resolvedTheme === THEME.DARK);
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const setTheme = useCallback((next: Theme): void => {
    setThemeState(next);
    localStorageService.set(STORAGE_KEYS.THEME, next);
  }, []);

  const toggleTheme = useCallback((): void => {
    setThemeState((current) => {
      const currentlyDark =
        current === THEME.DARK ||
        (current === THEME.SYSTEM && window.matchMedia(SYSTEM_DARK_QUERY).matches);
      const next = currentlyDark ? THEME.LIGHT : THEME.DARK;
      localStorageService.set(STORAGE_KEYS.THEME, next);
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
