import type { Transition, Variants } from 'framer-motion';

/**
 * Shared motion primitives for the landing page. Centralised so every section
 * animates with the same rhythm and easing as the design system (the
 * `cubic-bezier(0.16, 1, 0.3, 1)` emphasised curve, 120–250ms range).
 */

/** The design system's emphasised easing curve. */
export const EASE_EMPHASIZED = [0.16, 1, 0.3, 1] as const;

export const REVEAL_TRANSITION: Transition = {
  duration: 0.5,
  ease: EASE_EMPHASIZED,
};

export const SPRING: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 24,
};

/** Fade + rise used for revealing individual elements. */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: REVEAL_TRANSITION },
};

/** Container that staggers the entrance of its children. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

/** Standard viewport trigger: animate once, slightly before fully in view. */
export const VIEWPORT_ONCE = { once: true, margin: '-80px' } as const;
