import { zodResolver } from '@hookform/resolvers/zod';
import { Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { SettingsSection } from '@/features/settings/components/SettingsSection';
import { useOrganizationSettings } from '@/features/settings/hooks/useOrganizationSettings';
import {
  type OrganizationFormValues,
  organizationSchema,
} from '@/features/settings/schemas/organization.schema';

const DESCRIPTION_ROWS = 4;

/**
 * HR organization form (RHF + Zod). The backend has no organization endpoint, so
 * details are persisted locally via `useOrganizationSettings` and hydrate the
 * form on return visits. When a real endpoint exists, the submit handler is the
 * only thing that changes.
 */
export function OrganizationForm() {
  const { organization, save } = useOrganizationSettings();

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: organization,
  });

  const onSubmit = form.handleSubmit((values) => {
    save(values);
    form.reset(values);
    toast.success('Organization details saved.');
  });

  const isSubmitDisabled = form.formState.isSubmitting || !form.formState.isDirty;

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate>
        <SettingsSection
          title="Organization"
          description="Details about your company shown to candidates across TalentFlow."
          icon={Building2}
          footer={
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset(organization)}
                disabled={isSubmitDisabled}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={form.formState.isSubmitting}
                disabled={isSubmitDisabled}
              >
                Save changes
              </Button>
            </>
          }
        >
          <div className="grid gap-4 sm:max-w-lg">
            <ControlledInput<OrganizationFormValues>
              name="companyName"
              label="Company name"
              placeholder="Acme Inc."
            />
            <ControlledInput<OrganizationFormValues>
              name="website"
              label="Website"
              type="url"
              placeholder="https://acme.com"
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={DESCRIPTION_ROWS}
                      placeholder="A short description of your company and mission."
                      error={Boolean(fieldState.error)}
                    />
                  </FormControl>
                  <FormDescription>
                    Shown on your job postings to help candidates learn about you.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </SettingsSection>
      </form>
    </Form>
  );
}
