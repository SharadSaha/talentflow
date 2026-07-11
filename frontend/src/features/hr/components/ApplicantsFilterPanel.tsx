import { EDUCATION_LEVEL_OPTIONS } from '@/constants/education';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  ApplicantFilterKey,
  ApplicantFilterValues,
} from '@/features/hr/hooks/useApplicantFilters';

/** Sentinel value for the "Any" education option (Radix disallows empty item values). */
const ANY_EDUCATION_VALUE = 'ANY';

export interface ApplicantsFilterPanelProps {
  /** Current filter values as strings. */
  filters: ApplicantFilterValues;
  /** Updates a single filter field. */
  onFilterChange: (key: ApplicantFilterKey, value: string) => void;
}

/**
 * The advanced-filter form for the applicant board: location, current company,
 * highest education, skills, and an experience range (in months). Presentational
 * only — reads current values and reports changes up to the owning page.
 */
export function ApplicantsFilterPanel({ filters, onFilterChange }: ApplicantsFilterPanelProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="filter-current-location">Current location</Label>
        <Input
          id="filter-current-location"
          value={filters.currentLocation}
          onChange={(event) => onFilterChange('currentLocation', event.target.value)}
          placeholder="e.g. Bengaluru"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="filter-current-company">Current company</Label>
        <Input
          id="filter-current-company"
          value={filters.currentCompany}
          onChange={(event) => onFilterChange('currentCompany', event.target.value)}
          placeholder="e.g. Acme Inc."
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="filter-highest-education">Highest education</Label>
        <Select
          value={filters.highestEducation || ANY_EDUCATION_VALUE}
          onValueChange={(value) =>
            onFilterChange('highestEducation', value === ANY_EDUCATION_VALUE ? '' : value)
          }
        >
          <SelectTrigger id="filter-highest-education" aria-label="Highest education">
            <SelectValue placeholder="Any education" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_EDUCATION_VALUE}>Any education</SelectItem>
            {EDUCATION_LEVEL_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="filter-skills">Skills</Label>
        <Input
          id="filter-skills"
          value={filters.skills}
          onChange={(event) => onFilterChange('skills', event.target.value)}
          placeholder="Comma-separated, e.g. react, typescript"
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-foreground">Experience (months)</legend>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-min-experience">Minimum</Label>
            <Input
              id="filter-min-experience"
              type="number"
              min={0}
              inputMode="numeric"
              value={filters.minExperienceMonths}
              onChange={(event) => onFilterChange('minExperienceMonths', event.target.value)}
              placeholder="0"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-max-experience">Maximum</Label>
            <Input
              id="filter-max-experience"
              type="number"
              min={0}
              inputMode="numeric"
              value={filters.maxExperienceMonths}
              onChange={(event) => onFilterChange('maxExperienceMonths', event.target.value)}
              placeholder="Any"
            />
          </div>
        </div>
      </fieldset>
    </div>
  );
}
