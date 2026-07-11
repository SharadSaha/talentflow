import { Link } from 'react-router-dom';
import { Building2, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { AuthCard } from '@/features/auth/components/AuthCard';

/**
 * Employer registration page. The backend provisions HR accounts via an admin
 * seed rather than public self-service, so this page explains the invite-only
 * flow and routes employers to sign in. The route and page exist to keep the
 * auth architecture symmetric and ready if self-service is enabled later.
 */
export default function HrRegisterPage() {
  return (
    <AuthCard
      eyebrow="For employers"
      title="Request employer access"
      description="Employer accounts are provisioned by a TalentFlow administrator to keep hiring workspaces secure."
      roleSwitch={{
        label: 'Looking for a job? Candidate sign up',
        href: ROUTES.AUTH.CANDIDATE_REGISTER,
      }}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-small text-foreground-secondary">
            Employer accounts are created by an administrator. Once your workspace is set up,
            you&apos;ll receive credentials to sign in.
          </p>
        </div>

        <Button asChild className="w-full">
          <Link to={ROUTES.AUTH.HR_LOGIN}>
            <Building2 />
            Go to employer sign in
          </Link>
        </Button>

        <p className="text-center text-small text-foreground-muted">
          Already have access?{' '}
          <Link to={ROUTES.AUTH.HR_LOGIN} className="link font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
