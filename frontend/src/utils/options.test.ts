import { describe, expect, it } from 'vitest';

import { toOptions } from '@/utils/options';

describe('toOptions', () => {
  it('maps a label record into ordered value/label pairs', () => {
    expect(toOptions({ FULL_TIME: 'Full-time', PART_TIME: 'Part-time' })).toEqual([
      { value: 'FULL_TIME', label: 'Full-time' },
      { value: 'PART_TIME', label: 'Part-time' },
    ]);
  });

  it('preserves the declaration order of the keys', () => {
    const options = toOptions({ c: 'C', a: 'A', b: 'B' });
    expect(options.map((option) => option.value)).toEqual(['c', 'a', 'b']);
  });

  it('returns an empty list for an empty label map', () => {
    expect(toOptions({})).toEqual([]);
  });
});
