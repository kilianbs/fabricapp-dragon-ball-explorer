import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  DragonBallApiError,
  fetchAllCharacters,
  fetchAllPlanets,
  fetchCharacterById,
  fetchPlanetById,
  normalizeCollection,
} from '@/services/dragonball/dragonballApi';
import type { CharacterSummary } from '@/services/dragonball/types';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

const character = (id: number): CharacterSummary => ({
  id,
  name: `Character ${id}`,
  ki: '1.000.000',
  maxKi: '2.000.000',
  race: 'Saiyan',
  gender: 'Male',
  description: 'A fighter.',
  image: 'https://dragonball-api.com/characters/x.webp',
  affiliation: 'Z Fighter',
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('normalizeCollection', () => {
  it('unwraps the { items } envelope', () => {
    expect(normalizeCollection({ items: [1, 2, 3] })).toEqual([1, 2, 3]);
  });

  it('passes through a bare array unchanged', () => {
    expect(normalizeCollection([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('throws a load-failed error for an unrecognized shape', () => {
    expect(() => normalizeCollection({ nope: true })).toThrow(DragonBallApiError);
    try {
      normalizeCollection({ nope: true });
    } catch (err) {
      expect(err).toBeInstanceOf(DragonBallApiError);
      expect((err as DragonBallApiError).kind).toBe('load-failed');
    }
  });
});

describe('fetchAllCharacters / fetchAllPlanets', () => {
  it('does not emit a second request when the first page covers everything', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        items: [character(1), character(2)],
        meta: { totalItems: 2, itemCount: 2, itemsPerPage: 100, totalPages: 1, currentPage: 1 },
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchAllCharacters();

    expect(result).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('concatenates every page when the collection spans more than one', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          items: [character(1)],
          meta: { totalItems: 2, itemCount: 1, itemsPerPage: 1, totalPages: 2, currentPage: 1 },
        })
      )
      .mockResolvedValueOnce(
        jsonResponse({
          items: [character(2)],
          meta: { totalItems: 2, itemCount: 1, itemsPerPage: 1, totalPages: 2, currentPage: 2 },
        })
      );
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchAllCharacters();

    expect(result.map((c) => c.id)).toEqual([1, 2]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('propagates a load-failed error when the request fails outright', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    );

    await expect(fetchAllPlanets()).rejects.toMatchObject({ kind: 'load-failed' });
  });
});

describe('fetchCharacterById / fetchPlanetById', () => {
  it('returns the detail payload on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({ ...character(1), originPlanet: null, transformations: [] })
      )
    );

    const detail = await fetchCharacterById(1);
    expect(detail.name).toBe('Character 1');
  });

  it('raises a not-found error for the API 400 "ID not found" response', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse(
            { message: 'Character ID not found', error: 'Bad Request', statusCode: 400 },
            400
          )
        )
    );

    await expect(fetchCharacterById(9999)).rejects.toMatchObject({ kind: 'not-found' });
  });

  it('raises a load-failed error for a network failure, distinct from not-found', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network down')));

    await expect(fetchPlanetById(1)).rejects.toMatchObject({ kind: 'load-failed' });
  });

  it('raises a load-failed error for a server error status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, 500)));

    await expect(fetchPlanetById(1)).rejects.toMatchObject({ kind: 'load-failed' });
  });
});
