import { Plus, X } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface LocationTagInputProps {
  value: string[];
  onChange: (locations: string[]) => void;
  /** Id used to associate the text input with an external label. */
  inputId?: string;
  placeholder?: string;
}

const MAX_LOCATIONS = 10;

/**
 * A lightweight tag input for free-form preferred locations. Entries are added
 * with Enter or the add button and removed via their chip. Duplicates and blank
 * values are ignored; the list is capped to keep the control compact.
 */
export function LocationTagInput({
  value,
  onChange,
  inputId,
  placeholder = 'e.g. Remote, Berlin',
}: LocationTagInputProps) {
  const [draft, setDraft] = useState('');

  const addLocation = () => {
    const next = draft.trim();
    if (!next) return;

    const exists = value.some((location) => location.toLowerCase() === next.toLowerCase());
    if (exists || value.length >= MAX_LOCATIONS) {
      setDraft('');
      return;
    }

    onChange([...value, next]);
    setDraft('');
  };

  const removeLocation = (location: string) => {
    onChange(value.filter((current) => current !== location));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          id={inputId}
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addLocation();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={addLocation}
          disabled={draft.trim().length === 0 || value.length >= MAX_LOCATIONS}
        >
          <Plus aria-hidden="true" />
          Add
        </Button>
      </div>

      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Preferred locations">
          {value.map((location) => (
            <li key={location}>
              <Badge variant="neutral" className="gap-1 pr-1">
                <span className="truncate">{location}</span>
                <button
                  type="button"
                  aria-label={`Remove ${location}`}
                  onClick={() => removeLocation(location)}
                  className="rounded-sm outline-none transition-colors hover:text-danger focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-caption text-foreground-muted">No preferred locations added yet.</p>
      )}
    </div>
  );
}
