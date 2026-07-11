import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { ControlledInput } from '@/components/ui/controlled-input';
import { Form } from '@/components/ui/form';
import { useRegister } from '@/features/auth/hooks/useRegister';
import { type RegisterFormValues, registerSchema } from '@/features/auth/schemas/auth.schemas';
import { applyServerFieldErrors } from '@/utils/form-errors';

const DEFAULT_VALUES: RegisterFormValues = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

interface RegisterFormProps {
  /** Destination for the "Sign in" link (role-specific login route). */
  loginHref: string;
}

/**
 * Candidate registration form. Only candidates can self-register; HR accounts
 * are provisioned separately. Validation is handled by Zod; the workflow lives
 * in `useRegister`.
 */
export function RegisterForm({ loginHref }: RegisterFormProps) {
  const { register, isLoading } = useRegister();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const error = await register(values);
    if (error) {
      applyServerFieldErrors(form.setError, error.fieldErrors, ['email', 'password']);
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <ControlledInput<RegisterFormValues>
          name="fullName"
          label="Full name"
          placeholder="Ada Lovelace"
          autoComplete="name"
          autoFocus
        />

        <ControlledInput<RegisterFormValues>
          name="email"
          label="Email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
        />

        <ControlledInput<RegisterFormValues>
          name="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          description="At least 8 characters, with upper- and lowercase letters, a number, and a symbol."
        />

        <ControlledInput<RegisterFormValues>
          name="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Create account
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
