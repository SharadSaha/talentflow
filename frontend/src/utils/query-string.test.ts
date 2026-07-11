import { describe, expect, it } from 'vitest';

import { buildQueryString, parseQueryString } from '@/utils/query-string';

describe('buildQueryString', () => {
  it('serialises mixed value types into a query string', () => {
    expect(buildQueryString({ page: 2, search: 'react', remote: true })).toBe(
      'page=2&search=react&remote=true',
    );
  });

  it('omits undefined, null, and empty-string values', () => {
    expect(buildQueryString({ a: 'x', b: undefined, c: null, d: '' })).toBe('a=x');
  });

  it('keeps a numeric zero value', () => {
    expect(buildQueryString({ count: 0 })).toBe('count=0');
  });

  it('keeps a boolean false value', () => {
    expect(buildQueryString({ active: false })).toBe('active=false');
  });

  it('returns an empty string when every value is omitted', () => {
    expect(buildQueryString({ a: undefined, b: null })).toBe('');
  });

  it('encodes special characters', () => {
    expect(buildQueryString({ q: 'a b&c' })).toBe('q=a+b%26c');
  });
});

describe('parseQueryString', () => {
  it('parses a raw query string into a record', () => {
    expect(parseQueryString('page=2&search=react')).toEqual({ page: '2', search: 'react' });
  });

  it('parses a URLSearchParams instance', () => {
    expect(parseQueryString(new URLSearchParams('a=1&b=2'))).toEqual({ a: '1', b: '2' });
  });

  it('returns an empty record for an empty string', () => {
    expect(parseQueryString('')).toEqual({});
  });
});
