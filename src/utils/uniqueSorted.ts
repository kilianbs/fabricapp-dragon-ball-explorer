/** Distinct, sorted, non-empty values — used to derive filter options from loaded data. */
export function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
}
