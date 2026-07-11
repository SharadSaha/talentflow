import { Component, type ErrorInfo, type ReactNode } from 'react';

import { ErrorFallback } from '@/components/errors/ErrorFallback';
import { logger } from '@/lib/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback renderer; falls back to the default `ErrorFallback`. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Top-level React error boundary. Catches render-time exceptions anywhere in the
 * tree, logs them through the centralised logger, and shows a recoverable
 * fallback UI instead of a blank screen. Route-level errors are handled
 * separately by `RouteErrorBoundary`.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('Unhandled render error', error, errorInfo.componentStack);
  }

  private readonly reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (error) {
      return fallback ? fallback(error, this.reset) : <ErrorFallback onReset={this.reset} />;
    }

    return children;
  }
}
