import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { DetailField } from '@/components/DetailField';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import {
  DragonBallApiError,
  type DragonBallApiErrorKind,
  fetchCharacterById,
} from '@/services/dragonball/dragonballApi';
import type { CharacterDetail } from '@/services/dragonball/types';

export function TransformationDetailPage() {
  const { characterId: characterIdParam, transformationId: transformationIdParam } = useParams<{
    characterId: string;
    transformationId: string;
  }>();
  const characterId = Number(characterIdParam);
  const transformationId = Number(transformationIdParam);
  const navigate = useNavigate();

  const [detail, setDetail] = useState<CharacterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ kind: DragonBallApiErrorKind; message: string } | null>(
    null
  );

  const loadDetail = useCallback(() => {
    if (!Number.isFinite(characterId)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetchCharacterById(characterId)
      .then(setDetail)
      .catch((err: unknown) => {
        setError(
          err instanceof DragonBallApiError
            ? { kind: err.kind, message: err.message }
            : { kind: 'load-failed', message: 'No se ha podido cargar el personaje.' }
        );
      })
      .finally(() => setLoading(false));
  }, [characterId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  if (error?.kind === 'not-found') {
    return (
      <EmptyState
        message="No se ha encontrado ese personaje."
        actionLabel="Volver a personajes"
        onAction={() => navigate('/characters')}
      />
    );
  }

  if (loading) return <LoadingState label="Cargando transformación…" />;

  if (!detail) {
    return (
      <ErrorState
        message={error?.message ?? 'No se ha podido cargar el personaje.'}
        onRetry={loadDetail}
      />
    );
  }

  const index = detail.transformations.findIndex((t) => t.id === transformationId);

  if (index === -1) {
    return (
      <EmptyState
        message="No se ha encontrado esa transformación."
        actionLabel="Volver al personaje"
        onAction={() => navigate(`/characters/${characterId}`)}
      />
    );
  }

  const transformation = detail.transformations[index];
  const previous = index > 0 ? detail.transformations[index - 1] : null;
  const next =
    index < detail.transformations.length - 1 ? detail.transformations[index + 1] : null;

  return (
    <div className="flex flex-col gap-8">
      <Link
        to={`/characters/${characterId}`}
        className="text-sm text-gray-400 transition-colors hover:text-gray-600"
      >
        ← Volver a {detail.name}
      </Link>

      <div className="flex flex-col gap-6 sm:flex-row">
        <img
          src={transformation.image}
          alt={transformation.name}
          className="h-48 w-48 shrink-0 rounded-2xl object-contain"
        />
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold text-gray-950">{transformation.name}</h1>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            <DetailField label="Ki" value={transformation.ki} />
            <DetailField label="Personaje" value={detail.name} />
          </dl>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        {previous ? (
          <Link
            to={`/characters/${characterId}/transformations/${previous.id}`}
            className="rounded-lg border border-gray-100 px-3 py-2 text-sm text-gray-800 transition-colors hover:border-gray-300"
          >
            ← {previous.name}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            to={`/characters/${characterId}/transformations/${next.id}`}
            className="rounded-lg border border-gray-100 px-3 py-2 text-sm text-gray-800 transition-colors hover:border-gray-300"
          >
            {next.name} →
          </Link>
        )}
      </div>
    </div>
  );
}
