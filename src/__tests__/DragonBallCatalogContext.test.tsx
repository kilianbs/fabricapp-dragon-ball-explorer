import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  DragonBallCatalogProvider,
  useDragonBallCatalog,
} from '@/hooks/DragonBallCatalogContext';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function Consumer({ testId }: { testId: string }) {
  const { characters, planets, loading, error } = useDragonBallCatalog();
  return (
    <div data-testid={testId}>
      {loading ? 'loading' : error ? `error:${error}` : `${characters.length}/${planets.length}`}
    </div>
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('DragonBallCatalogProvider', () => {
  it('loads the catalog once and shares it across multiple consumers', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/characters')) {
        return Promise.resolve(
          jsonResponse({
            items: [{ id: 1, name: 'Goku' }],
            meta: { totalItems: 1, itemCount: 1, itemsPerPage: 100, totalPages: 1, currentPage: 1 },
          })
        );
      }
      return Promise.resolve(
        jsonResponse({
          items: [{ id: 1, name: 'Tierra' }],
          meta: { totalItems: 1, itemCount: 1, itemsPerPage: 100, totalPages: 1, currentPage: 1 },
        })
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <DragonBallCatalogProvider>
        <Consumer testId="a" />
        <Consumer testId="b" />
      </DragonBallCatalogProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('a')).toHaveTextContent('1/1');
      expect(screen.getByTestId('b')).toHaveTextContent('1/1');
    });

    // One request for characters, one for planets — never duplicated per consumer.
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('surfaces a retryable error when the load fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));

    render(
      <DragonBallCatalogProvider>
        <Consumer testId="a" />
      </DragonBallCatalogProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('a')).toHaveTextContent(/^error:/);
    });
  });
});
