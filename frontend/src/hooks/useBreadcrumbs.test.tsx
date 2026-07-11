import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';

/** Renders the breadcrumb trail as list items so tests can assert on the output. */
function BreadcrumbProbe() {
  const breadcrumbs = useBreadcrumbs();
  return (
    <ul>
      {breadcrumbs.map((crumb) => (
        <li key={crumb.to} data-current={crumb.isCurrent} data-to={crumb.to}>
          {crumb.label}
        </li>
      ))}
    </ul>
  );
}

function renderAt(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/hr',
        handle: { title: 'HR' },
        children: [
          {
            path: 'jobs',
            handle: { title: 'Jobs' },
            children: [{ path: ':id', handle: { title: 'Details' }, element: <BreadcrumbProbe /> }],
          },
        ],
      },
      { path: '/plain', element: <BreadcrumbProbe /> },
    ],
    { initialEntries: [initialPath] },
  );
  render(<RouterProvider router={router} />);
}

describe('useBreadcrumbs', () => {
  it('derives one breadcrumb per matched route that declares a title', () => {
    renderAt('/hr/jobs/42');

    const items = screen.getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual(['HR', 'Jobs', 'Details']);
  });

  it('uses each matched route pathname as the breadcrumb link target', () => {
    renderAt('/hr/jobs/42');

    const items = screen.getAllByRole('listitem');
    expect(items.map((item) => item.getAttribute('data-to'))).toEqual([
      '/hr',
      '/hr/jobs',
      '/hr/jobs/42',
    ]);
  });

  it('marks only the last breadcrumb as the current one', () => {
    renderAt('/hr/jobs/42');

    const items = screen.getAllByRole('listitem');
    expect(items.map((item) => item.getAttribute('data-current'))).toEqual([
      'false',
      'false',
      'true',
    ]);
  });

  it('produces no breadcrumbs when no matched route declares a title', () => {
    renderAt('/plain');

    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
});
