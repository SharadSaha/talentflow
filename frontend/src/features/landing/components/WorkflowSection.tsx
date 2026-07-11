import { motion, useReducedMotion } from 'framer-motion';

import { LandingSection } from '@/features/landing/components/LandingSection';
import { Reveal } from '@/features/landing/components/Reveal';
import { SectionHeading } from '@/features/landing/components/SectionHeading';
import { WORKFLOW_STEPS } from '@/features/landing/data/workflow';
import { EASE_EMPHASIZED, VIEWPORT_ONCE } from '@/features/landing/lib/animations';

/**
 * "How it works" section: the end-to-end hiring journey rendered as an ordered
 * list of connected step cards. Steps flow horizontally on large screens and
 * stack with a vertical connector on mobile. Connectors animate subtly into
 * view and are disabled under reduced motion.
 */
export function WorkflowSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <LandingSection id="how-it-works" aria-labelledby="how-it-works-heading">
      <SectionHeading
        eyebrow="How it works"
        title="From first application to first day"
        description="Every stage of hiring lives in one connected flow — so nothing slips between the cracks."
        titleId="how-it-works-heading"
      />

      <ol className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {WORKFLOW_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === WORKFLOW_STEPS.length - 1;

          return (
            <Reveal as="li" key={step.title} delay={index * 0.06} className="relative">
              {!isLast ? (
                <>
                  {/* Horizontal connector (large screens). */}
                  <motion.div
                    aria-hidden
                    className="absolute left-14 top-10 -right-4 hidden origin-left border-t border-dashed border-border lg:block"
                    initial={prefersReducedMotion ? false : { scaleX: 0 }}
                    whileInView={prefersReducedMotion ? undefined : { scaleX: 1 }}
                    viewport={VIEWPORT_ONCE}
                    transition={{
                      duration: 0.5,
                      ease: EASE_EMPHASIZED,
                      delay: index * 0.06 + 0.15,
                    }}
                  />
                  {/* Vertical connector (mobile stack). */}
                  <span
                    aria-hidden
                    className="absolute bottom-[-1rem] left-9 top-14 border-l border-dashed border-border md:hidden"
                  />
                </>
              ) : null}

              <div className="h-full rounded-lg border border-border bg-card p-5 transition-[transform,border-color] duration-200 ease-emphasized hover:-translate-y-1 hover:border-border">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <p className="mt-4 text-caption">Step {index + 1}</p>
                <h3 className="mt-1 text-sm font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1 text-small text-foreground-muted">{step.description}</p>
              </div>
            </Reveal>
          );
        })}
      </ol>
    </LandingSection>
  );
}
