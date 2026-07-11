import {
  BadgeCheck,
  CalendarClock,
  ClipboardCheck,
  FileText,
  type LucideIcon,
  Trophy,
  UserPlus,
} from 'lucide-react';

export interface WorkflowStep {
  icon: LucideIcon;
  title: string;
  description: string;
}

/** The end-to-end hiring journey visualised in the workflow section. */
export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    icon: UserPlus,
    title: 'Candidate',
    description: 'A candidate builds a profile and gets matched to open roles.',
  },
  {
    icon: FileText,
    title: 'Application',
    description: 'They apply in a click — no re-entering the same details.',
  },
  {
    icon: ClipboardCheck,
    title: 'HR review',
    description: 'Recruiters screen, score, and shortlist from one board.',
  },
  {
    icon: CalendarClock,
    title: 'Interview',
    description: 'Schedule and track interview rounds without the back-and-forth.',
  },
  {
    icon: BadgeCheck,
    title: 'Offer',
    description: 'Extend offers and capture responses in the same timeline.',
  },
  { icon: Trophy, title: 'Hire', description: 'Close the loop and keep every decision on record.' },
];
