import { Search, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Invoked when the clear button is pressed. Defaults to clearing the value. */
  onClear?: () => void;
  className?: string;
  'aria-label'?: string;
}

/**
 * A controlled search input with a leading search icon and a clear button that
 * appears while there is a value. Debouncing is the caller's responsibility.
 */
export function SearchBar({
  value,
  onChange,
  placeholder = 'Search…',
  onClear,
  className,
  'aria-label': ariaLabel = 'Search',
}: SearchBarProps) {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange('');
    }
  };

  return (
    <Input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={cn(className)}
      startIcon={<Search className="size-4" />}
      endIcon={
        value ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="flex items-center justify-center rounded-sm text-foreground-muted outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" />
          </button>
        ) : undefined
      }
    />
  );
}
