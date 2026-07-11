import { Monitor, Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { THEME, type Theme } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

const OPTIONS: { theme: Theme; label: string; icon: typeof Sun }[] = [
  { theme: THEME.LIGHT, label: 'Light', icon: Sun },
  { theme: THEME.DARK, label: 'Dark', icon: Moon },
  { theme: THEME.SYSTEM, label: 'System', icon: Monitor },
];

/** Toggles between light, dark, and system colour themes. */
export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          {resolvedTheme === THEME.DARK ? <Moon /> : <Sun />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.theme}
              onSelect={() => setTheme(option.theme)}
              aria-checked={theme === option.theme}
              className={theme === option.theme ? 'bg-accent text-accent-foreground' : undefined}
            >
              <Icon className="size-4" />
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
