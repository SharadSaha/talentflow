import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { useModuleSearch } from '@/hooks/useModuleSearch';

function Probe() {
  const { search, placeholder } = useModuleSearch();
  const location = useLocation();
  return (
    <div>
      <span data-testid="location">{`${location.pathname}${location.search}`}</span>
      <span data-testid="placeholder">{placeholder}</span>
      <button onClick={() => search('react')}>go</button>
    </div>
  );
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Probe />
    </MemoryRouter>,
  );
}

describe('useModuleSearch', () => {
  it('routes a candidate query into the browse-jobs list', async () => {
    const user = userEvent.setup();
    renderAt('/candidate/dashboard');
    await user.click(screen.getByRole('button', { name: 'go' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/candidate/jobs?keyword=react');
  });

  it('routes an HR query into the jobs list', async () => {
    const user = userEvent.setup();
    renderAt('/hr/dashboard');
    await user.click(screen.getByRole('button', { name: 'go' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/hr/jobs?keyword=react');
  });

  it('searches applicants in place, preserving the selected job', async () => {
    const user = userEvent.setup();
    renderAt('/hr/applicants?job=job-1');
    expect(screen.getByTestId('placeholder')).toHaveTextContent(/applicants/i);
    await user.click(screen.getByRole('button', { name: 'go' }));
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/hr/applicants?job=job-1&keyword=react',
    );
  });
});
