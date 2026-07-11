import { Reveal } from '@/features/landing/components/Reveal';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'center' | 'left';
  /** id applied to the heading, for `aria-labelledby` on the section. */
  titleId?: string;
  className?: string;
}

/**
 * Shared section heading (eyebrow + title + description) with a scroll-reveal
 * entrance. Keeps typography and spacing identical across every landing
 * section.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  titleId,
  className,
}: SectionHeadingProps) {
  return (
    <Reveal className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow ? (
        <p className="text-small font-medium uppercase tracking-wider text-primary">{eyebrow}</p>
      ) : null}
      <h2
        id={titleId}
        className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-base text-foreground-secondary sm:text-lg">{description}</p>
      ) : null}
    </Reveal>
  );
}
