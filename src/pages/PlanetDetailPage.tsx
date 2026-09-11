import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { CharacterCard } from '@/components/CharacterCard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { useDragonBallCatalog } from '@/hooks/DragonBallCatalogContext';
import {
  DragonBallApiError,
  type DragonBallApiErrorKind,
  fetchPlanetById,
} from '@/services/dragonball/dragonballApi';
import type { PlanetDetail } from '@/services/dragonball/types';

export function PlanetDetailPage() {
  const { id: idParam } = useParams<{ id: string }>();
  const id = Number(idParam);
  const navigate = useNavigate();
  const { planets } = useDragonBallCatalog();
  const summary = planets.find((p) => p.id === id);

  const [detail, setDetail] = useState<PlanetDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [detailError, setDetailError] = useState<{
    kind: DragonBallApiErrorKind;
    message: string;
  } | null>(null);

  const loadDetail = useCallback(() => {
    if (!Number.isFinite(id)) return;
    setDetailLoading(true);
    setDetailError(null);
    fetchPlanetById(id)
      .then(setDetail)
      .catch((err: unknown) => {
        setDetailError(
          err instanceof DragonBallApiError
            ? { kind: err.kind, message: err.message }
            : { kind: 'load-failed', message: 'No se ha podido cargar el planeta.' }
        );
      })
      .finally(() => setDetailLoading(false));
  }, [id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  if (detailError?.kind === 'not-found') {
    return (
      <EmptyState
        message="No se ha encontrado ese planeta."
        actionLabel="Volver a planetas"
        onAction={() => navigate('/planets')}
      />
    );
  }

  // Prefer the freshly-fetched detail; fall back to the catalog summary so
  // opening this page from the grid paints the known fields immediately.
  const base = detail ?? summary;

  if (!base) {
    if (detailLoading) return <LoadingState label="Cargando planeta…" />;
    return (
      <ErrorState
        message={detailError?.message ?? 'No se ha podido cargar el planeta.'}
        onRetry={loadDetail}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Link to="/planets" className="text-sm text-gray-400 transition-colors hover:text-gray-600">
        ← Volver a planetas
      </Link>

      <div className="flex flex-col gap-6 sm:flex-row">
        <img
          src={base.image}
          alt={base.name}
          className="h-48 w-48 shrink-0 rounded-2xl object-cover"
        />
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-950">{base.name}</h1>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                base.isDestroyed ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {base.isDestroyed ? 'Planeta destruido' : 'Planeta intacto'}
            </span>
          </div>
          {base.description && (
            <p className="max-w-2xl text-sm leading-relaxed text-gray-500">{base.description}</p>
          )}
        </div>
      </div>

      {/* The list of originating characters depends on the by-id detail
          call, not the catalog summary, so it gets its own loading state. */}
      {detailLoading && !detail && <LoadingState label="Cargando personajes originarios…" />}

      {detail && detail.characters.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Personajes originarios ({detail.characters.length})
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {detail.characters.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
        </section>
      )}

      {/* 'not-found' already returned early above; anything left here is a
          generic load failure. */}
      {detailError && <ErrorState message={detailError.message} onRetry={loadDetail} />}
    </div>
  );
}
