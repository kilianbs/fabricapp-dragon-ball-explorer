import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { DragonBallCatalogProvider } from '@/hooks/DragonBallCatalogContext';
import { CharacterDetailPage } from '@/pages/CharacterDetailPage';
import {
  allCharacters,
  gokuDetail,
  jsonResponse,
  mockDragonBallFetch,
  piccoloDetail,
  satanDetail,
} from './testUtils/dragonballFixtures';

function renderDetail(id: number) {
  return render(
    <MemoryRouter initialEntries={[`/characters/${id}`]}>
      <DragonBallCatalogProvider>
        <Routes>
          <Route path="/characters/:id" element={<CharacterDetailPage />} />
        </Routes>
      </DragonBallCatalogProvider>
    </MemoryRouter>
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('CharacterDetailPage', () => {
  it('paints the known fields from the catalog immediately, before the detail call resolves', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/characters/1')) {
        // Never resolves within this test — simulates the detail call still
        // being in flight while the catalog summary is already available.
        return new Promise<Response>(() => {});
      }
      if (url.includes('/characters')) {
        return Promise.resolve(
          jsonResponse({
            items: allCharacters,
            meta: { totalItems: 3, itemCount: 3, itemsPerPage: 100, totalPages: 1, currentPage: 1 },
          })
        );
      }
      return Promise.resolve(jsonResponse({ items: [], meta: { totalItems: 0, itemCount: 0, itemsPerPage: 100, totalPages: 1, currentPage: 1 } }));
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDetail(1);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Goku' })).toBeInTheDocument();
    });
    // The page-level loading state (for when nothing is known yet) must not
    // show once the catalog summary already painted the ficha.
    expect(screen.queryByText('Cargando personaje…')).not.toBeInTheDocument();
  });

  it('shows the transformations section for a character that has them', async () => {
    vi.stubGlobal('fetch', mockDragonBallFetch());
    renderDetail(1);

    await waitFor(() => {
      expect(screen.getByText(`Transformaciones (${gokuDetail.transformations.length})`)).toBeInTheDocument();
    });
    expect(screen.getByText('Goku SSJ')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Goku SSJ Goku SSJ/ })).toHaveAttribute(
      'href',
      '/characters/1/transformations/1'
    );
  });

  it('omits the transformations section entirely for a character without any', async () => {
    vi.stubGlobal('fetch', mockDragonBallFetch());
    renderDetail(2);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Piccolo' })).toBeInTheDocument();
    });
    expect(piccoloDetail.transformations).toHaveLength(0);
    expect(screen.queryByText(/^Transformaciones/)).not.toBeInTheDocument();
  });

  it('links to the origin planet when known', async () => {
    vi.stubGlobal('fetch', mockDragonBallFetch());
    renderDetail(1);

    await waitFor(() => {
      expect(screen.getByText('Planeta de origen')).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: 'Tierra' })).toHaveAttribute('href', '/planets/1');
  });

  it('omits the origin planet section when the API does not provide one', async () => {
    vi.stubGlobal('fetch', mockDragonBallFetch());
    renderDetail(3);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Mr. Satan' })).toBeInTheDocument();
    });
    expect(satanDetail.originPlanet).toBeNull();
    expect(screen.queryByText('Planeta de origen')).not.toBeInTheDocument();
  });

  it('shows a not-found message with a way back for an unknown id', async () => {
    vi.stubGlobal('fetch', mockDragonBallFetch());
    renderDetail(999);

    await waitFor(() => {
      expect(screen.getByText('No se ha encontrado ese personaje.')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Volver a personajes' })).toBeInTheDocument();
  });
});
