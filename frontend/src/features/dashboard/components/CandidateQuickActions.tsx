import { Bookmark, FileText, Search, UserRound } from 'lucide-react';

import { QuickActionGrid, type QuickAction } from '@/components/ui/quick-action-grid';
import { ROUTES } from '@/constants/routes';

const CANDIDATE_ACTIONS: QuickAction[] = [
  {
    key: 'browse-jobs',
    title: 'Browse jobs',
    description: 'Find and apply to roles',
    to: ROUTES.CANDIDATE.JOBS,
    icon: Search,
    featured: true,
  },
  {
    key: 'update-profile',
    title: 'Update profile',
    description: 'Stand out to employers',
    to: ROUTES.CANDIDATE.PROFILE,
    icon: UserRound,
  },
  {
    key: 'view-applications',
    title: 'My applications',
    description: 'Track your progress',
    to: ROUTES.CANDIDATE.APPLICATIONS,
    icon: FileText,
  },
  {
    key: 'saved-jobs',
    title: 'Saved jobs',
    description: 'Revisit shortlisted roles',
    to: ROUTES.CANDIDATE.JOBS,
    icon: Bookmark,
  },
];

/** The candidate's highest-priority shortcuts, surfaced at the top of the home page. */
export function CandidateQuickActions() {
  return <QuickActionGrid actions={CANDIDATE_ACTIONS} />;
}
