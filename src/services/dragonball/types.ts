/**
 * Data shapes returned by the public Dragon Ball API
 * (https://web.dragonball-api.com/documentation).
 *
 * The list endpoints (`/characters`, `/planets`) return only the summary
 * fields below. `originPlanet`, `transformations`, and a planet's
 * `characters` are only present on the by-id detail endpoints.
 */

/** A character's transformation, as returned inside a character's detail. */
export interface Transformation {
  id: number;
  name: string;
  image: string;
  ki: string;
}

/** Fields common to every character, whether from a list or a detail call. */
export interface CharacterSummary {
  id: number;
  name: string;
  ki: string;
  maxKi: string;
  race: string;
  gender: string;
  description: string;
  image: string;
  affiliation: string;
}

/** A character with its detail-only fields. */
export interface CharacterDetail extends CharacterSummary {
  originPlanet: PlanetSummary | null;
  transformations: Transformation[];
}

/** Fields common to every planet, whether from a list or a detail call. */
export interface PlanetSummary {
  id: number;
  name: string;
  isDestroyed: boolean;
  description: string;
  image: string;
}

/** A planet with its detail-only fields. */
export interface PlanetDetail extends PlanetSummary {
  characters: CharacterSummary[];
}

/** Pagination metadata the API includes on the wrapped list shape. */
export interface CollectionMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

/**
 * The API returns collections wrapped in `{ items, meta, links }` for plain
 * list requests, but as a bare array when filter query params are applied.
 * Callers should go through {@link normalizeCollection} rather than assume
 * either shape directly.
 */
export type CollectionResponse<T> = T[] | { items: T[]; meta: CollectionMeta };
