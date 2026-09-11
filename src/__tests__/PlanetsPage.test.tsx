import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { DragonBallCatalogProvider } from '@/hooks/DragonBallCatalogContext';
import { PlanetsPage } from '@/pages/PlanetsPage';
import { mockDragonBallFetch } from './testUtils/dragonballFixtures';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/planets']}>
      <DragonBallCatalogProvider>
        <PlanetsPage />
      </DragonBallCatalogProvider>
    </MemoryRouter>
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PlanetsPage', () => {
  it('lists every planet and visually distinguishes a destroyed one from an intact one', async () => {
    vi.stubGlobal('fetch', mockDragonBallFetch());
    renderPage();

    await waitFor(() => expect(screen.getByText('Tierra')).toBeInTheDocument());
    expect(screen.getByText('Namek')).toBeInTheDocument();

    const tierraCard = screen.getByRole('link', { name: /Tierra/ });
    const namekCard = screen.getByRole('link', { name: /Namek/ });
    expect(tierraCard).toHaveTextContent('Intacto');
    expect(namekCard).toHaveTextContent('Destruido');
  });

  it('narrows the grid by name search', async () => {
    vi.stubGlobal('fetch', mockDragonBallFetch());
    renderPage();
    await waitFor(() => expect(screen.getByText('Tierra')).toBeInTheDocument());

    await userEvent.type(screen.getByPlaceholderText('Buscar planeta…'), 'nam');

    expect(screen.queryByText('Tierra')).not.toBeInTheDocument();
    expect(screen.getByText('Namek')).toBeInTheDocument();
  });

  it('shows an empty state with a clear control when nothing matches', async () => {
    vi.stubGlobal('fetch', mockDragonBallFetch());
    renderPage();
    await waitFor(() => expect(screen.getByText('Tierra')).toBeInTheDocument());

    await userEvent.type(screen.getByPlaceholderText('Buscar planeta…'), 'zzz-nadie');

    expect(
      screen.getByText('No hay planetas que coincidan con la búsqueda.')
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }));

    expect(screen.getByText('Tierra')).toBeInTheDocument();
  });
});
