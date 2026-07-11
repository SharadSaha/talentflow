import { useEffect } from 'react';

/**
 * Warns the user before they unload the page (refresh, close, or navigate away
 * via the browser) while a form has unsaved changes. The native `beforeunload`
 * prompt is shown only while `isDirty` is true; the listener is registered and
 * cleaned up automatically as the flag changes.
 */
export function useUnsavedChangesWarning(isDirty: boolean): void {
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
      event.preventDefault();
      // Some browsers require `returnValue` to be set to trigger the prompt.
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);
}
