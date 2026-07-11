import { ArrowRight, Building2, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

interface LoginRoleDialogProps {
  /** Whether the dialog is currently open. */
  open: boolean;
  /** Called when the open state should change (backdrop, escape, or selection). */
  onOpenChange: (open: boolean) => void;
}

interface RoleOption {
  key: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    key: 'candidate',
    title: 'Candidate',
    description: 'Track applications, save jobs, and manage your profile.',
    icon: UserRound,
    href: ROUTES.AUTH.CANDIDATE_LOGIN,
  },
  {
    key: 'employer',
    title: 'Employer (HR)',
    description: 'Post roles, review applicants, and run your pipeline.',
    icon: Building2,
    href: ROUTES.AUTH.HR_LOGIN,
  },
];

/**
 * A controlled role chooser shown when a visitor picks the generic "Log in"
 * action. Presents the two authentication paths (candidate and employer) as
 * large, focusable option cards and routes to the matching sign-in page.
 */
export function LoginRoleDialog({ open, onOpenChange }: LoginRoleDialogProps) {
  const navigate = useNavigate();

  function handleSelect(href: string) {
    onOpenChange(false);
    navigate(href);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sign in to TalentFlow</DialogTitle>
          <DialogDescription>Choose how you&apos;d like to continue.</DialogDescription>
        </DialogHeader>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {ROLE_OPTIONS.map(({ key, title, description, icon: Icon, href }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleSelect(href)}
              className={cn(
                'group flex flex-col gap-3 rounded-lg border border-border bg-card p-4 text-left',
                'outline-none transition-all duration-fast ease-emphasized',
                'hover:-translate-y-0.5 hover:border-primary hover:bg-surface-hover hover:shadow-md',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              )}
            >
              <span className="inline-flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="space-y-1">
                <span className="block text-small font-semibold text-foreground">{title}</span>
                <span className="block text-caption text-foreground-muted">{description}</span>
              </span>
              <span className="mt-auto inline-flex items-center gap-1 text-caption font-medium text-primary">
                Continue
                <ArrowRight
                  className="size-3.5 transition-transform duration-fast ease-emphasized group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
