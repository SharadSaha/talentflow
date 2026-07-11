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
import {
  EMPLOYMENT_TYPE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  WORK_MODE_OPTIONS,
} from '@/constants/job';
import { cn } from '@/lib/utils';
import type { SelectOption } from '@/utils/options';

import type { JobFilterKey, JobFilterValues } from '../hooks/useJobFilters';

/** Sentinel value for the "Any" option, since Radix Select forbids an empty item value. */
const ANY_VALUE = '__any__';

interface JobFilterPanelProps {
  filters: JobFilterValues;
  activeFilterCount: number;
  onFilterChange: (key: JobFilterKey, value: string) => void;
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
 * The set of browse-jobs filter controls. Rendered inline as a sidebar on large
 * screens and inside a `Sheet` on smaller ones; it is presentational and reports
 * every change back through `onFilterChange`.
 */
export function JobFilterPanel({
  filters,
  activeFilterCount,
  onFilterChange,
  onClear,
  className,
}: JobFilterPanelProps) {
  const uid = useId();
  const fieldId = (key: JobFilterKey) => `${uid}-${key}`;

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

      <FilterSelect
        id={fieldId('workMode')}
        label="Work mode"
        value={filters.workMode}
        options={WORK_MODE_OPTIONS}
        onChange={(value) => onFilterChange('workMode', value)}
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

      <FilterField id={fieldId('company')} label="Company">
        <Input
          id={fieldId('company')}
          value={filters.company}
          onChange={(event) => onFilterChange('company', event.target.value)}
          placeholder="e.g. Acme Inc"
        />
      </FilterField>

      <FilterField id={fieldId('skills')} label="Skills">
        <Input
          id={fieldId('skills')}
          value={filters.skills}
          onChange={(event) => onFilterChange('skills', event.target.value)}
          placeholder="e.g. React, TypeScript"
        />
        <p className="text-caption text-foreground-muted">Separate multiple skills with commas.</p>
      </FilterField>
    </div>
  );
}
