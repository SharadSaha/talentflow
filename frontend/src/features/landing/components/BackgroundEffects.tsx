import { cn } from '@/lib/utils';

interface BackgroundEffectsProps {
  className?: string;
}

/**
 * Decorative, non-interactive backdrop for the hero: a token-driven grid that
 * fades out via a radial mask, plus a soft primary glow. Purely presentational
 * and hidden from assistive tech.
 */
export function BackgroundEffects({ className }: BackgroundEffectsProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      <div className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_60%_55%_at_50%_0%,black,transparent)]" />
      <div className="absolute left-1/2 top-[-12%] h-[480px] w-[min(820px,90vw)] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
    </div>
  );
}
