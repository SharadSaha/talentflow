import { Briefcase, Plus, UserCog, Users } from 'lucide-react';

import { QuickActionGrid, type QuickAction } from '@/components/ui/quick-action-grid';
import { ROUTES } from '@/constants/routes';

const HR_ACTIONS: QuickAction[] = [
  {
    key: 'create-job',
    title: 'Post a job',
    description: 'Open a new requisition',
    to: ROUTES.HR.JOB_NEW,
    icon: Plus,
    featured: true,
  },
  {
    key: 'review-applicants',
    title: 'Review applicants',
    description: 'Move candidates forward',
    to: ROUTES.HR.APPLICANTS,
    icon: Users,
  },
  {
    key: 'manage-jobs',
    title: 'Manage jobs',
    description: 'Edit and track postings',
    to: ROUTES.HR.JOBS,
    icon: Briefcase,
  },
  {
    key: 'company-profile',
    title: 'Company profile',
    description: 'Keep your brand sharp',
    to: ROUTES.HR.PROFILE,
    icon: UserCog,
  },
];

/** The recruiter's highest-priority shortcuts, surfaced at the top of the dashboard. */
export function HrQuickActions() {
  return <QuickActionGrid actions={HR_ACTIONS} />;
}
