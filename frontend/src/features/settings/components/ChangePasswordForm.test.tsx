import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ChangePasswordForm } from '@/features/settings/components/ChangePasswordForm';

describe('ChangePasswordForm', () => {
  it('disables the submit button until the form is edited', () => {
    render(<ChangePasswordForm />);

    expect(screen.getByRole('button', { name: /update password/i })).toBeDisabled();
  });

  it('rejects a weak new password with a validation message', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm />);

    await user.type(screen.getByLabelText('Current password'), 'OldPass123');
    await user.type(screen.getByLabelText('New password'), 'weak');
    await user.type(screen.getByLabelText('Confirm new password'), 'weak');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();
  });

  it('rejects a confirmation that does not match the new password', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm />);

    await user.type(screen.getByLabelText('Current password'), 'OldPass123');
    await user.type(screen.getByLabelText('New password'), 'NewPass123');
    await user.type(screen.getByLabelText('Confirm new password'), 'NewPass124');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('reveals the password when the show toggle is activated', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm />);

    const currentPassword = screen.getByLabelText('Current password');
    expect(currentPassword).toHaveAttribute('type', 'password');

    // The toggles render in field order, so the first reveals the current password.
    const [toggle] = screen.getAllByRole('button', { name: /show password/i });
    await user.click(toggle);

    expect(currentPassword).toHaveAttribute('type', 'text');
  });
});
