import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthCardProps {
  /** Small role label above the title (e.g. "For candidates"). */
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  /** Optional control rendered above the card (e.g. a role switcher). */
  tabs?: ReactNode;
  /** Optional cross-link to the other role's entry point. */
  roleSwitch?: { label: string; href: string };
}

/**
 * Shared shell for the role-specific auth pages: a branded card header plus an
 * optional link to the other role's flow. Keeps the four auth screens visually
 * consistent while their content stays role-specific.
 */
export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  tabs,
  roleSwitch,
}: AuthCardProps) {
  return (
    <div className="w-full space-y-4">
      {tabs}
      <Card>
        <CardHeader>
          <p className="text-caption font-medium uppercase tracking-wider text-primary">
            {eyebrow}
          </p>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>

      {roleSwitch ? (
        <p className="text-center text-small text-foreground-muted">
          <Link
            to={roleSwitch.href}
            className="inline-flex items-center gap-1 outline-none transition-colors hover:text-foreground focus-visible:text-foreground"
          >
            {roleSwitch.label}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </p>
      ) : null}
    </div>
  );
}
