import { describe, expect, it } from 'vitest';

import {
  selectSidebarCollapsed,
  setSidebarCollapsed,
  toggleSidebar,
  uiReducer,
  type UiState,
} from '@/reducers/uiSlice';
import type { RootState } from '@/store';

describe('uiSlice reducer', () => {
  it('sets the sidebar collapsed state explicitly', () => {
    const state = uiReducer({ sidebarCollapsed: false }, setSidebarCollapsed(true));
    expect(state.sidebarCollapsed).toBe(true);
  });

  it('toggles the sidebar from expanded to collapsed', () => {
    const state = uiReducer({ sidebarCollapsed: false }, toggleSidebar());
    expect(state.sidebarCollapsed).toBe(true);
  });

  it('toggles the sidebar from collapsed to expanded', () => {
    const state = uiReducer({ sidebarCollapsed: true }, toggleSidebar());
    expect(state.sidebarCollapsed).toBe(false);
  });
});

describe('selectSidebarCollapsed', () => {
  function buildState(ui: UiState): RootState {
    return { ui } as RootState;
  }

  it('reads the sidebar collapse flag from the store', () => {
    expect(selectSidebarCollapsed(buildState({ sidebarCollapsed: true }))).toBe(true);
    expect(selectSidebarCollapsed(buildState({ sidebarCollapsed: false }))).toBe(false);
  });
});
