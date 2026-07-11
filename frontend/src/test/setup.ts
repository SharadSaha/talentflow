import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

// jsdom does not implement `matchMedia` or `ResizeObserver`; provide minimal
// stubs so theme/responsive hooks and Radix primitives work under test.
beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }

  if (!window.ResizeObserver) {
    window.ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    };
  }

  // jsdom lacks IntersectionObserver, which Framer Motion's scroll-reveal
  // (`useInView`) relies on. Stub it so landing-page components render in tests.
  if (!window.IntersectionObserver) {
    class MockIntersectionObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = '';
      readonly thresholds = [];
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
    }
    window.IntersectionObserver = MockIntersectionObserver;
  }
});

// Ensure the DOM is reset between tests.
afterEach(() => {
  cleanup();
});
