import { Link } from 'react-router-dom';

import { Logo } from '@/components/branding/Logo';
import { Button } from '@/components/ui/button';
import { MobileNav } from '@/components/ui/mobile-nav';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ROUTES } from '@/constants/routes';
import { GithubIcon } from '@/features/landing/components/BrandIcons';
import { LoginRoleDialog } from '@/features/landing/components/LoginRoleDialog';
import { NAV_LINKS } from '@/features/landing/data/navigation';
import { useScrolled } from '@/features/landing/hooks/useScrolled';
import { useDisclosure } from '@/hooks/useDisclosure';
import { cn } from '@/lib/utils';

const GITHUB_URL = '#';

/**
 * Sticky landing navigation. Transparent over the hero, gaining a blurred,
 * bordered background once the page scrolls. Anchor links jump to in-page
 * sections; auth actions route into the app. Collapses to a drawer on mobile.
 */
export function LandingNav() {
  const scrolled = useScrolled();
  const loginDialog = useDisclosure();

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-colors duration-slow ease-emphasized',
        scrolled
          ? 'border-b border-border bg-surface/80 backdrop-blur'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4 sm:px-6"
      >
        <a href="#top" aria-label="TalentFlow home" className="rounded-md">
          <Logo />
        </a>

        <ul className="ml-2 hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="rounded-md px-3 py-2 text-sm text-foreground-secondary outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-1.5">
          <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex">
            <a href={GITHUB_URL} aria-label="GitHub repository" rel="noreferrer">
              <GithubIcon />
            </a>
          </Button>
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to={ROUTES.AUTH.HR_LOGIN}>For employers</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={loginDialog.open}
          >
            Log in
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to={ROUTES.AUTH.CANDIDATE_REGISTER}>Get started</Link>
          </Button>

          <div className="md:hidden">
            <MobileNav title="TalentFlow">
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="rounded-md px-3 py-2 text-sm text-foreground-secondary transition-colors hover:bg-surface-hover hover:text-foreground"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="mt-3 flex flex-col gap-2 border-t border-border pt-4">
                  <Button asChild className="w-full">
                    <Link to={ROUTES.AUTH.CANDIDATE_REGISTER}>I&apos;m looking for a job</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={ROUTES.AUTH.HR_LOGIN}>I&apos;m hiring</Link>
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={loginDialog.open}>
                    Log in
                  </Button>
                </div>
              </div>
            </MobileNav>
          </div>
        </div>
      </nav>

      <LoginRoleDialog open={loginDialog.isOpen} onOpenChange={loginDialog.setOpen} />
    </header>
  );
}
