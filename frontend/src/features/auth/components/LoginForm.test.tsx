import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { USER_ROLE } from '@/constants/roles';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { readFetchRequest, renderWithProviders } from '@/test/test-utils';

const authResult = {
  user: {
    id: '1',
    email: 'candidate@talentflow.test',
    firstName: 'Ada',
    lastName: 'Lovelace',
    role: USER_ROLE.CANDIDATE,
    organizationName: null,
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

function renderLoginForm() {
  return renderWithProviders(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>,
  );
}

describe('LoginForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders the email and password fields and submit button', () => {
    renderLoginForm();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('shows validation errors and does not call the API when submitted empty', async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch({});
    renderLoginForm();

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText(/valid email address/i)).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('submits valid credentials to the login endpoint', async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch({ success: true, message: 'ok', data: authResult });
    renderLoginForm();

    await user.type(screen.getByLabelText('Email'), 'candidate@talentflow.test');
    await user.type(screen.getByLabelText('Password'), 'Str0ng!!');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const { url, body } = await readFetchRequest(fetchMock);
    expect(url).toContain('/auth/login');
    expect(body).toEqual({ email: 'candidate@talentflow.test', password: 'Str0ng!!' });
  });
});
