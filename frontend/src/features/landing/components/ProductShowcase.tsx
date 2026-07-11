import { Search, TrendingUp } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LandingSection } from '@/features/landing/components/LandingSection';
import { Reveal } from '@/features/landing/components/Reveal';
import { SectionHeading } from '@/features/landing/components/SectionHeading';
import {
  ACTIVITY,
  APPLICATIONS_TREND,
  JOBS_TABLE,
  METRICS,
  PIPELINE,
} from '@/features/landing/data/showcase';
import { getInitials } from '@/utils/format';

/** Weekday labels for the analytics trend bars. */
const TREND_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** A candidate tile on the pipeline board. */
function PipelineCard({
  name,
  role,
  tags,
  match,
}: (typeof PIPELINE)[number]['candidates'][number]) {
  return (
    <div className="rounded-md border border-border bg-surface p-2.5">
      <div className="flex items-center gap-2">
        <Avatar className="size-6">
          <AvatarFallback className="text-[10px]">{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-foreground">{name}</p>
          <p className="truncate text-[11px] text-foreground-muted">{role}</p>
        </div>
        <span className="text-[11px] font-semibold text-success">{match}%</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {tags.map((tag) => (
          <Badge key={tag} variant="outline" className="px-1.5 py-0 text-[10px]">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}

/** Kanban pipeline view. */
function PipelineView() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {PIPELINE.map((column) => (
        <div key={column.stage} className="min-w-[220px] flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <StatusBadge intent={column.intent} label={column.stage} />
            <span className="text-[11px] text-foreground-muted">{column.candidates.length}</span>
          </div>
          <div className="space-y-2 rounded-lg border border-border-subtle bg-muted/40 p-2">
            {column.candidates.map((candidate) => (
              <PipelineCard key={candidate.name} {...candidate} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Job management table view. */
function JobsView() {
  return (
    <div className="overflow-x-auto rounded-lg border border-border-subtle">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">Applicants</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {JOBS_TABLE.map((job) => (
            <TableRow key={job.title}>
              <TableCell className="font-medium text-foreground">{job.title}</TableCell>
              <TableCell className="text-foreground-secondary">{job.department}</TableCell>
              <TableCell className="text-foreground-secondary">{job.location}</TableCell>
              <TableCell className="text-right tabular-nums text-foreground-secondary">
                {job.applicants}
              </TableCell>
              <TableCell>
                <StatusBadge intent={job.statusIntent} label={job.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/** KPI tiles plus a bar chart of the applications trend. */
function AnalyticsView() {
  const trendLabel = `Applications received per day, trending upward from ${APPLICATIONS_TREND[0]} to ${
    APPLICATIONS_TREND[APPLICATIONS_TREND.length - 1]
  } over the past week.`;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {METRICS.map((metric) => (
          <div key={metric.label} className="rounded-lg border border-border bg-surface p-3">
            <p className="truncate text-[11px] text-foreground-muted">{metric.label}</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">
              {metric.value}
            </p>
            <p className="mt-0.5 inline-flex items-center gap-0.5 text-[11px] font-medium text-success">
              <TrendingUp className="size-3" aria-hidden="true" />
              {metric.delta}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-medium text-foreground">Applications this week</p>
          <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-success">
            <TrendingUp className="size-3" aria-hidden="true" />
            +21%
          </span>
        </div>
        <div className="flex h-32 items-end gap-2" role="img" aria-label={trendLabel}>
          {APPLICATIONS_TREND.map((value, index) => (
            <div
              key={TREND_DAYS[index]}
              className="flex-1 rounded-t bg-primary/80 transition-colors hover:bg-primary"
              style={{ height: `${value}%` }}
            />
          ))}
        </div>
        <div className="mt-1.5 flex gap-2" aria-hidden="true">
          {TREND_DAYS.map((day) => (
            <span key={day} className="flex-1 text-center text-[10px] text-foreground-muted">
              {day}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Vertical activity timeline. */
function ActivityView() {
  return (
    <ol className="ml-1 space-y-4 border-l border-border pl-4">
      {ACTIVITY.map((entry) => (
        <li key={`${entry.name}-${entry.target}`} className="relative">
          <span
            aria-hidden="true"
            className="absolute -left-[1.3125rem] top-1 size-2.5 rounded-full border-2 border-surface-elevated bg-primary"
          />
          <p className="text-small text-foreground-secondary">
            <b className="font-semibold text-foreground">{entry.name}</b> {entry.action}{' '}
            <b className="font-semibold text-foreground">{entry.target}</b>
          </p>
          <p className="text-caption text-foreground-muted">{entry.time}</p>
        </li>
      ))}
    </ol>
  );
}

/**
 * A large product showcase: a realistic, tabbed app frame that walks visitors
 * through TalentFlow's pipeline, jobs, analytics, and activity views. Built
 * entirely from the design system's primitives and static showcase data.
 */
export function ProductShowcase() {
  return (
    <LandingSection id="product" aria-labelledby="product-heading">
      <SectionHeading
        eyebrow="The workspace"
        title="See the whole hiring picture"
        description="Every candidate, role, and metric in one calm workspace — from first application to signed offer."
        titleId="product-heading"
      />

      <Reveal className="mt-12">
        <div className="overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-lg">
          {/* App toolbar */}
          <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-3">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="size-2.5 rounded-full bg-border" />
              <span className="size-2.5 rounded-full bg-border" />
              <span className="size-2.5 rounded-full bg-border" />
            </div>
            <div className="ml-2 flex h-7 max-w-xs flex-1 items-center gap-2 rounded-md border border-input bg-surface px-2.5 text-foreground-muted">
              <Search className="size-3.5" aria-hidden="true" />
              <span className="text-xs">Search candidates, jobs…</span>
            </div>
            <Avatar className="size-7">
              <AvatarFallback className="text-[10px]">HR</AvatarFallback>
            </Avatar>
          </div>

          {/* Tabbed body */}
          <Tabs defaultValue="pipeline" className="p-4">
            <TabsList>
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="pipeline">
              <PipelineView />
            </TabsContent>
            <TabsContent value="jobs">
              <JobsView />
            </TabsContent>
            <TabsContent value="analytics">
              <AnalyticsView />
            </TabsContent>
            <TabsContent value="activity">
              <ActivityView />
            </TabsContent>
          </Tabs>
        </div>
      </Reveal>
    </LandingSection>
  );
}
