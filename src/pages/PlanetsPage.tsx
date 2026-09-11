import { useMemo, useState } from 'react';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { PlanetCard } from '@/components/PlanetCard';
import { SearchInput } from '@/components/SearchInput';
import { useDragonBallCatalog } from '@/hooks/DragonBallCatalogContext';
import { includesNormalized } from '@/utils/normalizeText';

export function PlanetsPage() {
  const { planets, loading, error, retry } = useDragonBallCatalog();
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => planets.filter((planet) => !search || includesNormalized(planet.name, search)),
    [planets, search]
  );

  if (loading) return <LoadingState label="Cargando planetas…" />;
  if (error) return <ErrorState message={error} onRetry={retry} />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-950">Planetas</h1>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar planeta…" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          message="No hay planetas que coincidan con la búsqueda."
          actionLabel={search ? 'Limpiar búsqueda' : undefined}
          onAction={search ? () => setSearch('') : undefined}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((planet) => (
            <PlanetCard key={planet.id} planet={planet} />
          ))}
        </div>
      )}
    </div>
  );
}
