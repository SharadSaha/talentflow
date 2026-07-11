import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DARK_CLASS } from '@/constants/theme';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import { ThemeProvider } from '@/providers/theme/ThemeProvider';
import { useTheme } from '@/hooks/useTheme';

function ThemeProbe() {
  const { resolvedTheme, setTheme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={() => setTheme('dark')}>Set dark</button>
      <button onClick={() => setTheme('light')}>Set light</button>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

function renderProbe() {
  return render(
    <ThemeProvider>
      <ThemeProbe />
    </ThemeProvider>,
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove(DARK_CLASS);
  });

  afterEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove(DARK_CLASS);
  });

  it('applies the dark class and persists the preference when set to dark', async () => {
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByRole('button', { name: 'Set dark' }));

    expect(document.documentElement).toHaveClass(DARK_CLASS);
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
    expect(window.localStorage.getItem(STORAGE_KEYS.THEME)).toBe('dark');
  });

  it('removes the dark class when switched back to light', async () => {
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByRole('button', { name: 'Set dark' }));
    await user.click(screen.getByRole('button', { name: 'Set light' }));

    expect(document.documentElement).not.toHaveClass(DARK_CLASS);
    expect(screen.getByTestId('resolved')).toHaveTextContent('light');
  });

  it('toggles between light and dark', async () => {
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(document.documentElement).toHaveClass(DARK_CLASS);

    await user.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(document.documentElement).not.toHaveClass(DARK_CLASS);
  });
});
