import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { PlanetSummary } from '@/services/dragonball/types';

export function PlanetCard({ planet }: { planet: PlanetSummary }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <Link
      to={`/planets/${planet.id}`}
      className="flex h-56 min-w-0 flex-col items-center gap-2 rounded-xl border border-gray-100 p-4 text-center transition-colors hover:border-gray-300"
    >
      <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-50">
        {imageFailed ? (
          <span className="text-2xl font-semibold text-gray-300" aria-hidden="true">
            {planet.name.charAt(0)}
          </span>
        ) : (
          <img
            src={planet.image}
            alt={planet.name}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        )}
      </div>
      <span className="break-words text-sm font-medium text-gray-900">{planet.name}</span>
      <span
        className={`text-xs font-medium ${planet.isDestroyed ? 'text-red-500' : 'text-emerald-600'}`}
      >
        {planet.isDestroyed ? 'Destruido' : 'Intacto'}
      </span>
    </Link>
  );
}
