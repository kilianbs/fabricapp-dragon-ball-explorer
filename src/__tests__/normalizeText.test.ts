import { describe, expect, it } from 'vitest';

import { includesNormalized, normalizeText } from '@/utils/normalizeText';

describe('normalizeText / includesNormalized', () => {
  it('lowercases and strips accents', () => {
    expect(normalizeText('Ñandú Gohán')).toBe('nandu gohan');
  });

  it('matches regardless of case and accents', () => {
    expect(includesNormalized('Piccolo', 'picc')).toBe(true);
    expect(includesNormalized('Á Planeta', 'a planeta')).toBe(true);
    expect(includesNormalized('Goku', 'vegeta')).toBe(false);
  });
});
