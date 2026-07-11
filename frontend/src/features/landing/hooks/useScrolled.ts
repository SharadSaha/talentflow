import { useEffect, useState } from 'react';

/**
 * Tracks whether the page has scrolled past a threshold. Used to switch the
 * landing navigation from transparent to a blurred, bordered bar. Passive
 * listener; reads once on mount to handle refreshes mid-page.
 */
export function useScrolled(threshold = 8): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = (): void => setScrolled(window.scrollY > threshold);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return scrolled;
}
