import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { toast } from '@/components/ui/sonner';
import { PasswordField } from '@/features/settings/components/PasswordField';
import { SettingsSection } from '@/features/settings/components/SettingsSection';
import {
  type ChangePasswordFormValues,
  changePasswordSchema,
} from '@/features/settings/schemas/changePassword.schema';

const DEFAULT_VALUES: ChangePasswordFormValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

/**
 * Change-password form (RHF + Zod). The backend does not yet expose a
 * change-password endpoint, so a successful, fully validated submission surfaces
 * an informative toast and resets the form. When an endpoint is added, only the
 * submit handler needs to call it — the validated form is production-ready.
 */
export function ChangePasswordForm() {
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const onSubmit = form.handleSubmit(() => {
    toast.info('Password changes are not available in this environment yet.');
    form.reset(DEFAULT_VALUES);
  });

  const isSubmitDisabled = form.formState.isSubmitting || !form.formState.isDirty;

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate>
        <SettingsSection
          title="Password"
          description="Use a strong password you do not reuse on other sites."
          icon={KeyRound}
          footer={
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset(DEFAULT_VALUES)}
                disabled={isSubmitDisabled}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={form.formState.isSubmitting}
                disabled={isSubmitDisabled}
              >
                Update password
              </Button>
            </>
          }
        >
          <div className="grid gap-4 sm:max-w-md">
            <PasswordField<ChangePasswordFormValues>
              name="currentPassword"
              label="Current password"
              autoComplete="current-password"
            />
            <PasswordField<ChangePasswordFormValues>
              name="newPassword"
              label="New password"
              description="At least 8 characters, with upper- and lower-case letters and a number."
              autoComplete="new-password"
            />
            <PasswordField<ChangePasswordFormValues>
              name="confirmPassword"
              label="Confirm new password"
              autoComplete="new-password"
            />
          </div>
        </SettingsSection>
      </form>
    </Form>
  );
}
