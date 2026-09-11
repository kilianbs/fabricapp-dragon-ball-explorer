import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { DragonBallCatalogProvider } from '@/hooks/DragonBallCatalogContext';
import { PlanetDetailPage } from '@/pages/PlanetDetailPage';
import { kanassaDetail, mockDragonBallFetch } from './testUtils/dragonballFixtures';

function renderDetail(id: number) {
  return render(
    <MemoryRouter initialEntries={[`/planets/${id}`]}>
      <DragonBallCatalogProvider>
        <Routes>
          <Route path="/planets/:id" element={<PlanetDetailPage />} />
        </Routes>
      </DragonBallCatalogProvider>
    </MemoryRouter>
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PlanetDetailPage', () => {
  it('states explicitly that a destroyed planet is destroyed', async () => {
    vi.stubGlobal('fetch', mockDragonBallFetch());
    renderDetail(2); // Namek

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Namek' })).toBeInTheDocument();
    });
    expect(screen.getByText('Planeta destruido')).toBeInTheDocument();
  });

  it('lists the originating characters, linked to their own ficha', async () => {
    vi.stubGlobal('fetch', mockDragonBallFetch());
    renderDetail(1); // Tierra -> Goku

    await waitFor(() => {
      expect(screen.getByText('Personajes originarios (1)')).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: /Goku/ })).toHaveAttribute(
      'href',
      '/characters/1'
    );
  });

  it('omits the character section entirely for a planet with none', async () => {
    vi.stubGlobal('fetch', mockDragonBallFetch());
    renderDetail(3); // Kanassa

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Kanassa' })).toBeInTheDocument();
    });
    expect(kanassaDetail.characters).toHaveLength(0);
    expect(screen.queryByText(/^Personajes originarios/)).not.toBeInTheDocument();
  });

  it('shows a not-found message with a way back for an unknown id', async () => {
    vi.stubGlobal('fetch', mockDragonBallFetch());
    renderDetail(999);

    await waitFor(() => {
      expect(screen.getByText('No se ha encontrado ese planeta.')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Volver a planetas' })).toBeInTheDocument();
  });
});
