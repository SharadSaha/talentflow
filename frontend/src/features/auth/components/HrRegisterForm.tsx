import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { ControlledInput } from '@/components/ui/controlled-input';
import { Form } from '@/components/ui/form';
import { USER_ROLE } from '@/constants/roles';
import { RegisterCredentialFields } from '@/features/auth/components/RegisterCredentialFields';
import { useRegister } from '@/features/auth/hooks/useRegister';
import { type HrRegisterFormValues, hrRegisterSchema } from '@/features/auth/schemas/auth.schemas';
import { applyServerFieldErrors } from '@/utils/form-errors';

const DEFAULT_VALUES: HrRegisterFormValues = {
  organizationName: '',
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

interface HrRegisterFormProps {
  /** Destination for the "Sign in" link (employer login route). */
  loginHref: string;
}

/**
 * Employer (HR) registration form. Mirrors the candidate form but adds a
 * mandatory organization name, and registers with `role: HR` so the backend
 * provisions a hiring workspace. Validation is handled by Zod; the workflow
 * (account creation, sign-in, redirect) lives in `useRegister`.
 */
export function HrRegisterForm({ loginHref }: HrRegisterFormProps) {
  const { register, isLoading } = useRegister();
  const form = useForm<HrRegisterFormValues>({
    resolver: zodResolver(hrRegisterSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const error = await register({ ...values, role: USER_ROLE.HR });
    if (error) {
      applyServerFieldErrors(form.setError, error.fieldErrors, [
        'organizationName',
        'email',
        'password',
      ]);
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <ControlledInput<HrRegisterFormValues>
          name="organizationName"
          label="Organization name"
          placeholder="Acme Inc."
          autoComplete="organization"
          autoFocus
        />

        <RegisterCredentialFields autoFocusName={false} />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Create employer account
        </Button>

        <p className="text-center text-small text-foreground-muted">
          Already have an account?{' '}
          <Link to={loginHref} className="link font-medium">
            Sign in
          </Link>
        </p>
      </form>
    </Form>
  );
}
