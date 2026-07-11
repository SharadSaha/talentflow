import { type FieldPath, type FieldValues, useFormContext } from 'react-hook-form';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input, type InputProps } from '@/components/ui/input';

export interface ControlledInputProps<TFieldValues extends FieldValues> extends Omit<
  InputProps,
  'name' | 'error' | 'defaultValue'
> {
  /** The form field name (typed against the form's values). */
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
}

/**
 * An `Input` bound to React Hook Form via the form context — label, control,
 * validation message, and ARIA wiring included. Reused by every text field so
 * forms never re-implement the RHF glue.
 */
export function ControlledInput<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  ...inputProps
}: ControlledInputProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          {label ? <FormLabel>{label}</FormLabel> : null}
          <FormControl>
            <Input {...inputProps} {...field} error={Boolean(fieldState.error)} />
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
