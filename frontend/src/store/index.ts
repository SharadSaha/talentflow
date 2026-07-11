import { configureStore } from '@reduxjs/toolkit';

import { baseApi } from '@/services/api/baseApi';
import { listenerMiddleware } from '@/store/listeners';
import { rootReducer } from '@/store/rootReducer';
import type { RootState } from '@/store/types';

/**
 * Builds a fully configured store. Exposed as a factory so tests can create
 * isolated store instances with preloaded state, while the app uses the single
 * `store` instance below.
 */
export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(listenerMiddleware.middleware).concat(baseApi.middleware),
  });
}

export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];

export type { RootState } from '@/store/types';
