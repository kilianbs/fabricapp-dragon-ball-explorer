import { useMemo } from 'react';

import type { CharacterSummary } from '@/services/dragonball/types';
import { uniqueSorted } from '@/utils/uniqueSorted';

export function CharacterFilters({
  characters,
  race,
  affiliation,
  onRaceChange,
  onAffiliationChange,
}: {
  characters: CharacterSummary[];
  race: string;
  affiliation: string;
  onRaceChange: (value: string) => void;
  onAffiliationChange: (value: string) => void;
}) {
  // Options come from the data actually loaded, never a hand-maintained list.
  const races = useMemo(() => uniqueSorted(characters.map((c) => c.race)), [characters]);
  const affiliations = useMemo(
    () => uniqueSorted(characters.map((c) => c.affiliation)),
    [characters]
  );

  const selectClass =
    'rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none';

  return (
    <div className="flex flex-wrap gap-3">
      <select
        aria-label="Raza"
        value={race}
        onChange={(e) => onRaceChange(e.target.value)}
        className={selectClass}
      >
        <option value="">Todas las razas</option>
        {races.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <select
        aria-label="Afiliación"
        value={affiliation}
        onChange={(e) => onAffiliationChange(e.target.value)}
        className={selectClass}
      >
        <option value="">Todas las afiliaciones</option>
        {affiliations.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
    </div>
  );
}
