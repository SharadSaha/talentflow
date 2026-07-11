import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';

import { clearCredentials, setCredentials } from '@/reducers/authSlice';
import { setSidebarCollapsed, toggleSidebar } from '@/reducers/uiSlice';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import { localStorageService } from '@/services/storage/local-storage.service';
import { tokenService } from '@/services/auth/token.service';
import type { RootState } from '@/store/types';

/**
 * Side-effect middleware that keeps persistent storage in sync with global
 * state, so reducers stay pure. Persistence lives here rather than inside
 * slices or components.
 */
export const listenerMiddleware = createListenerMiddleware();

// Persist / clear the access token as the auth session changes.
listenerMiddleware.startListening({
  actionCreator: setCredentials,
  effect: (action) => {
    tokenService.set(action.payload.token);
  },
});

listenerMiddleware.startListening({
  actionCreator: clearCredentials,
  effect: () => {
    tokenService.clear();
  },
});

// Persist the sidebar collapse preference across sessions.
listenerMiddleware.startListening({
  matcher: isAnyOf(setSidebarCollapsed, toggleSidebar),
  effect: (_action, api) => {
    const { sidebarCollapsed } = (api.getState() as RootState).ui;
    localStorageService.set(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(sidebarCollapsed));
  },
});
