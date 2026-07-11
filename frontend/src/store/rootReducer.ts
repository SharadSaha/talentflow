import { combineReducers } from '@reduxjs/toolkit';

import { authReducer } from '@/reducers/authSlice';
import { uiReducer } from '@/reducers/uiSlice';
import { baseApi } from '@/services/api/baseApi';

/**
 * The root reducer. Global client slices live alongside the single RTK Query
 * API reducer. New global slices are added here; server state stays in RTK
 * Query rather than becoming a slice.
 */
export const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});
