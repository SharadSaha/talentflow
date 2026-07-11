import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { type FieldPath, useForm, useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { ControlledCheckbox } from '@/components/ui/controlled-checkbox';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';
import { EDUCATION_LEVEL_OPTIONS, type EducationLevel } from '@/constants/education';
import { useUpdateProfileMutation } from '@/features/profile/api/profileApi';
import { type ProfileFormValues, profileSchema } from '@/features/profile/schemas/profile.schema';
import type { UpdateProfileRequest } from '@/features/profile/types/profile.types';
import type { CandidateProfile } from '@/types/profile';
import { normalizeApiError } from '@/utils/api-error';
import { applyServerFieldErrors } from '@/utils/form-errors';

const NOT_SPECIFIED = '__none__';

const EDITABLE_FIELDS: FieldPath<ProfileFormValues>[] = [
  'headline',
  'about',
  'phone',
  'currentLocation',
  'preferredLocation',
  'currentCompany',
  'currentTitle',
  'totalExperienceMonths',
  'highestEducation',
  'expectedSalaryMin',
  'expectedSalaryMax',
  'noticePeriodDays',
  'isOpenToWork',
  'resumeUrl',
];

interface ProfileFormProps {
  profile: CandidateProfile;
  /** Leaves edit mode (after a successful save or a discard). */
  onClose: () => void;
}

/** Sectioned, RHF + Zod form for editing the candidate profile. */
export function ProfileForm({ profile, onClose }: ProfileFormProps) {
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: toDefaultValues(profile),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildPayload(values, profile);

    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }

    try {
      await updateProfile(payload).unwrap();
      toast.success('Profile updated.');
      onClose();
    } catch (error) {
      const normalized = normalizeApiError(error);
      applyServerFieldErrors(form.setError, normalized.fieldErrors, EDITABLE_FIELDS);
      toast.error(normalized.message);
    }
  });

  const handleCancel = () => {
    if (form.formState.isDirty) {
      setIsDiscardOpen(true);
    } else {
      onClose();
    }
  };

  const confirmDiscard = () => {
    setIsDiscardOpen(false);
    form.reset();
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate className="space-y-6">
        <FormSection title="Basics">
          <ControlledInput<ProfileFormValues>
            name="headline"
            label="Headline"
            placeholder="Senior Frontend Engineer"
          />
          <TextareaField
            name="about"
            label="About"
            rows={5}
            placeholder="A short summary of your experience and what you are looking for."
          />
          <ControlledCheckbox<ProfileFormValues>
            name="isOpenToWork"
            label="I am open to new opportunities"
          />
        </FormSection>

        <FormSection title="Professional">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ControlledInput<ProfileFormValues>
              name="currentTitle"
              label="Current title"
              placeholder="Frontend Engineer"
            />
            <ControlledInput<ProfileFormValues>
              name="currentCompany"
              label="Current company"
              placeholder="Acme Inc."
            />
            <NumberField
              name="totalExperienceMonths"
              label="Total experience (months)"
              min={0}
              max={720}
            />
            <EducationSelect />
            <NumberField name="expectedSalaryMin" label="Expected salary (min)" min={0} />
            <NumberField name="expectedSalaryMax" label="Expected salary (max)" min={0} />
            <NumberField name="noticePeriodDays" label="Notice period (days)" min={0} max={365} />
          </div>
          <ControlledInput<ProfileFormValues>
            name="resumeUrl"
            label="Resume URL"
            type="url"
            placeholder="https://example.com/resume.pdf"
          />
        </FormSection>

        <FormSection title="Personal">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ControlledInput<ProfileFormValues>
              name="phone"
              label="Phone"
              type="tel"
              placeholder="+1 555 000 1234"
            />
            <ControlledInput<ProfileFormValues>
              name="currentLocation"
              label="Current location"
              placeholder="San Francisco, CA"
            />
            <ControlledInput<ProfileFormValues>
              name="preferredLocation"
              label="Preferred location"
              placeholder="Remote"
            />
          </div>
        </FormSection>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={!form.formState.isDirty}>
            Save changes
          </Button>
        </div>
      </form>

      <ConfirmationDialog
        open={isDiscardOpen}
        onOpenChange={setIsDiscardOpen}
        title="Discard changes?"
        description="Your unsaved changes will be lost."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        variant="destructive"
        onConfirm={confirmDiscard}
      />
    </Form>
  );
}

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

/** A titled card grouping a set of related fields. */
function FormSection({ title, children }: FormSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h3">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

interface TextareaFieldProps {
  name: FieldPath<ProfileFormValues>;
  label: string;
  rows?: number;
  placeholder?: string;
}

/** A `Textarea` bound to the profile form context. */
function TextareaField({ name, label, rows, placeholder }: TextareaFieldProps) {
  const { control } = useFormContext<ProfileFormValues>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              ref={field.ref}
              name={field.name}
              rows={rows}
              placeholder={placeholder}
              value={typeof field.value === 'string' ? field.value : ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={Boolean(fieldState.error)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface NumberFieldProps {
  name: FieldPath<ProfileFormValues>;
  label: string;
  min?: number;
  max?: number;
}

/** A numeric `Input` bound to the profile form context; blank maps to undefined. */
function NumberField({ name, label, min, max }: NumberFieldProps) {
  const { control } = useFormContext<ProfileFormValues>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              inputMode="numeric"
              min={min}
              max={max}
              ref={field.ref}
              name={field.name}
              value={field.value === undefined || field.value === null ? '' : String(field.value)}
              onChange={(event) => {
                const raw = event.target.value;
                field.onChange(raw === '' ? undefined : Number(raw));
              }}
              onBlur={field.onBlur}
              error={Boolean(fieldState.error)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/** The highest-education select with a "Not specified" clearing option. */
function EducationSelect() {
  const { control } = useFormContext<ProfileFormValues>();
  return (
    <FormField
      control={control}
      name="highestEducation"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Highest education</FormLabel>
          <Select
            value={field.value ?? NOT_SPECIFIED}
            onValueChange={(value) =>
              field.onChange(value === NOT_SPECIFIED ? undefined : (value as EducationLevel))
            }
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Not specified" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value={NOT_SPECIFIED}>Not specified</SelectItem>
              {EDUCATION_LEVEL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>Select your highest completed level.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/** Maps the current profile onto default form values (null → '' for text). */
function toDefaultValues(profile: CandidateProfile): ProfileFormValues {
  return {
    headline: profile.headline ?? '',
    about: profile.about ?? '',
    phone: profile.phone ?? '',
    currentLocation: profile.currentLocation ?? '',
    preferredLocation: profile.preferredLocation ?? '',
    currentCompany: profile.currentCompany ?? '',
    currentTitle: profile.currentTitle ?? '',
    totalExperienceMonths: profile.totalExperienceMonths,
    highestEducation: profile.highestEducation ?? undefined,
    expectedSalaryMin: profile.expectedSalaryMin ?? undefined,
    expectedSalaryMax: profile.expectedSalaryMax ?? undefined,
    noticePeriodDays: profile.noticePeriodDays ?? undefined,
    isOpenToWork: profile.isOpenToWork,
    resumeUrl: profile.resumeUrl ?? '',
  };
}

/**
 * Builds a minimal update payload containing only fields that changed. Empty
 * text values are omitted (the backend whitelist rejects blank optionals), and
 * the mutation requires at least one field.
 */
function buildPayload(values: ProfileFormValues, profile: CandidateProfile): UpdateProfileRequest {
  const payload: UpdateProfileRequest = {};

  const addText = (
    key:
      | 'headline'
      | 'about'
      | 'phone'
      | 'currentLocation'
      | 'preferredLocation'
      | 'currentCompany'
      | 'currentTitle'
      | 'resumeUrl',
    current: string | null,
  ): void => {
    const next = values[key].trim();
    if (next && next !== (current ?? '')) {
      payload[key] = next;
    }
  };

  addText('headline', profile.headline);
  addText('about', profile.about);
  addText('phone', profile.phone);
  addText('currentLocation', profile.currentLocation);
  addText('preferredLocation', profile.preferredLocation);
  addText('currentCompany', profile.currentCompany);
  addText('currentTitle', profile.currentTitle);
  addText('resumeUrl', profile.resumeUrl);

  const addInt = (
    key: 'totalExperienceMonths' | 'expectedSalaryMin' | 'expectedSalaryMax' | 'noticePeriodDays',
    current: number | null,
  ): void => {
    const next = values[key];
    if (next !== undefined && next !== (current ?? undefined)) {
      payload[key] = next;
    }
  };

  addInt('totalExperienceMonths', profile.totalExperienceMonths);
  addInt('expectedSalaryMin', profile.expectedSalaryMin);
  addInt('expectedSalaryMax', profile.expectedSalaryMax);
  addInt('noticePeriodDays', profile.noticePeriodDays);

  if (
    values.highestEducation &&
    values.highestEducation !== (profile.highestEducation ?? undefined)
  ) {
    payload.highestEducation = values.highestEducation;
  }

  if (values.isOpenToWork !== profile.isOpenToWork) {
    payload.isOpenToWork = values.isOpenToWork;
  }

  return payload;
}
