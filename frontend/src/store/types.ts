import type { rootReducer } from '@/store/rootReducer';

/**
 * Store-derived types kept in a dedicated module so slices can import
 * `RootState` for their selectors without creating a circular runtime import
 * with `store/index.ts`.
 */
export type RootState = ReturnType<typeof rootReducer>;
