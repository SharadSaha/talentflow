import {
  BarChart3,
  KanbanSquare,
  LayoutDashboard,
  type LucideIcon,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react';

export interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

/** Product capabilities shown in the features grid. Kept concise and concrete. */
export const FEATURES: FeatureItem[] = [
  {
    icon: Sparkles,
    title: 'Candidate discovery',
    description:
      'Surface the strongest matches for every role with ranked shortlists based on skills, experience, and intent.',
  },
  {
    icon: KanbanSquare,
    title: 'Application tracking',
    description:
      'Move candidates through a clear pipeline. Every stage, note, and decision stays in one place.',
  },
  {
    icon: LayoutDashboard,
    title: 'Role-based workspaces',
    description:
      'HR teams and candidates each get a focused view — no clutter, no permissions guesswork.',
  },
  {
    icon: Search,
    title: 'Advanced search & filters',
    description:
      'Filter by location, seniority, availability, and more. Find the right person in seconds, not hours.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & insights',
    description:
      'Track time-to-hire, funnel conversion, and pipeline health with reporting that stays current.',
  },
  {
    icon: Zap,
    title: 'Built for speed',
    description:
      'A fast, keyboard-friendly interface that keeps up with high-volume hiring on any device.',
  },
];
