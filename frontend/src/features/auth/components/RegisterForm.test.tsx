import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { USER_ROLE } from '@/constants/roles';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { readFetchRequest, renderWithProviders } from '@/test/test-utils';

const authResult = {
  user: {
    id: '1',
    email: 'candidate@talentflow.test',
    firstName: 'Ada',
    lastName: 'Lovelace',
    role: USER_ROLE.CANDIDATE,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  accessToken: 'token-abc',
};

function mockFetch(body: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function renderRegisterForm() {
  return renderWithProviders(
    <MemoryRouter>
      <RegisterForm />
    </MemoryRouter>,
  );
}

describe('RegisterForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('requires a first and last name', async () => {
    const user = userEvent.setup();
    mockFetch({});
    renderRegisterForm();

    await user.type(screen.getByLabelText('Full name'), 'Ada');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Enter your first and last name.')).toBeInTheDocument();
  });

  it('flags mismatched passwords', async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch({});
    renderRegisterForm();

    await user.type(screen.getByLabelText('Full name'), 'Ada Lovelace');
    await user.type(screen.getByLabelText('Email'), 'candidate@talentflow.test');
    await user.type(screen.getByLabelText('Password'), 'Str0ng!!');
    await user.type(screen.getByLabelText('Confirm password'), 'Different1!');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('submits a split name to the register endpoint', async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch({ success: true, message: 'ok', data: authResult }, 201);
    renderRegisterForm();

    await user.type(screen.getByLabelText('Full name'), 'Ada Lovelace');
    await user.type(screen.getByLabelText('Email'), 'candidate@talentflow.test');
    await user.type(screen.getByLabelText('Password'), 'Str0ng!!');
    await user.type(screen.getByLabelText('Confirm password'), 'Str0ng!!');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const { url, body } = await readFetchRequest(fetchMock);
    expect(url).toContain('/auth/register');
    expect(body).toEqual({
      email: 'candidate@talentflow.test',
      password: 'Str0ng!!',
      firstName: 'Ada',
      lastName: 'Lovelace',
    });
  });
});
