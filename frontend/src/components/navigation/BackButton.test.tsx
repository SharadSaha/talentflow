import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { BackButton } from '@/components/navigation/BackButton';

describe('BackButton', () => {
  it('navigates to the fallback route when there is no in-app history', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/hr/jobs/new']}>
        <Routes>
          <Route
            path="/hr/jobs/new"
            element={<BackButton fallback="/hr/jobs" label="Back to jobs" />}
          />
          <Route path="/hr/jobs" element={<div>Jobs list</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /back to jobs/i }));
    expect(screen.getByText('Jobs list')).toBeInTheDocument();
  });

  it('goes back to the previous page when history exists', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/hr/jobs', '/hr/jobs/new']} initialIndex={1}>
        <Routes>
          <Route path="/hr/jobs" element={<div>Jobs list</div>} />
          <Route
            path="/hr/jobs/new"
            element={<BackButton fallback="/hr/dashboard" label="Back" />}
          />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByText('Jobs list')).toBeInTheDocument();
  });
});
