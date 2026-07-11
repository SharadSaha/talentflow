import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';

import { clearCredentials, sessionExpired } from '@/reducers/authSlice';
import { setSidebarCollapsed, toggleSidebar } from '@/reducers/uiSlice';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import { toast } from '@/components/ui/sonner';
import { localStorageService } from '@/services/storage/local-storage.service';
import { tokenService } from '@/services/auth/token.service';
import type { RootState } from '@/store/types';

/**
 * Side-effect middleware that keeps persistent storage in sync with global
 * state and surfaces session-lifecycle feedback, so reducers stay pure. Token
 * writes on login happen in the auth hooks (which know the "remember me"
 * choice); here we only guarantee cleanup and messaging on sign-out.
 */
export const listenerMiddleware = createListenerMiddleware();

// Safety net: always clear any persisted token when the session ends.
listenerMiddleware.startListening({
  matcher: isAnyOf(clearCredentials, sessionExpired),
  effect: () => {
    tokenService.clear();
  },
});

// Notify the user only when the server invalidated an *active* session, so a
// failed bootstrap (invalid token on load) does not produce a spurious toast.
listenerMiddleware.startListening({
  actionCreator: sessionExpired,
  effect: (_action, api) => {
    const previousStatus = (api.getOriginalState() as RootState).auth.status;
    if (previousStatus === 'authenticated') {
      toast.error('Your session has expired. Please sign in again.');
    }
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
