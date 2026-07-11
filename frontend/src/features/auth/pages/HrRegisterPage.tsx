import { ROUTES } from '@/constants/routes';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { HrRegisterForm } from '@/features/auth/components/HrRegisterForm';
import { RoleAuthTabs } from '@/features/auth/components/RoleAuthTabs';

/**
 * Employer registration page. Employers self-register a hiring workspace by
 * providing their organization name alongside their personal credentials; the
 * account is created with the HR role and signed in immediately.
 */
export default function HrRegisterPage() {
  return (
    <AuthCard
      eyebrow="For employers"
      title="Create your employer account"
      description="Set up your hiring workspace to post roles and manage applicants."
      tabs={<RoleAuthTabs active="hr" mode="register" />}
      roleSwitch={{
        label: 'Looking for a job? Candidate sign up',
        href: ROUTES.AUTH.CANDIDATE_REGISTER,
      }}
    >
      <HrRegisterForm loginHref={ROUTES.AUTH.HR_LOGIN} />
    </AuthCard>
  );
}
