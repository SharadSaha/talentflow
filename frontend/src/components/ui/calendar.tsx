import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Props accepted by {@link Calendar}, forwarded to `react-day-picker`. */
export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/** Renders the navigation chevron for the calendar in the given orientation. */
function CalendarChevron({
  orientation,
  className,
}: {
  orientation?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}) {
  const Icon = orientation === 'right' ? ChevronRight : ChevronLeft;
  return <Icon className={cn('size-4', className)} aria-hidden="true" />;
}

/**
 * A date-selection calendar built on `react-day-picker`. All visual styling is
 * mapped to semantic tokens via `classNames`; no base stylesheet is required.
 */
export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-4',
        month: 'flex flex-col gap-4',
        month_caption: 'flex justify-center pt-1 relative items-center h-9',
        caption_label: 'text-sm font-medium',
        nav: 'flex items-center gap-1 absolute inset-x-0 top-1 justify-between px-1',
        button_previous: cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-7'),
        button_next: cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-7'),
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex',
        weekday: 'text-foreground-muted rounded-md w-9 text-xs font-normal',
        week: 'flex w-full mt-2',
        day: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
        day_button: cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'size-9 p-0 font-normal aria-selected:opacity-100',
        ),
        range_start: 'rounded-l-md',
        range_end: 'rounded-r-md',
        range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        selected:
          '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button:hover]:bg-primary [&>button:hover]:text-primary-foreground',
        today: '[&>button]:bg-accent [&>button]:text-accent-foreground',
        outside: 'text-foreground-muted opacity-50',
        disabled: 'text-foreground-muted opacity-50',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: CalendarChevron,
      }}
      {...props}
    />
  );
}

export { DayPicker };
