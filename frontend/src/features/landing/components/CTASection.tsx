import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { LandingSection } from '@/features/landing/components/LandingSection';
import { Reveal } from '@/features/landing/components/Reveal';

/**
 * Final call to action: a bordered, softly lit panel that invites visitors to
 * create an account, with a secondary path to log in.
 */
export function CTASection() {
  return (
    <LandingSection id="get-started" aria-labelledby="cta-heading">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-elevated px-6 py-14 text-center sm:px-12">
        <div
          className="bg-grid pointer-events-none absolute inset-0 opacity-[0.4] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-1/2 top-0 size-72 -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />

        <Reveal className="relative">
          <h2
            id="cta-heading"
            className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
          >
            Start hiring with TalentFlow today
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-foreground-secondary">
            Bring job posting, applicant tracking, and hiring decisions into one fast workspace. Set
            up in minutes — no migration headaches.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to={ROUTES.REGISTER}>Get started free</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link to={ROUTES.LOGIN}>Log in</Link>
            </Button>
          </div>

          <p className="mt-4 text-caption">Free to explore · No credit card required</p>
        </Reveal>
      </div>
    </LandingSection>
  );
}
