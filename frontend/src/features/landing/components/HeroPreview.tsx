import { type PointerEvent, useCallback } from 'react';
import { ArrowUpRight, Check, Search, TrendingUp } from 'lucide-react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/ui/status-badge';
import { METRICS, PIPELINE } from '@/features/landing/data/showcase';
import { getInitials } from '@/utils/format';

/** A single candidate tile within a pipeline column. */
function CandidateCard({ name, role, match }: { name: string; role: string; match: number }) {
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
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-foreground-muted">Match</span>
        <span className="text-[11px] font-semibold text-success">{match}%</span>
      </div>
    </div>
  );
}

/** A floating accent card that gently drifts (disabled under reduced motion). */
function FloatingCard({
  className,
  children,
  animate,
}: {
  className: string;
  children: React.ReactNode;
  animate: boolean;
}) {
  return (
    <motion.div
      aria-hidden="true"
      className={className}
      animate={animate ? { y: [0, -8, 0] } : undefined}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

/**
 * An interactive mock of the TalentFlow app: a KPI row and applicant pipeline
 * board built from the design system's own primitives, with a subtle pointer
 * parallax tilt and floating status cards. Presentational only.
 */
export function HeroPreview() {
  const prefersReducedMotion = useReducedMotion();

  const rotateXValue = useMotionValue(0);
  const rotateYValue = useMotionValue(0);
  const rotateX = useSpring(rotateXValue, { stiffness: 150, damping: 18 });
  const rotateY = useSpring(rotateYValue, { stiffness: 150, damping: 18 });
  const glareX = useTransform(rotateY, [-6, 6], ['30%', '70%']);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (prefersReducedMotion) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      const px = (event.clientX - bounds.left) / bounds.width - 0.5;
      const py = (event.clientY - bounds.top) / bounds.height - 0.5;
      rotateYValue.set(px * 10);
      rotateXValue.set(-py * 10);
    },
    [prefersReducedMotion, rotateXValue, rotateYValue],
  );

  const handlePointerLeave = useCallback(() => {
    rotateXValue.set(0);
    rotateYValue.set(0);
  }, [rotateXValue, rotateYValue]);

  return (
    <div
      className="relative [perspective:1600px]"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <motion.div
        style={prefersReducedMotion ? undefined : { rotateX, rotateY }}
        className="relative overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-lg [transform-style:preserve-3d]"
      >
        {/* App toolbar */}
        <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
          </div>
          <div className="ml-2 flex h-7 max-w-xs flex-1 items-center gap-2 rounded-md border border-input bg-surface px-2.5 text-foreground-muted">
            <Search className="size-3.5" />
            <span className="text-xs">Search candidates…</span>
          </div>
          <Avatar className="size-7">
            <AvatarFallback className="text-[10px]">HR</AvatarFallback>
          </Avatar>
        </div>

        <div className="space-y-4 p-4">
          {/* KPI row */}
          <div className="grid grid-cols-3 gap-3">
            {METRICS.map((metric) => (
              <div key={metric.label} className="rounded-lg border border-border bg-surface p-3">
                <p className="truncate text-[11px] text-foreground-muted">{metric.label}</p>
                <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                  {metric.value}
                </p>
                <p className="mt-0.5 inline-flex items-center gap-0.5 text-[11px] font-medium text-success">
                  <TrendingUp className="size-3" />
                  {metric.delta}
                </p>
              </div>
            ))}
          </div>

          {/* Pipeline board */}
          <div className="grid grid-cols-4 gap-3">
            {PIPELINE.map((column) => (
              <div key={column.stage} className="space-y-2">
                <div className="flex items-center justify-between">
                  <StatusBadge intent={column.intent} label={column.stage} />
                  <span className="text-[11px] text-foreground-muted">
                    {column.candidates.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {column.candidates.map((candidate) => (
                    <CandidateCard
                      key={candidate.name}
                      name={candidate.name}
                      role={candidate.role}
                      match={candidate.match}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {!prefersReducedMotion ? (
          <motion.div
            aria-hidden="true"
            style={{ left: glareX }}
            className="pointer-events-none absolute top-0 h-full w-40 -translate-x-1/2 bg-foreground/[0.03] blur-2xl"
          />
        ) : null}
      </motion.div>

      {/* Floating accent cards */}
      <FloatingCard
        animate={!prefersReducedMotion}
        className="absolute -right-4 top-8 hidden rounded-lg border border-border bg-surface-elevated p-3 shadow-lg sm:block"
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-success/15 text-success">
            <Check className="size-4" />
          </span>
          <div>
            <p className="text-xs font-medium text-foreground">Offer accepted</p>
            <p className="text-[11px] text-foreground-muted">Priya Nair · Data Scientist</p>
          </div>
        </div>
      </FloatingCard>

      <FloatingCard
        animate={!prefersReducedMotion}
        className="absolute -bottom-5 left-2 hidden rounded-lg border border-border bg-surface-elevated p-3 shadow-lg sm:block"
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-primary/15 text-primary">
            <ArrowUpRight className="size-4" />
          </span>
          <div>
            <p className="text-xs font-medium text-foreground">+18 candidates</p>
            <p className="text-[11px] text-foreground-muted">this week</p>
          </div>
        </div>
      </FloatingCard>
    </div>
  );
}
