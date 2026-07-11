import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { useModuleSearch } from '@/hooks/useModuleSearch';
import { cn } from '@/lib/utils';

interface GlobalSearchProps {
  className?: string;
}

/**
 * The top-bar quick search. Input is debounced and routed into the current
 * module's list via `useModuleSearch` (reusing the existing URL `keyword`
 * filter), so results and pagination come from the feature APIs already in
 * place. Purely presentational glue — no business logic.
 */
export function GlobalSearch({ className }: GlobalSearchProps) {
  const { placeholder, search } = useModuleSearch();
  const [value, setValue] = useState('');
  const debounced = useDebounce(value, 350);
  const lastSubmitted = useRef<string | null>(null);

  useEffect(() => {
    const query = debounced.trim();
    if (query && query !== lastSubmitted.current) {
      lastSubmitted.current = query;
      search(query);
    }
  }, [debounced, search]);

  return (
    <Input
      type="search"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      startIcon={<Search />}
      className={cn(className)}
    />
  );
}
