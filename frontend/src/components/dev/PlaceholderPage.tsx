import { Construction } from 'lucide-react';

import { EmptyState } from '@/components/ui/empty-state';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

/**
 * Temporary scaffold for route slots whose feature pages are not yet
 * implemented. It keeps the routing tree navigable during foundation work and
 * is replaced by real feature pages as modules are built.
 */
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <EmptyState
      icon={Construction}
      title={title}
      description={description ?? 'This module is part of an upcoming feature phase.'}
    />
  );
}
