import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';

export interface QuickAction {
  /** Stable identity + React key. */
  key: string;
  title: string;
  description?: string;
  to: string;
  icon: LucideIcon;
  /** Renders as the filled primary tile — reserve for the single headline action. */
  featured?: boolean;
}

export interface QuickActionGridProps {
  actions: QuickAction[];
  className?: string;
}

/**
 * A prominent row of command tiles for a page's highest-priority actions. The
 * featured tile is filled with the brand accent; the rest are bordered surfaces
 * that lift on hover. Config-driven so both portals reuse it.
 */
export function QuickActionGrid({ actions, className }: QuickActionGridProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {actions.map((action) => {
        const Icon = action.icon;
        const isFeatured = action.featured ?? false;

        return (
          <Link
            key={action.key}
            to={action.to}
            className={cn(
              'group relative flex min-h-[7.5rem] flex-col justify-between overflow-hidden rounded-lg p-4 transition-all duration-normal ease-emphasized',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              isFeatured
                ? 'bg-primary text-primary-foreground shadow-elevation-medium hover:bg-primary-hover'
                : 'surface-widget surface-widget-interactive hover:-translate-y-0.5',
            )}
          >
            {isFeatured ? (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-6 -top-8 size-28 rounded-full bg-primary-foreground/10 blur-xl"
              />
            ) : null}

            <span
              className={cn(
                'inline-flex size-9 items-center justify-center rounded-md transition-transform duration-normal ease-emphasized group-hover:scale-105',
                isFeatured
                  ? 'bg-primary-foreground/15 text-primary-foreground'
                  : 'bg-primary/10 text-primary',
              )}
            >
              <Icon className="size-[18px]" aria-hidden="true" />
            </span>

            <div className="relative mt-3 flex items-end justify-between gap-2">
              <div className="min-w-0">
                <p className="text-body font-semibold">{action.title}</p>
                {action.description ? (
                  <p
                    className={cn(
                      'mt-0.5 truncate text-caption',
                      isFeatured ? 'text-primary-foreground/80' : 'text-foreground-muted',
                    )}
                  >
                    {action.description}
                  </p>
                ) : null}
              </div>
              <ArrowRight
                aria-hidden="true"
                className="size-4 shrink-0 translate-x-0 opacity-60 transition-transform duration-normal ease-emphasized group-hover:translate-x-1 group-hover:opacity-100"
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
