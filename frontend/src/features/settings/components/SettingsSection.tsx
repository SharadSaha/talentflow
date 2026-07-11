import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface SettingsSectionProps {
  title: string;
  description?: string;
  /** Optional leading icon rendered beside the title. */
  icon?: LucideIcon;
  /** Right-aligned header controls. */
  actions?: ReactNode;
  /** Optional footer content (e.g. form actions). */
  footer?: ReactNode;
  children: ReactNode;
  /** Applies the danger accent to the section border and title. */
  tone?: 'default' | 'danger';
  className?: string;
  /** Class applied to the content wrapper (defaults to a vertical stack). */
  contentClassName?: string;
}

/**
 * A titled, bordered panel used to group related settings. Renders a header with
 * an optional icon, description, and actions, a content region, and an optional
 * footer. This is the primary layout primitive shared across both settings pages.
 */
export function SettingsSection({
  title,
  description,
  icon: Icon,
  actions,
  footer,
  children,
  tone = 'default',
  className,
  contentClassName,
}: SettingsSectionProps) {
  const isDanger = tone === 'danger';

  return (
    <Card className={cn(isDanger && 'border-danger/40', className)}>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="flex items-start gap-3">
          {Icon ? (
            <span
              aria-hidden="true"
              className={cn(
                'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border',
                isDanger
                  ? 'border-danger/40 bg-danger/10 text-danger'
                  : 'border-border bg-muted text-foreground-muted',
              )}
            >
              <Icon className="size-4" />
            </span>
          ) : null}
          <div className="flex flex-col gap-1">
            <h2 className={cn('text-h3', isDanger && 'text-danger')}>{title}</h2>
            {description ? <p className="text-small text-foreground-muted">{description}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </CardHeader>
      <CardContent className={cn('space-y-4', contentClassName)}>{children}</CardContent>
      {footer ? (
        <CardFooter className="justify-end gap-3 border-t border-border pt-4">{footer}</CardFooter>
      ) : null}
    </Card>
  );
}
