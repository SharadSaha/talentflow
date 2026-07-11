import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Input } from '@/components/ui/input';

describe('Input', () => {
  it('renders with the provided placeholder and default text type', () => {
    render(<Input placeholder="Email" />);
    const input = screen.getByPlaceholderText('Email');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('records typed input via its change handler', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Input aria-label="Name" onChange={handleChange} />);

    await user.type(screen.getByLabelText('Name'), 'Ada');
    expect(handleChange).toHaveBeenCalled();
    expect(screen.getByLabelText<HTMLInputElement>('Name').value).toBe('Ada');
  });

  it('flags the invalid state with aria-invalid', () => {
    render(<Input aria-label="Email" error />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not accept input when disabled', async () => {
    const user = userEvent.setup();
    render(<Input aria-label="Email" disabled />);
    const input = screen.getByLabelText('Email');

    expect(input).toBeDisabled();
    await user.type(input, 'test');
    expect(input).toHaveValue('');
  });

  it('renders a leading icon and pads the field to clear it', () => {
    render(<Input aria-label="Search" startIcon={<svg data-testid="icon" />} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByLabelText('Search')).toHaveClass('pl-9');
  });
});
