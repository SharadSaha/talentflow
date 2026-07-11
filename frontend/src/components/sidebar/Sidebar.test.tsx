import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { Sidebar } from '@/components/sidebar/Sidebar';
import { SidebarProvider } from '@/components/sidebar/SidebarProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { USER_ROLE, type UserRole } from '@/constants/roles';
import { ThemeProvider } from '@/providers/theme/ThemeProvider';
import type { AuthState } from '@/reducers/authSlice';
import { renderWithProviders } from '@/test/test-utils';
import type { User } from '@/types/user';

function makeUser(role: UserRole): User {
  return {
    id: '1',
    email: 'user@talentflow.test',
    firstName: 'Ada',
    lastName: 'Lovelace',
    role,
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

function authState(role: UserRole): AuthState {
  return { user: makeUser(role), token: 't', status: 'authenticated' };
}

function renderSidebar(role: UserRole, path: string, collapsed = false) {
  function Tree({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[path]}>
        <ThemeProvider>
          <TooltipProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </TooltipProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
  }

  return renderWithProviders(
    <Tree>
      <Sidebar />
    </Tree>,
    { preloadedState: { auth: authState(role), ui: { sidebarCollapsed: collapsed } } },
  );
}

describe('Sidebar', () => {
  it('renders the candidate navigation and hides HR-only items', () => {
    renderSidebar(USER_ROLE.CANDIDATE, '/candidate/dashboard');

    const nav = screen.getByRole('navigation', { name: /primary/i });
    expect(within(nav).getByRole('link', { name: /career hub/i })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: /browse jobs/i })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: /my applications/i })).toBeInTheDocument();
    expect(within(nav).queryByRole('link', { name: /applicants/i })).not.toBeInTheDocument();
  });

  it('renders the HR navigation and hides candidate-only items', () => {
    renderSidebar(USER_ROLE.HR, '/hr/dashboard');

    const nav = screen.getByRole('navigation', { name: /primary/i });
    expect(within(nav).getByRole('link', { name: /applicants/i })).toBeInTheDocument();
    expect(within(nav).queryByRole('link', { name: /browse jobs/i })).not.toBeInTheDocument();
    expect(within(nav).queryByRole('link', { name: /applied jobs/i })).not.toBeInTheDocument();
  });

  it('marks the active route with aria-current, including nested paths', () => {
    renderSidebar(USER_ROLE.HR, '/hr/jobs/123/edit');

    const nav = screen.getByRole('navigation', { name: /primary/i });
    expect(within(nav).getByRole('link', { name: /jobs/i })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(nav).getByRole('link', { name: /hiring hub/i })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('persists the collapse toggle to global state', async () => {
    const user = userEvent.setup();
    const { store } = renderSidebar(USER_ROLE.CANDIDATE, '/candidate/dashboard');

    expect(store.getState().ui.sidebarCollapsed).toBe(false);
    await user.click(screen.getByRole('button', { name: /collapse sidebar/i }));
    expect(store.getState().ui.sidebarCollapsed).toBe(true);
  });

  it('exposes the account menu with a log-out action', async () => {
    const user = userEvent.setup();
    renderSidebar(USER_ROLE.CANDIDATE, '/candidate/dashboard');

    await user.click(screen.getByRole('button', { name: /account menu for ada lovelace/i }));
    expect(await screen.findByRole('menuitem', { name: /log out/i })).toBeInTheDocument();
  });
});
