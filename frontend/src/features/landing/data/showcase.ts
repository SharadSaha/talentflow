import type { BadgeIntent } from '@/types/status';

/** A candidate card shown on the pipeline board. */
export interface ShowcaseCandidate {
  name: string;
  role: string;
  /** Short skill/experience tags. */
  tags: string[];
  /** Match score 0–100. */
  match: number;
}

export interface PipelineColumn {
  stage: string;
  intent: BadgeIntent;
  candidates: ShowcaseCandidate[];
}

/** Applicant pipeline used by the hero preview and product showcase. */
export const PIPELINE: PipelineColumn[] = [
  {
    stage: 'Applied',
    intent: 'neutral',
    candidates: [
      { name: 'Ava Chen', role: 'Senior Frontend Engineer', tags: ['React', '6y'], match: 92 },
      { name: 'Marcus Hale', role: 'Product Designer', tags: ['Figma', '4y'], match: 84 },
    ],
  },
  {
    stage: 'Screening',
    intent: 'info',
    candidates: [
      { name: 'Sofia Reyes', role: 'Backend Engineer', tags: ['Node', '5y'], match: 88 },
    ],
  },
  {
    stage: 'Interview',
    intent: 'warning',
    candidates: [
      { name: 'Jordan Blake', role: 'Engineering Manager', tags: ['Leadership', '9y'], match: 95 },
    ],
  },
  {
    stage: 'Offer',
    intent: 'success',
    candidates: [{ name: 'Priya Nair', role: 'Data Scientist', tags: ['Python', '7y'], match: 97 }],
  },
];

/** A row in the job management table. */
export interface ShowcaseJob {
  title: string;
  department: string;
  location: string;
  applicants: number;
  status: string;
  statusIntent: BadgeIntent;
}

export const JOBS_TABLE: ShowcaseJob[] = [
  {
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote',
    applicants: 48,
    status: 'Published',
    statusIntent: 'success',
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Berlin',
    applicants: 32,
    status: 'Published',
    statusIntent: 'success',
  },
  {
    title: 'Engineering Manager',
    department: 'Engineering',
    location: 'London',
    applicants: 21,
    status: 'Draft',
    statusIntent: 'neutral',
  },
  {
    title: 'Data Scientist',
    department: 'Data',
    location: 'Remote',
    applicants: 27,
    status: 'Closed',
    statusIntent: 'danger',
  },
];

/** Compact KPI tiles for the analytics panel. */
export interface ShowcaseMetric {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down';
}

export const METRICS: ShowcaseMetric[] = [
  { label: 'Time to hire', value: '18 days', delta: '−22%', trend: 'up' },
  { label: 'Offer accept rate', value: '86%', delta: '+9%', trend: 'up' },
  { label: 'Active pipeline', value: '128', delta: '+14', trend: 'up' },
];

/** A normalised bar series (values 0–100) for the analytics sparkline/bars. */
export const APPLICATIONS_TREND: number[] = [42, 58, 51, 74, 66, 88, 96];

export interface ActivityEntry {
  name: string;
  action: string;
  target: string;
  time: string;
}

export const ACTIVITY: ActivityEntry[] = [
  { name: 'Priya Nair', action: 'moved to', target: 'Offer', time: '2m ago' },
  {
    name: 'Jordan Blake',
    action: 'scheduled an interview for',
    target: 'Eng Manager',
    time: '1h ago',
  },
  {
    name: 'Sofia Reyes',
    action: 'passed screening for',
    target: 'Backend Engineer',
    time: '3h ago',
  },
];
