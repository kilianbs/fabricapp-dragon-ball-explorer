/**
 * Folds a string to lowercase with diacritics stripped, so search and
 * filtering can compare text without distinguishing case or accents.
 * Decomposes accented characters (NFD) and strips the combining marks
 * that carry the accent, using the Diacritic Unicode property so no
 * hand-picked code point range can fall out of date.
 */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export function includesNormalized(haystack: string, needle: string): boolean {
  return normalizeText(haystack).includes(normalizeText(needle));
}
