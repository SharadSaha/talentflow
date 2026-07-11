import { describe, expect, it } from 'vitest';

import { profileSchema } from '@/features/profile/schemas/profile.schema';

/** A minimal valid form value (all optionals empty/undefined). */
const base = {
  headline: '',
  about: '',
  phone: '',
  currentLocation: '',
  preferredLocation: '',
  currentCompany: '',
  currentTitle: '',
  totalExperienceMonths: undefined,
  highestEducation: undefined,
  expectedSalaryMin: undefined,
  expectedSalaryMax: undefined,
  noticePeriodDays: undefined,
  isOpenToWork: false,
  resumeUrl: '',
};

describe('profileSchema', () => {
  it('accepts an empty (all-optional) profile', () => {
    expect(profileSchema.safeParse(base).success).toBe(true);
  });

  it('rejects a minimum salary greater than the maximum', () => {
    const result = profileSchema.safeParse({
      ...base,
      expectedSalaryMin: 120000,
      expectedSalaryMax: 90000,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('expectedSalaryMin');
    }
  });

  it('accepts an equal min and max salary', () => {
    expect(
      profileSchema.safeParse({ ...base, expectedSalaryMin: 90000, expectedSalaryMax: 90000 })
        .success,
    ).toBe(true);
  });

  it('rejects an experience value beyond the allowed months', () => {
    expect(profileSchema.safeParse({ ...base, totalExperienceMonths: 1000 }).success).toBe(false);
  });

  it('rejects a malformed resume URL but accepts a valid one', () => {
    expect(profileSchema.safeParse({ ...base, resumeUrl: 'not-a-url' }).success).toBe(false);
    expect(
      profileSchema.safeParse({ ...base, resumeUrl: 'https://cv.example.com/ada.pdf' }).success,
    ).toBe(true);
  });
});
