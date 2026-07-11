/**
 * Theme constants. `Theme` is the user-selectable preference (including
 * `system`); `ResolvedTheme` is the concrete theme actually applied to the DOM.
 */
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export type Theme = (typeof THEME)[keyof typeof THEME];

export type ResolvedTheme = typeof THEME.LIGHT | typeof THEME.DARK;

export const DEFAULT_THEME: Theme = THEME.SYSTEM;

/** The class applied to <html> when the resolved theme is dark. */
export const DARK_CLASS = 'dark';
