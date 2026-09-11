import type {
  CharacterDetail,
  CharacterSummary,
  CollectionResponse,
  PlanetDetail,
  PlanetSummary,
} from './types';

const API_BASE_URL = 'https://dragonball-api.com/api';

/** The API returns everything in one page at this size for the current dataset. */
const PAGE_SIZE = 100;

export type DragonBallApiErrorKind = 'not-found' | 'load-failed';

/**
 * Every failure the app can encounter talking to the Dragon Ball API,
 * collapsed to the two kinds the specs actually distinguish:
 *
 * - `not-found`: the API recognized the request but not the id (it replies
 *   with HTTP 400 and a "... ID not found" body on the by-id endpoints).
 * - `load-failed`: anything else — network failure, a server error, or a
 *   response whose shape doesn't match what the app expects. All of these
 *   are shown to the user the same way, with a retry control.
 */
export class DragonBallApiError extends Error {
  readonly kind: DragonBallApiErrorKind;

  constructor(kind: DragonBallApiErrorKind, message: string) {
    super(message);
    this.name = 'DragonBallApiError';
    this.kind = kind;
  }
}

/**
 * Accepts either shape the API returns for a collection — `{ items, meta }`
 * for a plain list, or a bare array when filter query params are applied —
 * and always returns a plain array.
 */
export function normalizeCollection<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (
    data !== null &&
    typeof data === 'object' &&
    Array.isArray((data as { items?: unknown }).items)
  ) {
    return (data as { items: T[] }).items;
  }
  throw new DragonBallApiError(
    'load-failed',
    'La API devolvió una respuesta con un formato inesperado.'
  );
}

async function fetchJson(url: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new DragonBallApiError(
      'load-failed',
      'No se ha podido conectar con la API de Dragon Ball.'
    );
  }

  if (!response.ok) {
    // The by-id endpoints reply 400 with a "... ID not found" body when the
    // id doesn't exist — the one case the app treats differently from a
    // generic load failure.
    if (response.status === 400) {
      throw new DragonBallApiError('not-found', 'Elemento no encontrado.');
    }
    throw new DragonBallApiError(
      'load-failed',
      `La API respondió con un error (${response.status}).`
    );
  }

  try {
    return await response.json();
  } catch {
    throw new DragonBallApiError(
      'load-failed',
      'La API devolvió una respuesta que no se pudo interpretar.'
    );
  }
}

/**
 * Fetches every page of a collection and concatenates the items. The
 * current dataset fits in a single page of `PAGE_SIZE`, but this keeps
 * working if it ever grows past that without silently truncating results.
 */
async function fetchAllPages<T>(path: string): Promise<T[]> {
  const items: T[] = [];
  let page = 1;

  while (true) {
    const url = `${API_BASE_URL}${path}?page=${page}&limit=${PAGE_SIZE}`;
    const data = await fetchJson(url);
    const collection = data as CollectionResponse<T>;
    items.push(...normalizeCollection<T>(collection));

    if (Array.isArray(collection) || page >= collection.meta.totalPages) {
      break;
    }
    page += 1;
  }

  return items;
}

export function fetchAllCharacters(): Promise<CharacterSummary[]> {
  return fetchAllPages<CharacterSummary>('/characters');
}

export function fetchAllPlanets(): Promise<PlanetSummary[]> {
  return fetchAllPages<PlanetSummary>('/planets');
}

export async function fetchCharacterById(id: number): Promise<CharacterDetail> {
  const data = await fetchJson(`${API_BASE_URL}/characters/${id}`);
  return data as CharacterDetail;
}

export async function fetchPlanetById(id: number): Promise<PlanetDetail> {
  const data = await fetchJson(`${API_BASE_URL}/planets/${id}`);
  return data as PlanetDetail;
}
