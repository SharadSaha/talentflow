import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { USER_ROLE } from '@/constants/roles';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { LoginForm } from '@/features/auth/components/LoginForm';

/** Candidate sign-in page. */
export default function CandidateLoginPage() {
  return (
    <AuthCard
      eyebrow="For candidates"
      title="Welcome back"
      description="Sign in to track applications, save jobs, and manage your profile."
      roleSwitch={{ label: 'Hiring instead? Employer sign in', href: ROUTES.AUTH.HR_LOGIN }}
    >
      <LoginForm
        expectedRole={USER_ROLE.CANDIDATE}
        footer={
          <>
            New to TalentFlow?{' '}
            <Link to={ROUTES.AUTH.CANDIDATE_REGISTER} className="link font-medium">
              Create an account
            </Link>
          </>
        }
      />
    </AuthCard>
  );
}
