import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { ControlledCheckbox } from '@/components/ui/controlled-checkbox';
import { ControlledInput } from '@/components/ui/controlled-input';
import { Form } from '@/components/ui/form';
import { ROUTES } from '@/constants/routes';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { type LoginFormValues, loginSchema } from '@/features/auth/schemas/auth.schemas';
import { applyServerFieldErrors } from '@/utils/form-errors';

const DEFAULT_VALUES: LoginFormValues = {
  email: '',
  password: '',
  rememberMe: true,
};

/**
 * Sign-in form. Validation and submission state come from React Hook Form + Zod;
 * the login workflow (API, session, redirect, toasts) lives in `useLogin`, so
 * this component only renders and wires the fields.
 */
export function LoginForm() {
  const { login, isLoading } = useLogin();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const error = await login(values);
    if (error) {
      applyServerFieldErrors(form.setError, error.fieldErrors, ['email', 'password']);
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <ControlledInput<LoginFormValues>
          name="email"
          label="Email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          autoFocus
        />

        <div className="space-y-1.5">
          <ControlledInput<LoginFormValues>
            name="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <div className="flex justify-end">
            <button
              type="button"
              disabled
              className="text-caption text-foreground-muted disabled:cursor-not-allowed"
              title="Password recovery is coming soon"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <ControlledCheckbox<LoginFormValues> name="rememberMe" label="Remember me" />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign in
        </Button>

        <p className="text-center text-small text-foreground-muted">
          Don&apos;t have an account?{' '}
          <Link to={ROUTES.REGISTER} className="link font-medium">
            Create one
          </Link>
        </p>
      </form>
    </Form>
  );
}
