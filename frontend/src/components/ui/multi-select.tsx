import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { ComboboxOption } from '@/components/ui/combobox';

/** Props for {@link MultiSelect}. */
export interface MultiSelectProps {
  options: ComboboxOption[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  /** Maximum chips to render before collapsing the overflow into a `+N` badge. */
  maxDisplay?: number;
}

/**
 * A multi-select, searchable dropdown. Selected values render as removable
 * badge chips; the command list toggles selection with checkmark indicators.
 */
export function MultiSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Select options…',
  searchPlaceholder = 'Search…',
  emptyText = 'No results found.',
  disabled,
  className,
  maxDisplay,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const selectedOptions = options.filter((option) => value.includes(option.value));

  const toggle = (optionValue: string) => {
    onValueChange(
      value.includes(optionValue)
        ? value.filter((current) => current !== optionValue)
        : [...value, optionValue],
    );
  };

  const remove = (optionValue: string) => {
    onValueChange(value.filter((current) => current !== optionValue));
  };

  const visible = maxDisplay !== undefined ? selectedOptions.slice(0, maxDisplay) : selectedOptions;
  const overflow = selectedOptions.length - visible.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('h-auto min-h-9 w-full justify-between font-normal', className)}
        >
          <span className="flex flex-1 flex-wrap items-center gap-1 py-0.5">
            {selectedOptions.length === 0 ? (
              <span className="text-foreground-muted">{placeholder}</span>
            ) : (
              <>
                {visible.map((option) => (
                  <Badge key={option.value} variant="neutral" className="gap-1 pr-1">
                    <span className="truncate">{option.label}</span>
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`Remove ${option.label}`}
                      className="rounded-sm outline-none hover:text-danger focus-visible:ring-2 focus-visible:ring-ring"
                      onPointerDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        remove(option.value);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          event.stopPropagation();
                          remove(option.value);
                        }
                      }}
                    >
                      <X className="size-3" aria-hidden="true" />
                    </span>
                  </Badge>
                ))}
                {overflow > 0 && <Badge variant="neutral">{`+${overflow}`}</Badge>}
              </>
            )}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 self-start opacity-60" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => toggle(option.value)}
                  >
                    <span
                      className={cn(
                        'flex size-4 items-center justify-center rounded-sm border border-input',
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'opacity-60',
                      )}
                      aria-hidden="true"
                    >
                      {isSelected && <Check className="size-3" />}
                    </span>
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
