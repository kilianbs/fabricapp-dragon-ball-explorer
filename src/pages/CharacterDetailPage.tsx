import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { DetailField } from '@/components/DetailField';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { TransformationList } from '@/components/TransformationList';
import { useDragonBallCatalog } from '@/hooks/DragonBallCatalogContext';
import {
  DragonBallApiError,
  type DragonBallApiErrorKind,
  fetchCharacterById,
} from '@/services/dragonball/dragonballApi';
import type { CharacterDetail } from '@/services/dragonball/types';

export function CharacterDetailPage() {
  const { id: idParam } = useParams<{ id: string }>();
  const id = Number(idParam);
  const navigate = useNavigate();
  const { characters } = useDragonBallCatalog();
  const summary = characters.find((c) => c.id === id);

  const [detail, setDetail] = useState<CharacterDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [detailError, setDetailError] = useState<{
    kind: DragonBallApiErrorKind;
    message: string;
  } | null>(null);

  const loadDetail = useCallback(() => {
    if (!Number.isFinite(id)) return;
    setDetailLoading(true);
    setDetailError(null);
    fetchCharacterById(id)
      .then(setDetail)
      .catch((err: unknown) => {
        setDetailError(
          err instanceof DragonBallApiError
            ? { kind: err.kind, message: err.message }
            : { kind: 'load-failed', message: 'No se ha podido cargar el personaje.' }
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
        message="No se ha encontrado ese personaje."
        actionLabel="Volver a personajes"
        onAction={() => navigate('/characters')}
      />
    );
  }

  // Prefer the freshly-fetched detail; fall back to the catalog summary so
  // opening this page from the grid paints the known fields immediately
  // instead of flashing a loading state for data already in hand.
  const base = detail ?? summary;

  if (!base) {
    if (detailLoading) return <LoadingState label="Cargando personaje…" />;
    return (
      <ErrorState
        message={detailError?.message ?? 'No se ha podido cargar el personaje.'}
        onRetry={loadDetail}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Link to="/characters" className="text-sm text-gray-400 transition-colors hover:text-gray-600">
        ← Volver a personajes
      </Link>

      <div className="flex flex-col gap-6 sm:flex-row">
        <img
          src={base.image}
          alt={base.name}
          className="h-48 w-48 shrink-0 rounded-2xl bg-gray-50 object-contain"
        />
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold text-gray-950">{base.name}</h1>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            {base.race && <DetailField label="Raza" value={base.race} />}
            {base.gender && <DetailField label="Género" value={base.gender} />}
            {base.affiliation && <DetailField label="Afiliación" value={base.affiliation} />}
            {base.ki && <DetailField label="Ki" value={base.ki} />}
            {base.maxKi && <DetailField label="Ki máximo" value={base.maxKi} />}
          </dl>
          {base.description && (
            <p className="max-w-2xl text-sm leading-relaxed text-gray-500">{base.description}</p>
          )}
        </div>
      </div>

      {/* Sections below depend on the by-id detail call, not the catalog
          summary, so they get their own loading/error treatment. */}
      {detailLoading && !detail && <LoadingState label="Cargando detalles adicionales…" />}

      {detail?.originPlanet && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Planeta de origen
          </h2>
          <Link
            to={`/planets/${detail.originPlanet.id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm text-gray-800 transition-colors hover:border-gray-300"
          >
            {detail.originPlanet.name}
          </Link>
        </section>
      )}

      {detail && detail.transformations.length > 0 && (
        <TransformationList characterId={detail.id} transformations={detail.transformations} />
      )}

      {/* 'not-found' already returned early above; anything left here is a
          generic load failure. */}
      {detailError && <ErrorState message={detailError.message} onRetry={loadDetail} />}
    </div>
  );
}
