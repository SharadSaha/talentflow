import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

/**
 * Applies server-provided field errors onto a React Hook Form. Only the
 * `allowedFields` are set, so a backend field with no matching form input is
 * ignored (its message is surfaced via a toast instead). Keeps server-error
 * mapping consistent across forms.
 */
export function applyServerFieldErrors<TFieldValues extends FieldValues>(
  setError: UseFormSetError<TFieldValues>,
  fieldErrors: Record<string, string>,
  allowedFields: Path<TFieldValues>[],
): void {
  for (const field of allowedFields) {
    const message = fieldErrors[field];
    if (message) {
      setError(field, { type: 'server', message });
    }
  }
}
