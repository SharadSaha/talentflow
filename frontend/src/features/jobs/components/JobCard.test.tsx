import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { makeJob } from '@/test/fixtures';

async function renderCard(jobOverrides = {}) {
  const { JobCard } = await import('@/features/jobs/components/JobCard');
  const job = makeJob(jobOverrides);
  render(
    <MemoryRouter>
      <JobCard job={job} />
    </MemoryRouter>,
  );
  return job;
}

describe('JobCard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the job title, company, and a link to the details page', async () => {
    const job = await renderCard({ id: 'job-42', title: 'Staff Engineer' });

    expect(screen.getByRole('heading', { name: 'Staff Engineer' })).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /view staff engineer/i });
    expect(link).toHaveAttribute('href', `/candidate/jobs/${job.id}`);
  });

  it('toggles the bookmark state when the bookmark button is clicked', async () => {
    const user = userEvent.setup();
    await renderCard({ id: 'job-77', title: 'Backend Engineer' });

    const saveButton = screen.getByRole('button', { name: /save backend engineer/i });
    expect(saveButton).toHaveAttribute('aria-pressed', 'false');

    await user.click(saveButton);

    const savedButton = screen.getByRole('button', {
      name: /remove backend engineer from bookmarks/i,
    });
    expect(savedButton).toHaveAttribute('aria-pressed', 'true');
  });
});
