import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { BackgroundEffects } from '@/features/landing/components/BackgroundEffects';
import { HeroPreview } from '@/features/landing/components/HeroPreview';
import { EASE_EMPHASIZED, fadeInUp, staggerContainer } from '@/features/landing/lib/animations';

/**
 * Landing hero: an original value proposition with primary/secondary CTAs and
 * an interactive product preview. Entrance is staggered on load and disabled
 * under reduced-motion.
 */
export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="top" className="relative overflow-hidden">
      <BackgroundEffects />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <motion.div
          variants={staggerContainer}
          initial={prefersReducedMotion ? false : 'hidden'}
          animate={prefersReducedMotion ? undefined : 'visible'}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.span
            variants={prefersReducedMotion ? undefined : fadeInUp}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground-secondary"
          >
            <Sparkles className="size-3.5 text-primary" />
            AI candidate matching, now in every workspace
          </motion.span>

          <motion.h1
            variants={prefersReducedMotion ? undefined : fadeInUp}
            className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl"
          >
            Hiring that keeps pace with your team.
          </motion.h1>

          <motion.p
            variants={prefersReducedMotion ? undefined : fadeInUp}
            className="mx-auto mt-5 max-w-xl text-base text-foreground-secondary sm:text-lg"
          >
            TalentFlow unifies job posting, applicant tracking, and hiring decisions in one fast
            workspace — so recruiters move quickly and candidates always know where they stand.
          </motion.p>

          <motion.div
            variants={prefersReducedMotion ? undefined : fadeInUp}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to={ROUTES.REGISTER}>
                Get started free
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <a href="#how-it-works">See how it works</a>
            </Button>
          </motion.div>

          <motion.p
            variants={prefersReducedMotion ? undefined : fadeInUp}
            className="mt-4 text-caption"
          >
            Free to explore · No credit card required
          </motion.p>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_EMPHASIZED, delay: 0.25 }}
          className="mx-auto mt-16 w-full max-w-4xl"
        >
          <HeroPreview />
        </motion.div>
      </div>
    </section>
  );
}
