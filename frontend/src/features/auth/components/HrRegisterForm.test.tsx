import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { USER_ROLE } from '@/constants/roles';
import { HrRegisterForm } from '@/features/auth/components/HrRegisterForm';
import { readFetchRequest, renderWithProviders } from '@/test/test-utils';

const authResult = {
  user: {
    id: '1',
    email: 'grace@acme.test',
    firstName: 'Grace',
    lastName: 'Hopper',
    role: USER_ROLE.HR,
    organizationName: 'Acme Inc.',
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

function renderHrRegisterForm() {
  return renderWithProviders(
    <MemoryRouter>
      <HrRegisterForm loginHref="/auth/hr/login" />
    </MemoryRouter>,
  );
}

async function fillCredentials(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Full name'), 'Grace Hopper');
  await user.type(screen.getByLabelText('Email'), 'grace@acme.test');
  await user.type(screen.getByLabelText('Password'), 'Str0ng!!');
  await user.type(screen.getByLabelText('Confirm password'), 'Str0ng!!');
}

describe('HrRegisterForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('requires an organization name', async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch({});
    renderHrRegisterForm();

    await fillCredentials(user);
    await user.click(screen.getByRole('button', { name: 'Create employer account' }));

    expect(await screen.findByText('Organization name is required.')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a whitespace-only organization name', async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch({});
    renderHrRegisterForm();

    await user.type(screen.getByLabelText('Organization name'), '   ');
    await fillCredentials(user);
    await user.click(screen.getByRole('button', { name: 'Create employer account' }));

    expect(await screen.findByText('Organization name is required.')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('submits the HR role and organization name to the register endpoint', async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch({ success: true, message: 'ok', data: authResult }, 201);
    renderHrRegisterForm();

    await user.type(screen.getByLabelText('Organization name'), 'Acme Inc.');
    await fillCredentials(user);
    await user.click(screen.getByRole('button', { name: 'Create employer account' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const { url, body } = await readFetchRequest(fetchMock);
    expect(url).toContain('/auth/register');
    expect(body).toEqual({
      email: 'grace@acme.test',
      password: 'Str0ng!!',
      firstName: 'Grace',
      lastName: 'Hopper',
      role: 'HR',
      organizationName: 'Acme Inc.',
    });
  });
});
