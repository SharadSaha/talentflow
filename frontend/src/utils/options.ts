/** A value/label pair for select-style inputs. */
export interface SelectOption<TValue extends string = string> {
  value: TValue;
  label: string;
}

/**
 * Builds an ordered list of `{ value, label }` options from a label map. Keeps
 * enum-backed select inputs in sync with their canonical label definitions.
 */
export function toOptions<TValue extends string>(
  labels: Record<TValue, string>,
): SelectOption<TValue>[] {
  return (Object.keys(labels) as TValue[]).map((value) => ({ value, label: labels[value] }));
}
