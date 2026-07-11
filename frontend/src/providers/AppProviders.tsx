import type { ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';

import { AuthBootstrap } from '@/providers/AuthBootstrap';
import { ThemeProvider } from '@/providers/theme/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { store } from '@/store';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Composes every global provider in one place, in the correct order:
 * Redux (store) → Theme → Tooltip, with session bootstrap and the toast
 * outlet mounted inside. New app-wide providers are added here so the
 * composition stays centralised and extensible.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider>
        <TooltipProvider delayDuration={200}>
          <AuthBootstrap>{children}</AuthBootstrap>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
}
