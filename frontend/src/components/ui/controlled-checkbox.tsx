import { type FieldPath, type FieldValues, useFormContext } from 'react-hook-form';

import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { cn } from '@/lib/utils';

export interface ControlledCheckboxProps<TFieldValues extends FieldValues> {
  /** The boolean form field name (typed against the form's values). */
  name: FieldPath<TFieldValues>;
  label: string;
  className?: string;
}

/**
 * A `Checkbox` bound to React Hook Form via the form context, laid out inline
 * with its label. Used for boolean fields such as "remember me".
 */
export function ControlledCheckbox<TFieldValues extends FieldValues>({
  name,
  label,
  className,
}: ControlledCheckboxProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('flex flex-row items-center gap-2 space-y-0', className)}>
          <FormControl>
            <Checkbox
              ref={field.ref}
              checked={Boolean(field.value)}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              onBlur={field.onBlur}
              name={field.name}
            />
          </FormControl>
          <FormLabel className="font-normal">{label}</FormLabel>
        </FormItem>
      )}
    />
  );
}
