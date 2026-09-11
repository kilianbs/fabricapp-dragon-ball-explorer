import { useMemo, useState } from 'react';

import { CharacterCard } from '@/components/CharacterCard';
import { CharacterFilters } from '@/components/CharacterFilters';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { SearchInput } from '@/components/SearchInput';
import { useDragonBallCatalog } from '@/hooks/DragonBallCatalogContext';
import { includesNormalized } from '@/utils/normalizeText';

export function CharactersPage() {
  const { characters, loading, error, retry } = useDragonBallCatalog();
  const [search, setSearch] = useState('');
  const [race, setRace] = useState('');
  const [affiliation, setAffiliation] = useState('');

  const filtered = useMemo(
    () =>
      characters.filter((c) => {
        if (race && c.race !== race) return false;
        if (affiliation && c.affiliation !== affiliation) return false;
        if (search && !includesNormalized(c.name, search)) return false;
        return true;
      }),
    [characters, search, race, affiliation]
  );

  if (loading) return <LoadingState label="Cargando personajes…" />;
  if (error) return <ErrorState message={error} onRetry={retry} />;

  const hasActiveFilter = Boolean(search || race || affiliation);
  const clearFilters = () => {
    setSearch('');
    setRace('');
    setAffiliation('');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-950">Personajes</h1>
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar personaje…" />
          <CharacterFilters
            characters={characters}
            race={race}
            affiliation={affiliation}
            onRaceChange={setRace}
            onAffiliationChange={setAffiliation}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          message="No hay personajes que coincidan con la búsqueda o los filtros."
          actionLabel={hasActiveFilter ? 'Limpiar búsqueda' : undefined}
          onAction={hasActiveFilter ? clearFilters : undefined}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </div>
      )}
    </div>
  );
}
