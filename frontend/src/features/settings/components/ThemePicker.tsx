import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { useId } from 'react';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { THEME, type Theme } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

interface ThemeOption {
  value: Theme;
  label: string;
  icon: typeof Sun;
  /** Preview swatch classes: [surface, foreground bar, accent bar]. */
  preview: { surface: string; bars: string[] };
}

const OPTIONS: ThemeOption[] = [
  {
    value: THEME.LIGHT,
    label: 'Light',
    icon: Sun,
    preview: { surface: 'bg-white', bars: ['bg-neutral-300', 'bg-neutral-200'] },
  },
  {
    value: THEME.DARK,
    label: 'Dark',
    icon: Moon,
    preview: { surface: 'bg-neutral-900', bars: ['bg-neutral-600', 'bg-neutral-700'] },
  },
  {
    value: THEME.SYSTEM,
    label: 'System',
    icon: Monitor,
    preview: {
      surface: 'bg-gradient-to-br from-white to-neutral-900',
      bars: ['bg-neutral-400', 'bg-neutral-500'],
    },
  },
];

/**
 * A visual, keyboard-accessible theme picker. Renders the three theme options as
 * selectable preview cards backed by a Radix radio group (arrow-key navigation
 * and roving focus included), driving the shared `useTheme` controls.
 */
export function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const groupId = useId();

  return (
    <RadioGroup
      value={theme}
      onValueChange={(value) => setTheme(value as Theme)}
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      aria-label="Theme"
    >
      {OPTIONS.map((option) => {
        const optionId = `${groupId}-${option.value}`;
        const isSelected = theme === option.value;
        const Icon = option.icon;

        return (
          <label
            key={option.value}
            htmlFor={optionId}
            className={cn(
              'flex cursor-pointer flex-col gap-3 rounded-lg border p-3 transition-colors duration-fast ease-emphasized',
              'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
              isSelected
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-foreground-muted/40 hover:bg-surface-hover',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'flex h-16 flex-col justify-end gap-1.5 rounded-md border border-border p-2',
                option.preview.surface,
              )}
            >
              {option.preview.bars.map((bar, index) => (
                <span
                  key={index}
                  className={cn('h-1.5 rounded-full', bar, index === 0 ? 'w-3/4' : 'w-1/2')}
                />
              ))}
            </span>
            <span className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-small font-medium text-foreground">
                <Icon className="size-4 text-foreground-muted" aria-hidden="true" />
                {option.label}
              </span>
              {isSelected ? <Check className="size-4 text-primary" aria-hidden="true" /> : null}
              <RadioGroupItem id={optionId} value={option.value} className="sr-only" />
            </span>
          </label>
        );
      })}
    </RadioGroup>
  );
}
