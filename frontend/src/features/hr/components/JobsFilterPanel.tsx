import { useId } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EMPLOYMENT_TYPE_OPTIONS, EXPERIENCE_LEVEL_OPTIONS } from '@/constants/job';
import { cn } from '@/lib/utils';
import type { SelectOption } from '@/utils/options';

import type { HrJobFilterKey, HrJobFilterValues } from '../hooks/useHrJobsFilters';

/** Sentinel value for the "Any" option, since Radix Select forbids an empty item value. */
const ANY_VALUE = '__any__';

interface JobsFilterPanelProps {
  filters: HrJobFilterValues;
  activeFilterCount: number;
  onFilterChange: (key: HrJobFilterKey, value: string) => void;
  onClear: () => void;
  className?: string;
}

interface FilterFieldProps {
  id: string;
  label: string;
  children: React.ReactNode;
}

/** A labelled filter row wiring the label to its control. */
function FilterField({ id, label, children }: FilterFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

interface FilterSelectProps {
  id: string;
  label: string;
  value: string;
  options: SelectOption<string>[];
  onChange: (value: string) => void;
}

/** An enum-backed filter select with an "Any" option that clears the value. */
function FilterSelect({ id, label, value, options, onChange }: FilterSelectProps) {
  return (
    <FilterField id={id} label={label}>
      <Select
        value={value || undefined}
        onValueChange={(next) => onChange(next === ANY_VALUE ? '' : next)}
      >
        <SelectTrigger id={id} aria-label={label}>
          <SelectValue placeholder="Any" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY_VALUE}>Any</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterField>
  );
}

/**
 * The HR jobs filter controls (location, employment type, experience level, and
 * salary range). Presentational: it reports every change back through
 * `onFilterChange` and is rendered inside a `Sheet` drawer.
 */
export function JobsFilterPanel({
  filters,
  activeFilterCount,
  onFilterChange,
  onClear,
  className,
}: JobsFilterPanelProps) {
  const uid = useId();
  const fieldId = (key: HrJobFilterKey) => `${uid}-${key}`;

  return (
    <div className={cn('space-y-5', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-small font-semibold text-foreground">Filters</h2>
        {activeFilterCount > 0 ? (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear all
          </Button>
        ) : null}
      </div>

      <FilterField id={fieldId('location')} label="Location">
        <Input
          id={fieldId('location')}
          value={filters.location}
          onChange={(event) => onFilterChange('location', event.target.value)}
          placeholder="e.g. Berlin"
        />
      </FilterField>

      <FilterSelect
        id={fieldId('employmentType')}
        label="Employment type"
        value={filters.employmentType}
        options={EMPLOYMENT_TYPE_OPTIONS}
        onChange={(value) => onFilterChange('employmentType', value)}
      />

      <FilterSelect
        id={fieldId('experienceLevel')}
        label="Experience level"
        value={filters.experienceLevel}
        options={EXPERIENCE_LEVEL_OPTIONS}
        onChange={(value) => onFilterChange('experienceLevel', value)}
      />

      <div className="grid grid-cols-2 gap-3">
        <FilterField id={fieldId('salaryMin')} label="Salary min">
          <Input
            id={fieldId('salaryMin')}
            type="number"
            inputMode="numeric"
            min={0}
            value={filters.salaryMin}
            onChange={(event) => onFilterChange('salaryMin', event.target.value)}
            placeholder="0"
          />
        </FilterField>
        <FilterField id={fieldId('salaryMax')} label="Salary max">
          <Input
            id={fieldId('salaryMax')}
            type="number"
            inputMode="numeric"
            min={0}
            value={filters.salaryMax}
            onChange={(event) => onFilterChange('salaryMax', event.target.value)}
            placeholder="Any"
          />
        </FilterField>
      </div>
    </div>
  );
}
