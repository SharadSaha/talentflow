import type { ElementType, ReactNode } from 'react';
import { type HTMLMotionProps, motion, useReducedMotion } from 'framer-motion';

import { REVEAL_TRANSITION, VIEWPORT_ONCE } from '@/features/landing/lib/animations';

/**
 * Stable, module-level motion components for the supported semantic tags. Using
 * these (rather than creating a motion component during render) keeps element
 * identity stable and satisfies the static-components rule.
 */
const MOTION_TAGS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  ul: motion.ul,
  ol: motion.ol,
  li: motion.li,
  span: motion.span,
  p: motion.p,
  figure: motion.figure,
  h2: motion.h2,
  h3: motion.h3,
} satisfies Record<string, ElementType>;

type RevealTag = keyof typeof MOTION_TAGS;

interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  /** Semantic element to render (e.g. 'section', 'li'). Defaults to 'div'. */
  as?: RevealTag;
  /** Stagger delay in seconds. */
  delay?: number;
  /** Vertical travel distance in pixels. */
  y?: number;
}

/**
 * Reveals its children with a fade-and-rise as they scroll into view. Honours
 * `prefers-reduced-motion` by rendering statically. The shared building block
 * for every landing section's entrance animation.
 */
export function Reveal({ children, as = 'div', delay = 0, y = 16, ...props }: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const MotionComponent: ElementType = MOTION_TAGS[as];

  if (prefersReducedMotion) {
    return <MotionComponent {...props}>{children}</MotionComponent>;
  }

  return (
    <MotionComponent
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT_ONCE}
      transition={{ ...REVEAL_TRANSITION, delay }}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}
