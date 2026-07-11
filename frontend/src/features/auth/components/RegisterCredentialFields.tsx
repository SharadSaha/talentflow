import { ControlledInput } from '@/components/ui/controlled-input';

/**
 * The shape of the fields rendered here. Both the candidate and employer
 * registration forms include these, so their form values structurally satisfy
 * this contract — the component reads them through the form context.
 */
interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterCredentialFieldsProps {
  /** Autofocus the first field on mount. Disable when another field leads the form. */
  autoFocusName?: boolean;
}

/**
 * The name/email/password credential fields shared by every registration form.
 * Bound to React Hook Form through the surrounding `Form` context, so it never
 * re-implements the RHF glue and both flows stay in lock-step.
 */
export function RegisterCredentialFields({ autoFocusName = true }: RegisterCredentialFieldsProps) {
  return (
    <>
      <ControlledInput<RegisterCredentials>
        name="fullName"
        label="Full name"
        placeholder="Ada Lovelace"
        autoComplete="name"
        autoFocus={autoFocusName}
      />

      <ControlledInput<RegisterCredentials>
        name="email"
        label="Email"
        type="email"
        placeholder="you@company.com"
        autoComplete="email"
      />

      <ControlledInput<RegisterCredentials>
        name="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        description="At least 8 characters, with upper- and lowercase letters, a number, and a symbol."
      />

      <ControlledInput<RegisterCredentials>
        name="confirmPassword"
        label="Confirm password"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
      />
    </>
  );
}
