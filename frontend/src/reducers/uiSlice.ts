import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { STORAGE_KEYS } from '@/constants/storage-keys';
import { localStorageService } from '@/services/storage/local-storage.service';
import type { RootState } from '@/store/types';

/**
 * Global UI state shared across the app shell — currently the sidebar collapse
 * state, which multiple layout components read and toggle. Transient,
 * component-local UI state stays in React (`useState`) and is not stored here.
 */
export interface UiState {
  sidebarCollapsed: boolean;
}

function readInitialSidebarState(): boolean {
  return localStorageService.get(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true';
}

const initialState: UiState = {
  sidebarCollapsed: readInitialSidebarState(),
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
  },
});

export const { setSidebarCollapsed, toggleSidebar } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;

export const selectSidebarCollapsed = (state: RootState): boolean => state.ui.sidebarCollapsed;
