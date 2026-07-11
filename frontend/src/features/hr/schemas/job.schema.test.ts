import { describe, expect, it } from 'vitest';

import {
  EMPTY_JOB_FORM_VALUES,
  jobSchema,
  jobToFormValues,
  toCreateJobRequest,
  toUpdateJobRequest,
} from '@/features/hr/schemas/job.schema';
import { makeJob } from '@/test/fixtures';

const validValues = {
  ...EMPTY_JOB_FORM_VALUES,
  title: 'Senior Engineer',
  description: 'Build things.',
  location: 'Berlin',
};

describe('jobSchema', () => {
  it('accepts a minimal valid job form', () => {
    expect(jobSchema.safeParse(validValues).success).toBe(true);
  });

  it('rejects a job with a blank title', () => {
    const result = jobSchema.safeParse({ ...validValues, title: '   ' });
    expect(result.success).toBe(false);
  });

  it('rejects a job with a blank description', () => {
    expect(jobSchema.safeParse({ ...validValues, description: '' }).success).toBe(false);
  });

  it('requires at least one opening', () => {
    expect(jobSchema.safeParse({ ...validValues, openings: 0 }).success).toBe(false);
  });

  it('rejects a non-integer number of openings', () => {
    expect(jobSchema.safeParse({ ...validValues, openings: 1.5 }).success).toBe(false);
  });

  it('rejects a minimum experience greater than the maximum', () => {
    const result = jobSchema.safeParse({
      ...validValues,
      minExperienceYears: 8,
      maxExperienceYears: 4,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('minExperienceYears');
    }
  });

  it('rejects a minimum salary greater than the maximum', () => {
    const result = jobSchema.safeParse({ ...validValues, salaryMin: 120000, salaryMax: 90000 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('salaryMin');
    }
  });

  it('accepts equal salary bounds', () => {
    expect(
      jobSchema.safeParse({ ...validValues, salaryMin: 90000, salaryMax: 90000 }).success,
    ).toBe(true);
  });

  it('rejects a negative salary', () => {
    expect(jobSchema.safeParse({ ...validValues, salaryMin: -1 }).success).toBe(false);
  });
});

describe('jobToFormValues', () => {
  it('maps an existing job into editable form values', () => {
    const job = makeJob();
    const values = jobToFormValues(job);

    expect(values.title).toBe(job.title);
    expect(values.employmentType).toBe(job.employmentType);
    expect(values.skills).toEqual([
      { slug: 'react', isRequired: true },
      { slug: 'typescript', isRequired: true },
    ]);
  });

  it('coerces null optional fields into undefined and null location into an empty string', () => {
    const job = makeJob({ location: null, salaryMin: null, minExperienceYears: null });
    const values = jobToFormValues(job);

    expect(values.location).toBe('');
    expect(values.salaryMin).toBeUndefined();
    expect(values.minExperienceYears).toBeUndefined();
  });
});

describe('toCreateJobRequest', () => {
  it('trims text and stamps the chosen status and default currency', () => {
    const payload = toCreateJobRequest(
      { ...validValues, title: '  Senior Engineer  ', location: '  Berlin  ' },
      'PUBLISHED',
    );

    expect(payload.title).toBe('Senior Engineer');
    expect(payload.location).toBe('Berlin');
    expect(payload.status).toBe('PUBLISHED');
    expect(payload.salaryCurrency).toBe('USD');
  });

  it('omits an empty location and unset optional numbers', () => {
    const payload = toCreateJobRequest({ ...validValues, location: '   ' }, 'DRAFT');

    expect(payload).not.toHaveProperty('location');
    expect(payload).not.toHaveProperty('salaryMin');
    expect(payload).not.toHaveProperty('minExperienceYears');
  });

  it('includes provided optional numbers', () => {
    const payload = toCreateJobRequest(
      { ...validValues, salaryMin: 90000, salaryMax: 120000, minExperienceYears: 3 },
      'PUBLISHED',
    );

    expect(payload.salaryMin).toBe(90000);
    expect(payload.salaryMax).toBe(120000);
    expect(payload.minExperienceYears).toBe(3);
  });
});

describe('toUpdateJobRequest', () => {
  it('omits the status when none is supplied so it is preserved server-side', () => {
    const payload = toUpdateJobRequest(validValues);
    expect(payload).not.toHaveProperty('status');
  });

  it('includes the status when explicitly changed', () => {
    const payload = toUpdateJobRequest(validValues, 'PUBLISHED');
    expect(payload.status).toBe('PUBLISHED');
  });
});
