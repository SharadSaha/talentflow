import { Logo } from '@/components/branding/Logo';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { GithubIcon, LinkedinIcon, XIcon } from '@/features/landing/components/BrandIcons';
import { FOOTER_COLUMNS } from '@/features/landing/data/navigation';

const SOCIAL_LINKS = [
  { label: 'TalentFlow on GitHub', icon: GithubIcon },
  { label: 'TalentFlow on LinkedIn', icon: LinkedinIcon },
  { label: 'TalentFlow on X', icon: XIcon },
];

/**
 * Landing page footer: brand summary with social links, navigational link
 * columns, and a bottom bar with copyright and theme control.
 */
export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_2fr]">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-xs text-small text-foreground-muted">
              The hiring workspace that keeps pace with your team — from first job post to final
              offer.
            </p>
            <ul className="flex list-none items-center gap-1">
              {SOCIAL_LINKS.map(({ label, icon: Icon }) => (
                <li key={label}>
                  <Button asChild variant="ghost" size="icon">
                    <a href="#" aria-label={label}>
                      <Icon />
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title}>
                <h2 className="text-sm font-medium text-foreground">{column.title}</h2>
                <ul className="mt-3 flex list-none flex-col gap-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="rounded-md text-small text-foreground-muted outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-caption">© {year} TalentFlow. All rights reserved.</p>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
