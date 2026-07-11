import { Reveal } from '@/features/landing/components/Reveal';
import { COMPANIES } from '@/features/landing/data/companies';

/**
 * A slim, monochrome "trusted by" band. Renders fictional company wordmarks as
 * a responsive grid of muted logomarks that lift to full contrast on hover.
 */
export function TrustedBySection() {
  return (
    <section className="py-10 sm:py-12">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="text-center text-small text-foreground-muted">
            Trusted by teams at fast-growing companies
          </p>

          <ul className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {COMPANIES.map(({ name, icon: Icon }) => (
              <li
                key={name}
                className="flex items-center justify-center gap-2 text-foreground-muted opacity-70 transition-opacity hover:text-foreground hover:opacity-100"
              >
                <Icon className="size-5" aria-hidden />
                <span className="font-semibold tracking-tight">{name}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
