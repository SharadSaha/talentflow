import { Star } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Reveal } from '@/features/landing/components/Reveal';
import { SectionHeading } from '@/features/landing/components/SectionHeading';
import { LandingSection } from '@/features/landing/components/LandingSection';
import { TESTIMONIALS } from '@/features/landing/data/testimonials';
import { getInitials } from '@/utils/format';

const RATING_STARS = Array.from({ length: 5 });

/**
 * Social-proof section: a three-column grid of customer testimonials, each a
 * semantic figure/blockquote card with a star rating and author attribution.
 */
export function TestimonialsSection() {
  return (
    <LandingSection id="testimonials" aria-labelledby="testimonials-heading">
      <SectionHeading
        eyebrow="Testimonials"
        title="Loved by hiring teams"
        description="Talent leaders rely on TalentFlow to move faster and give every candidate a clearer experience."
        titleId="testimonials-heading"
      />

      <ul className="mt-12 grid list-none grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 sm:mt-14">
        {TESTIMONIALS.map((testimonial, index) => (
          <Reveal key={testimonial.name} as="li" delay={index * 0.06} className="h-full">
            <figure className="flex h-full flex-col gap-4 rounded-lg border border-border bg-card p-6 transition-[transform,border-color] duration-200 ease-emphasized hover:-translate-y-1 hover:border-border">
              <div className="flex items-center gap-1" aria-hidden="true">
                {RATING_STARS.map((_, starIndex) => (
                  <Star key={starIndex} className="size-4 fill-current text-warning" />
                ))}
              </div>

              <blockquote className="text-body leading-relaxed text-foreground-secondary">
                “{testimonial.quote}”
              </blockquote>

              <figcaption className="mt-auto flex items-center gap-3">
                <Avatar size="sm">
                  <AvatarFallback>{getInitials(testimonial.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{testimonial.name}</p>
                  <p className="text-caption text-foreground-muted">
                    {testimonial.role} · {testimonial.company}
                  </p>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </ul>
    </LandingSection>
  );
}
