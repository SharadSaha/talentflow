import { ArrowLeft } from 'lucide-react';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  /** Route to fall back to when there is no in-app history to return to. */
  fallback: string;
  label?: string;
  className?: string;
}

/**
 * A consistent back-navigation control for forms and detail pages. Returns to
 * the previous page when in-app history exists (React Router's `location.key`
 * is only `'default'` on a fresh entry, e.g. a deep link or refresh), otherwise
 * navigates to a sensible fallback route.
 */
export function BackButton({ fallback, label = 'Back', className }: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = useCallback(() => {
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  }, [navigate, location.key, fallback]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={goBack}
      className={cn('-ml-2 gap-1.5 text-foreground-muted hover:text-foreground', className)}
    >
      <ArrowLeft />
      {label}
    </Button>
  );
}
