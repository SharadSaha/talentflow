import { LandingSection } from '@/features/landing/components/LandingSection';
import { Reveal } from '@/features/landing/components/Reveal';
import { SectionHeading } from '@/features/landing/components/SectionHeading';
import { FEATURES } from '@/features/landing/data/features';

/**
 * Premium feature grid: a staggered set of bordered cards, each pairing a
 * primary-tinted icon tile with a concise title and description.
 */
export function FeaturesSection() {
  return (
    <LandingSection id="features" aria-labelledby="features-heading">
      <SectionHeading
        eyebrow="Features"
        title="Everything hiring needs, nothing it doesn't"
        description="A focused toolkit that moves candidates from applied to hired without the busywork."
        titleId="features-heading"
      />

      <ul className="mt-12 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }, index) => (
          <Reveal key={title} as="li" delay={index * 0.06}>
            <article className="h-full rounded-lg border border-border bg-card p-5 transition-[transform,border-color] duration-200 ease-emphasized hover:-translate-y-1 hover:border-primary/40">
              <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-1.5 text-small leading-relaxed text-foreground-secondary">
                {description}
              </p>
            </article>
          </Reveal>
        ))}
      </ul>
    </LandingSection>
  );
}
