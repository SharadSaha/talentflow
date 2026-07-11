import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { type FieldPath, type FieldValues, useFormContext } from 'react-hook-form';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export interface PasswordFieldProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  label: string;
  description?: string;
  autoComplete?: string;
  placeholder?: string;
}

/**
 * A password `Input` bound to React Hook Form with an accessible show/hide
 * toggle. The toggle is a real, focusable button rendered alongside the field
 * (not via the decorative `endIcon` slot) so screen readers can operate it.
 */
export function PasswordField<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  autoComplete,
  placeholder,
}: PasswordFieldProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="relative">
            <FormControl>
              <Input
                {...field}
                type={isVisible ? 'text' : 'password'}
                autoComplete={autoComplete}
                placeholder={placeholder}
                error={Boolean(fieldState.error)}
                className="pr-10"
              />
            </FormControl>
            <button
              type="button"
              onClick={() => setIsVisible((previous) => !previous)}
              aria-label={isVisible ? 'Hide password' : 'Show password'}
              aria-pressed={isVisible}
              className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center rounded-sm p-1 text-foreground-muted outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              {isVisible ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
