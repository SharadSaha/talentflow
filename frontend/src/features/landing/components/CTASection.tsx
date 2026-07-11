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
            Whichever side you&apos;re on, start here
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-foreground-secondary">
            Candidates find and track roles for free. Employers manage the whole pipeline in one
            fast workspace. Choose your path to get started.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to={ROUTES.AUTH.CANDIDATE_REGISTER}>I&apos;m looking for a job</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link to={ROUTES.AUTH.HR_LOGIN}>I&apos;m hiring</Link>
            </Button>
          </div>

          <p className="mt-4 text-caption">Free for candidates · Employer accounts by invitation</p>
        </Reveal>
      </div>
    </LandingSection>
  );
}
