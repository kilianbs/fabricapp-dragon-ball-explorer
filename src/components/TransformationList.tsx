import { Link } from 'react-router-dom';

import type { Transformation } from '@/services/dragonball/types';

/**
 * Only rendered by the caller when there's at least one transformation —
 * a character with none must not show this section at all.
 */
export function TransformationList({
  characterId,
  transformations,
}: {
  characterId: number;
  transformations: Transformation[];
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
        Transformaciones ({transformations.length})
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {transformations.map((transformation) => (
          <Link
            key={transformation.id}
            to={`/characters/${characterId}/transformations/${transformation.id}`}
            className="flex h-40 min-w-0 flex-col items-center gap-1 rounded-xl border border-gray-100 p-3 text-center transition-colors hover:border-gray-300"
          >
            <img
              src={transformation.image}
              alt={transformation.name}
              loading="lazy"
              className="h-24 w-full shrink-0 object-contain"
            />
            <span className="break-words text-xs font-medium text-gray-900">{transformation.name}</span>
            <span className="break-words text-xs text-gray-400">{transformation.ki}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
