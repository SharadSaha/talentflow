import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import {
  type FieldPathByValue,
  type SubmitHandler,
  useForm,
  useFormContext,
} from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ControlledInput } from '@/components/ui/controlled-input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  EMPLOYMENT_TYPE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  SALARY_PERIOD,
  WORK_MODE_OPTIONS,
} from '@/constants/job';
import { JOB_STATUS, type JobStatus } from '@/constants/job-status';
import { SkillsField } from '@/features/hr/components/SkillsField';
import { useUnsavedChangesWarning } from '@/features/hr/hooks/useUnsavedChangesWarning';
import { type JobFormValues, jobSchema } from '@/features/hr/schemas/job.schema';
import { cn } from '@/lib/utils';
import type { SelectOption } from '@/utils/options';

/** Salary-period options are defined here to keep the label wording localised. */
const SALARY_PERIOD_OPTIONS: SelectOption<JobFormValues['salaryPeriod']>[] = [
  { value: SALARY_PERIOD.YEARLY, label: 'Per year' },
  { value: SALARY_PERIOD.MONTHLY, label: 'Per month' },
  { value: SALARY_PERIOD.HOURLY, label: 'Per hour' },
];

/** Which footer button triggered the in-flight submission. */
type JobSubmitAction = 'draft' | 'publish' | 'save';

/** Names of the numeric form fields — those whose value is `number | undefined` or `number`. */
type NumberFieldName =
  FieldPathByValue<JobFormValues, number> | FieldPathByValue<JobFormValues, number | undefined>;

interface NumberFieldProps {
  name: NumberFieldName;
  label: string;
  description?: string;
  placeholder?: string;
  min?: number;
}

/**
 * A numeric input bound to RHF that maps an empty string to `undefined` at the
 * field boundary (and otherwise to `Number(...)`), so blank optional numbers
 * validate correctly without relying on `z.coerce`.
 */
function NumberField({ name, label, description, placeholder, min }: NumberFieldProps) {
  const { control } = useFormContext<JobFormValues>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <input
              ref={field.ref}
              name={field.name}
              type="number"
              inputMode="numeric"
              min={min}
              placeholder={placeholder}
              value={field.value === undefined ? '' : String(field.value)}
              onBlur={field.onBlur}
              onChange={(event) => {
                const raw = event.target.value;
                field.onChange(raw === '' ? undefined : Number(raw));
              }}
              className={cn(
                'h-9 w-full rounded-md border border-input bg-surface px-3 py-1 text-sm text-foreground',
                'placeholder:text-foreground-muted transition-colors duration-fast ease-emphasized',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring',
                'disabled:cursor-not-allowed disabled:opacity-50',
                fieldState.error && 'border-danger focus-visible:border-danger',
              )}
            />
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface SelectFieldProps<T extends string> {
  name: FieldPathByValue<JobFormValues, T>;
  label: string;
  options: readonly SelectOption<T>[];
}

/** A Radix Select bound to RHF, driven by typed `*_OPTIONS` constants. */
function SelectField<T extends string>({ name, label, options }: SelectFieldProps<T>) {
  const { control } = useFormContext<JobFormValues>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            value={options.find((candidate) => candidate.value === field.value)?.value}
            onValueChange={(next) => {
              const option = options.find((candidate) => candidate.value === next);
              if (option) field.onChange(option.value);
            }}
          >
            <FormControl>
              <SelectTrigger className={cn(fieldState.error && 'border-danger')}>
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/** A tall multi-line description field bound to RHF. */
function DescriptionField() {
  const { control } = useFormContext<JobFormValues>();
  return (
    <FormField
      control={control}
      name="description"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>Description</FormLabel>
          <FormControl>
            <Textarea
              {...field}
              rows={12}
              className="min-h-64"
              error={Boolean(fieldState.error)}
              placeholder="Describe the role, responsibilities, requirements, and benefits…"
            />
          </FormControl>
          <FormDescription>
            This is a single rich text field. Include the responsibilities, requirements, and
            benefits here — the role has no separate sections for them.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export interface JobFormProps {
  mode: 'create' | 'edit';
  defaultValues: JobFormValues;
  submitting: boolean;
  currentStatus?: JobStatus;
  onSubmit: (values: JobFormValues, status?: 'DRAFT' | 'PUBLISHED') => void | Promise<void>;
  onCancel: () => void;
  /** Notifies the parent when the form's dirty state changes (for cancel guards). */
  onDirtyChange?: (isDirty: boolean) => void;
}

/**
 * The reusable create/edit job form. Fields are grouped into section cards and
 * validated with the shared `jobSchema`. The footer exposes mode-specific submit
 * actions (draft/publish for create; save/publish for edit) and the form warns
 * about unsaved changes when navigating away.
 */
export function JobForm({
  mode,
  defaultValues,
  submitting,
  currentStatus,
  onSubmit,
  onCancel,
  onDirtyChange,
}: JobFormProps) {
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues,
  });
  const [activeAction, setActiveAction] = useState<JobSubmitAction | null>(null);
  const isDirty = form.formState.isDirty;

  useUnsavedChangesWarning(isDirty);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const makeSubmit = (action: JobSubmitAction, status?: 'DRAFT' | 'PUBLISHED') => {
    const handler: SubmitHandler<JobFormValues> = (values) => {
      setActiveAction(action);
      return onSubmit(values, status);
    };
    return form.handleSubmit(handler);
  };

  const primarySubmit = mode === 'create' ? makeSubmit('publish', 'PUBLISHED') : makeSubmit('save');
  const showEditPublish = mode === 'edit' && currentStatus === JOB_STATUS.DRAFT;

  return (
    <Form {...form}>
      <form onSubmit={primarySubmit} noValidate className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basics</CardTitle>
            <CardDescription>The core details candidates see first.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <ControlledInput<JobFormValues>
                name="title"
                label="Job title"
                placeholder="e.g. Senior Frontend Engineer"
                autoFocus
              />
            </div>
            <SelectField
              name="employmentType"
              label="Employment type"
              options={EMPLOYMENT_TYPE_OPTIONS}
            />
            <SelectField
              name="experienceLevel"
              label="Experience level"
              options={EXPERIENCE_LEVEL_OPTIONS}
            />
            <SelectField name="workMode" label="Work mode" options={WORK_MODE_OPTIONS} />
            <NumberField name="openings" label="Openings" min={1} placeholder="1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
            <CardDescription>Where the role is based and what it involves.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ControlledInput<JobFormValues>
              name="location"
              label="Location"
              placeholder="e.g. San Francisco, CA"
              description="Leave blank for fully remote roles."
            />
            <DescriptionField />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compensation &amp; experience</CardTitle>
            <CardDescription>Optional pay range and years of experience.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <NumberField name="salaryMin" label="Minimum salary" min={0} placeholder="Optional" />
            <NumberField name="salaryMax" label="Maximum salary" min={0} placeholder="Optional" />
            <SelectField
              name="salaryPeriod"
              label="Salary period"
              options={SALARY_PERIOD_OPTIONS}
            />
            <div className="hidden sm:block" aria-hidden="true" />
            <NumberField
              name="minExperienceYears"
              label="Minimum experience (years)"
              min={0}
              placeholder="Optional"
            />
            <NumberField
              name="maxExperienceYears"
              label="Maximum experience (years)"
              min={0}
              placeholder="Optional"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>
              Select the skills this role needs and mark the essentials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SkillsField name="skills" />
          </CardContent>
        </Card>

        <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t border-border bg-background py-4 sm:flex-row sm:items-center sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          {mode === 'create' ? (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={makeSubmit('draft', 'DRAFT')}
                isLoading={submitting && activeAction === 'draft'}
                disabled={submitting}
              >
                Save as draft
              </Button>
              <Button
                type="button"
                onClick={makeSubmit('publish', 'PUBLISHED')}
                isLoading={submitting && activeAction === 'publish'}
                disabled={submitting}
              >
                Publish
              </Button>
            </>
          ) : (
            <>
              {showEditPublish ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={makeSubmit('publish', 'PUBLISHED')}
                  isLoading={submitting && activeAction === 'publish'}
                  disabled={submitting}
                >
                  Publish
                </Button>
              ) : null}
              <Button
                type="button"
                onClick={makeSubmit('save')}
                isLoading={submitting && activeAction === 'save'}
                disabled={submitting}
              >
                Save changes
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  );
}
