import { LandingSection } from '@/features/landing/components/LandingSection';
import { Reveal } from '@/features/landing/components/Reveal';
import { SectionHeading } from '@/features/landing/components/SectionHeading';
import { type StatItem, STATS } from '@/features/landing/data/stats';
import { useCountUp } from '@/features/landing/hooks/useCountUp';

/**
 * A single headline metric. Isolated into its own component so the `useCountUp`
 * hook is called at the top level (one instance per stat) rather than inside a
 * loop.
 */
function StatTile({ stat }: { stat: StatItem }) {
  const { ref, value } = useCountUp({ target: stat.value });

  return (
    <div className="rounded-lg border border-border bg-card p-6 text-center">
      <p className="text-4xl font-semibold tabular-nums tracking-tight text-foreground sm:text-5xl">
        {stat.prefix}
        <span ref={ref}>{value}</span>
        {stat.suffix}
      </p>
      <p className="mt-2 text-small text-foreground-muted">{stat.label}</p>
    </div>
  );
}

/**
 * "By the numbers" section: headline metrics rendered as a responsive grid of
 * counter tiles that animate up when scrolled into view.
 */
export function StatisticsSection() {
  return (
    <LandingSection id="stats" aria-labelledby="stats-heading" className="bg-surface">
      <SectionHeading
        eyebrow="By the numbers"
        title="Trusted at scale"
        description="Teams of every size rely on TalentFlow to move candidates forward, faster."
        titleId="stats-heading"
      />

      <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {STATS.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 0.06}>
            <StatTile stat={stat} />
          </Reveal>
        ))}
      </div>
    </LandingSection>
  );
}
