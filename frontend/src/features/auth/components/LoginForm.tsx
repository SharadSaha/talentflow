import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { ControlledCheckbox } from '@/components/ui/controlled-checkbox';
import { ControlledInput } from '@/components/ui/controlled-input';
import { Form } from '@/components/ui/form';
import type { UserRole } from '@/constants/roles';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { type LoginFormValues, loginSchema } from '@/features/auth/schemas/auth.schemas';
import { applyServerFieldErrors } from '@/utils/form-errors';

const DEFAULT_VALUES: LoginFormValues = {
  email: '',
  password: '',
  rememberMe: true,
};

interface LoginFormProps {
  /** The role of the page this form is on, so the redirect can be explained. */
  expectedRole?: UserRole;
  /** Role-specific footer (e.g. a "Create account" or "Contact admin" note). */
  footer?: ReactNode;
}

/**
 * Sign-in form. Validation and submission state come from React Hook Form + Zod;
 * the login workflow (API, session, redirect, toasts) lives in `useLogin`, so
 * this component only renders and wires the fields. The footer is supplied by
 * the role-specific page.
 */
export function LoginForm({ expectedRole, footer }: LoginFormProps) {
  const { login, isLoading } = useLogin(expectedRole);
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

        {footer ? (
          <div className="text-center text-small text-foreground-muted">{footer}</div>
        ) : null}
      </form>
    </Form>
  );
}
