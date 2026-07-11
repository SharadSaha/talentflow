import { X } from 'lucide-react';
import { useId } from 'react';
import { type FieldPathByValue, useController, useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Switch } from '@/components/ui/switch';
import { getSkillName, SKILL_OPTIONS } from '@/constants/skills';
import type { JobFormValues } from '@/features/hr/schemas/job.schema';
import type { JobSkillInput } from '@/features/hr/types/hr-job.types';

/** The form field names whose value is a `{ slug, isRequired }[]` array. */
type SkillsFieldName = FieldPathByValue<JobFormValues, JobSkillInput[]>;

export interface SkillsFieldProps {
  /** The RHF field name holding the job's skills array. */
  name: SkillsFieldName;
}

/**
 * Edits a job's required/optional skills. A searchable multi-select adds and
 * removes skills by slug; each selected skill is listed with a toggle marking it
 * as required and a control to remove it. Bound to React Hook Form via the form
 * context, keeping the `{ slug, isRequired }[]` value shape intact.
 */
export function SkillsField({ name }: SkillsFieldProps) {
  const { control } = useFormContext<JobFormValues>();
  const { field } = useController<JobFormValues, SkillsFieldName>({ name, control });
  const groupId = useId();

  const skills = field.value;

  const handleSelectionChange = (slugs: string[]): void => {
    const next: JobSkillInput[] = slugs.map(
      (slug) => skills.find((skill) => skill.slug === slug) ?? { slug, isRequired: false },
    );
    field.onChange(next);
  };

  const setRequired = (slug: string, isRequired: boolean): void => {
    field.onChange(skills.map((skill) => (skill.slug === slug ? { ...skill, isRequired } : skill)));
  };

  const removeSkill = (slug: string): void => {
    field.onChange(skills.filter((skill) => skill.slug !== slug));
  };

  return (
    <div className="space-y-3">
      <Label htmlFor={groupId}>Skills</Label>
      <MultiSelect
        options={SKILL_OPTIONS}
        value={skills.map((skill) => skill.slug)}
        onValueChange={handleSelectionChange}
        placeholder="Add skills…"
        searchPlaceholder="Search skills…"
        emptyText="No matching skills."
      />

      {skills.length === 0 ? (
        <p className="text-caption text-foreground-muted">
          No skills added yet. Select skills above to define what this role needs.
        </p>
      ) : (
        <ul className="divide-y divide-border-subtle rounded-md border border-border">
          {skills.map((skill) => {
            const switchId = `${groupId}-${skill.slug}-required`;
            const skillName = getSkillName(skill.slug);
            return (
              <li key={skill.slug} className="flex items-center gap-3 px-3 py-2">
                <span className="flex-1 text-small font-medium text-foreground">{skillName}</span>
                <div className="flex items-center gap-2">
                  <Label htmlFor={switchId} className="text-caption text-foreground-secondary">
                    Required
                  </Label>
                  <Switch
                    id={switchId}
                    checked={skill.isRequired}
                    onCheckedChange={(checked) => setRequired(skill.slug, checked)}
                    aria-label={`Mark ${skillName} as required`}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label={`Remove ${skillName}`}
                  onClick={() => removeSkill(skill.slug)}
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
