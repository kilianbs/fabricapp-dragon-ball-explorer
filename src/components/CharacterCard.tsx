import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { CharacterSummary } from '@/services/dragonball/types';

/**
 * A selectable character tile. If the image fails to load, the tile falls
 * back to an initial of the same size and keeps showing every other field —
 * a broken image must never hide data or make the character unselectable.
 */
export function CharacterCard({ character }: { character: CharacterSummary }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <Link
      to={`/characters/${character.id}`}
      className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-gray-100 bg-gray-950 transition-colors hover:border-gray-300"
    >
      <div className="flex h-40 w-full shrink-0 items-center justify-center bg-gray-800 sm:h-44">
        {imageFailed ? (
          <span className="text-4xl font-semibold text-gray-500" aria-hidden="true">
            {character.name.charAt(0)}
          </span>
        ) : (
          <img
            src={character.image}
            alt={character.name}
            loading="lazy"
            className="h-full w-full object-contain"
            onError={() => setImageFailed(true)}
          />
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-2 p-3 text-left text-gray-100">
        <div className="min-w-0">
          <h3 className="break-words text-base font-bold text-white">{character.name}</h3>
          <p className="text-xs text-gray-400">
            {character.race} - {character.gender}
          </p>
        </div>
        <dl className="flex flex-col gap-1 text-xs">
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-gray-400">Ki base:</dt>
            <dd className="min-w-0 break-words text-right font-medium text-gray-100">{character.ki}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-gray-400">Ki máximo:</dt>
            <dd className="min-w-0 break-words text-right font-medium text-gray-100">{character.maxKi}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-gray-400">Afiliación:</dt>
            <dd className="min-w-0 break-words text-right font-medium text-gray-100">
              {character.affiliation}
            </dd>
          </div>
        </dl>
      </div>
    </Link>
  );
}
