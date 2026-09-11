import { vi } from 'vitest';

import type {
  CharacterDetail,
  CharacterSummary,
  PlanetDetail,
  PlanetSummary,
} from '@/services/dragonball/types';

/**
 * A small, deliberately varied fixture set shared by the character/planet
 * browsing tests:
 * - Goku has transformations and a known origin planet.
 * - Piccolo has no transformations.
 * - Satan has no origin planet at all.
 * - Tierra is intact and has characters; Namek is destroyed; Kanassa has none.
 */

export const planetTierra: PlanetSummary = {
  id: 1,
  name: 'Tierra',
  isDestroyed: false,
  description: 'El hogar de los terrícolas.',
  image: 'https://dragonball-api.com/planetas/tierra.webp',
};

export const planetNamek: PlanetSummary = {
  id: 2,
  name: 'Namek',
  isDestroyed: true,
  description: 'Planeta natal de los namekianos.',
  image: 'https://dragonball-api.com/planetas/namek.webp',
};

export const planetKanassa: PlanetSummary = {
  id: 3,
  name: 'Kanassa',
  isDestroyed: false,
  description: 'Un planeta lejano.',
  image: 'https://dragonball-api.com/planetas/kanassa.webp',
};

export const characterGoku: CharacterSummary = {
  id: 1,
  name: 'Goku',
  ki: '60.000.000',
  maxKi: '90 Septillion',
  race: 'Saiyan',
  gender: 'Male',
  description: 'El protagonista de la serie.',
  image: 'https://dragonball-api.com/characters/goku.webp',
  affiliation: 'Z Fighter',
};

export const characterPiccolo: CharacterSummary = {
  id: 2,
  name: 'Piccolo',
  ki: '2.000.000',
  maxKi: '500.000.000',
  race: 'Namekian',
  gender: 'Male',
  description: 'Antiguo rival de Goku.',
  image: 'https://dragonball-api.com/characters/piccolo.webp',
  affiliation: 'Z Fighter',
};

export const characterSatan: CharacterSummary = {
  id: 3,
  name: 'Mr. Satan',
  ki: '5.000',
  maxKi: '5.000',
  race: 'Human',
  gender: 'Male',
  description: 'Campeón mundial de artes marciales.',
  image: 'https://dragonball-api.com/characters/satan.webp',
  affiliation: 'None',
};

export const gokuDetail: CharacterDetail = {
  ...characterGoku,
  originPlanet: planetTierra,
  transformations: [
    { id: 1, name: 'Goku SSJ', image: 'https://dragonball-api.com/transformaciones/ssj.webp', ki: '3 Billion' },
    { id: 2, name: 'Goku SSJ2', image: 'https://dragonball-api.com/transformaciones/ssj2.webp', ki: '6 Billion' },
  ],
};

export const piccoloDetail: CharacterDetail = {
  ...characterPiccolo,
  originPlanet: planetNamek,
  transformations: [],
};

export const satanDetail: CharacterDetail = {
  ...characterSatan,
  originPlanet: null,
  transformations: [],
};

export const tierraDetail: PlanetDetail = {
  ...planetTierra,
  characters: [characterGoku],
};

export const namekDetail: PlanetDetail = {
  ...planetNamek,
  characters: [characterPiccolo],
};

export const kanassaDetail: PlanetDetail = {
  ...planetKanassa,
  characters: [],
};

export const allCharacters = [characterGoku, characterPiccolo, characterSatan];
export const allPlanets = [planetTierra, planetNamek, planetKanassa];

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function wrapped<T>(items: T[]) {
  return {
    items,
    meta: {
      totalItems: items.length,
      itemCount: items.length,
      itemsPerPage: 100,
      totalPages: 1,
      currentPage: 1,
    },
  };
}

/**
 * A fetch mock that serves the fixtures above for the catalog list
 * endpoints and the by-id detail endpoints, and a 400 "not found" for any
 * other id.
 */
export function mockDragonBallFetch(): ReturnType<typeof vi.fn> {
  return vi.fn().mockImplementation((url: string) => {
    if (url.includes('/characters/')) {
      const id = Number(url.split('/characters/')[1]);
      const detail = [gokuDetail, piccoloDetail, satanDetail].find((c) => c.id === id);
      return Promise.resolve(
        detail
          ? jsonResponse(detail)
          : jsonResponse({ message: 'Character ID not found', statusCode: 400 }, 400)
      );
    }
    if (url.includes('/planets/')) {
      const id = Number(url.split('/planets/')[1]);
      const detail = [tierraDetail, namekDetail, kanassaDetail].find((p) => p.id === id);
      return Promise.resolve(
        detail
          ? jsonResponse(detail)
          : jsonResponse({ message: 'Planet ID not found', statusCode: 400 }, 400)
      );
    }
    if (url.includes('/characters')) {
      return Promise.resolve(jsonResponse(wrapped(allCharacters)));
    }
    if (url.includes('/planets')) {
      return Promise.resolve(jsonResponse(wrapped(allPlanets)));
    }
    return Promise.reject(new Error(`Unhandled URL in mockDragonBallFetch: ${url}`));
  });
}
