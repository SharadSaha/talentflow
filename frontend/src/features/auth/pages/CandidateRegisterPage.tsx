import { ROUTES } from '@/constants/routes';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { RoleAuthTabs } from '@/features/auth/components/RoleAuthTabs';

/** Candidate registration page. Only candidates can self-register. */
export default function CandidateRegisterPage() {
  return (
    <AuthCard
      eyebrow="For candidates"
      title="Create your account"
      description="Join TalentFlow to discover roles and apply in a click."
      tabs={<RoleAuthTabs active="candidate" mode="register" />}
      roleSwitch={{ label: 'Hiring instead? Employer sign in', href: ROUTES.AUTH.HR_LOGIN }}
    >
      <RegisterForm loginHref={ROUTES.AUTH.CANDIDATE_LOGIN} />
    </AuthCard>
  );
}
