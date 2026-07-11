import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from '@/store';

/**
 * Typed Redux hooks. Components must use these instead of the untyped
 * `useDispatch` / `useSelector` so dispatch and state are fully inferred.
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
