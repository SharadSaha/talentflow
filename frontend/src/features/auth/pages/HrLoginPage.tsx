import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { USER_ROLE } from '@/constants/roles';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { RoleAuthTabs } from '@/features/auth/components/RoleAuthTabs';

/** HR (employer) sign-in page. */
export default function HrLoginPage() {
  return (
    <AuthCard
      eyebrow="For employers"
      title="Employer sign in"
      description="Manage job postings, review applicants, and move candidates through your pipeline."
      tabs={<RoleAuthTabs active="hr" mode="login" />}
      roleSwitch={{
        label: 'Looking for a job? Candidate sign in',
        href: ROUTES.AUTH.CANDIDATE_LOGIN,
      }}
    >
      <LoginForm
        expectedRole={USER_ROLE.HR}
        footer={
          <>
            Need an employer account?{' '}
            <Link to={ROUTES.AUTH.HR_REGISTER} className="link font-medium">
              Request access
            </Link>
          </>
        }
      />
    </AuthCard>
  );
}
