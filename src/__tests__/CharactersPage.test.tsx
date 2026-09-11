import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { DragonBallCatalogProvider } from '@/hooks/DragonBallCatalogContext';
import { CharactersPage } from '@/pages/CharactersPage';
import { mockDragonBallFetch } from './testUtils/dragonballFixtures';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/characters']}>
      <DragonBallCatalogProvider>
        <CharactersPage />
      </DragonBallCatalogProvider>
    </MemoryRouter>
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('CharactersPage', () => {
  it('lists every character from the catalog once loaded', async () => {
    vi.stubGlobal('fetch', mockDragonBallFetch());
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Goku')).toBeInTheDocument();
    });
    expect(screen.getByText('Piccolo')).toBeInTheDocument();
    expect(screen.getByText('Mr. Satan')).toBeInTheDocument();
  });

  it('narrows the grid by name search, ignoring case and accents', async () => {
    vi.stubGlobal('fetch', mockDragonBallFetch());
    renderPage();
    await waitFor(() => expect(screen.getByText('Goku')).toBeInTheDocument());

    await userEvent.type(screen.getByPlaceholderText('Buscar personaje…'), 'picc');

    expect(screen.queryByText('Goku')).not.toBeInTheDocument();
    expect(screen.getByText('Piccolo')).toBeInTheDocument();
  });

  it('shows an empty state with a clear control when nothing matches', async () => {
    vi.stubGlobal('fetch', mockDragonBallFetch());
    renderPage();
    await waitFor(() => expect(screen.getByText('Goku')).toBeInTheDocument());

    await userEvent.type(screen.getByPlaceholderText('Buscar personaje…'), 'zzz-nadie');

    expect(
      screen.getByText('No hay personajes que coincidan con la búsqueda o los filtros.')
    ).toBeInTheDocument();
    const clearButton = screen.getByRole('button', { name: 'Limpiar búsqueda' });

    await userEvent.click(clearButton);

    expect(screen.getByText('Goku')).toBeInTheDocument();
  });

  it('filters by race and combines with an active search', async () => {
    vi.stubGlobal('fetch', mockDragonBallFetch());
    renderPage();
    await waitFor(() => expect(screen.getByText('Goku')).toBeInTheDocument());

    await userEvent.selectOptions(screen.getByLabelText('Raza'), 'Namekian');

    expect(screen.queryByText('Goku')).not.toBeInTheDocument();
    expect(screen.getByText('Piccolo')).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText('Buscar personaje…'), 'goku');

    expect(
      screen.getByText('No hay personajes que coincidan con la búsqueda o los filtros.')
    ).toBeInTheDocument();
  });

  it('derives filter options from the loaded characters', async () => {
    vi.stubGlobal('fetch', mockDragonBallFetch());
    renderPage();
    await waitFor(() => expect(screen.getByText('Goku')).toBeInTheDocument());

    const raceOptions = screen
      .getAllByRole<HTMLOptionElement>('option')
      .filter((o) => o.closest('select') === screen.getByLabelText('Raza'))
      .map((o) => o.value);

    expect(raceOptions).toEqual(expect.arrayContaining(['Saiyan', 'Namekian', 'Human']));
  });
});
