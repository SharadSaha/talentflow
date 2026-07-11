import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { ThemeProvider } from '@/providers/theme/ThemeProvider';
import LandingPage from '@/features/landing/pages/LandingPage';

function renderLanding() {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <LandingPage />
      </ThemeProvider>
    </MemoryRouter>,
  );
}

describe('LandingPage', () => {
  it('renders the hero value proposition', () => {
    renderLanding();
    expect(
      screen.getByRole('heading', { level: 1, name: /keeps pace with your team/i }),
    ).toBeInTheDocument();
  });

  it('renders the key marketing sections', () => {
    renderLanding();
    expect(screen.getByRole('heading', { name: /nothing it doesn't/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /whole hiring picture/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /first application to first day/i }),
    ).toBeInTheDocument();
  });

  it('routes the primary CTAs into the app', () => {
    renderLanding();
    const getStartedLinks = screen.getAllByRole('link', { name: /get started/i });
    expect(getStartedLinks.length).toBeGreaterThan(0);
    getStartedLinks.forEach((link) => expect(link).toHaveAttribute('href', '/register'));
  });

  it('renders a footer with the current year copyright', () => {
    renderLanding();
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(`${year}.*TalentFlow`, 'i'))).toBeInTheDocument();
  });
});
