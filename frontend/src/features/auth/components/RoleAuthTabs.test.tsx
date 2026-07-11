import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { RoleAuthTabs } from '@/features/auth/components/RoleAuthTabs';

function renderTabs() {
  return render(
    <MemoryRouter initialEntries={['/auth/candidate/login']}>
      <Routes>
        <Route
          path="/auth/candidate/login"
          element={
            <>
              <RoleAuthTabs active="candidate" mode="login" />
              <div>Candidate sign in</div>
            </>
          }
        />
        <Route path="/auth/hr/login" element={<div>Employer sign in</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RoleAuthTabs', () => {
  it('renders both role tabs with the active one selected', () => {
    renderTabs();
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(2);
    expect(screen.getByRole('tab', { name: /candidate/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: /hr/i })).toHaveAttribute('aria-selected', 'false');
  });

  it('switches to the HR login page when the HR tab is selected', async () => {
    const user = userEvent.setup();
    renderTabs();
    await user.click(screen.getByRole('tab', { name: /hr/i }));
    expect(screen.getByText('Employer sign in')).toBeInTheDocument();
  });
});
