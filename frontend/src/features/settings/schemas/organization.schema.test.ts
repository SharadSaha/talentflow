import { describe, expect, it } from 'vitest';

import { organizationSchema } from '@/features/settings/schemas/organization.schema';

const valid = {
  companyName: 'NovaTech',
  website: 'https://novatech.example.com',
  description: 'We build hiring software.',
};

describe('organizationSchema', () => {
  it('accepts a fully populated organization', () => {
    expect(organizationSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts an empty website since it is optional', () => {
    expect(organizationSchema.safeParse({ ...valid, website: '' }).success).toBe(true);
  });

  it('accepts an empty description', () => {
    expect(organizationSchema.safeParse({ ...valid, description: '' }).success).toBe(true);
  });

  it('rejects a company name shorter than the minimum', () => {
    expect(organizationSchema.safeParse({ ...valid, companyName: 'A' }).success).toBe(false);
  });

  it('rejects a malformed website URL', () => {
    const result = organizationSchema.safeParse({ ...valid, website: 'not-a-url' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('website');
    }
  });

  it('trims the company name', () => {
    const result = organizationSchema.safeParse({ ...valid, companyName: '  NovaTech  ' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyName).toBe('NovaTech');
    }
  });
});
