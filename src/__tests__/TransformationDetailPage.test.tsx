import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { TransformationDetailPage } from '@/pages/TransformationDetailPage';
import {
  gokuDetail,
  jsonResponse,
  mockDragonBallFetch,
} from './testUtils/dragonballFixtures';
import type { CharacterDetail } from '@/services/dragonball/types';

function renderTransformation(characterId: number, transformationId: number) {
  return render(
    <MemoryRouter initialEntries={[`/characters/${characterId}/transformations/${transformationId}`]}>
      <Routes>
        <Route
          path="/characters/:characterId/transformations/:transformationId"
          element={<TransformationDetailPage />}
        />
      </Routes>
    </MemoryRouter>
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('TransformationDetailPage', () => {
  it('shows image, name, ki and the owning character for a valid transformation', async () => {
    vi.stubGlobal('fetch', mockDragonBallFetch());
    renderTransformation(1, 1); // Goku -> Goku SSJ

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Goku SSJ' })).toBeInTheDocument();
    });
    expect(screen.getByRole('img', { name: 'Goku SSJ' })).toHaveAttribute(
      'src',
      gokuDetail.transformations[0].image
    );
    expect(screen.getByText('3 Billion')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Volver a Goku/ })).toHaveAttribute(
      'href',
      '/characters/1'
    );
  });

  it('shows a loading indicator while the character detail has not resolved yet', async () => {
    const fetchMock = vi.fn().mockImplementation(() => new Promise<Response>(() => {}));
    vi.stubGlobal('fetch', fetchMock);
    renderTransformation(1, 1);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows a not-found state with a way back when the transformation does not belong to the character', async () => {
    vi.stubGlobal('fetch', mockDragonBallFetch());
    renderTransformation(1, 999);

    await waitFor(() => {
      expect(screen.getByText('No se ha encontrado esa transformación.')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Volver al personaje' })).toBeInTheDocument();
  });

  it('shows a not-found state for an unrecognized character id', async () => {
    vi.stubGlobal('fetch', mockDragonBallFetch());
    renderTransformation(999, 1);

    await waitFor(() => {
      expect(screen.getByText('No se ha encontrado ese personaje.')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Volver a personajes' })).toBeInTheDocument();
  });

  it('shows a recoverable error state with retry on a network failure', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network down'));
    vi.stubGlobal('fetch', fetchMock);
    renderTransformation(1, 1);

    await waitFor(() => {
      expect(
        screen.getByText('No se ha podido conectar con la API de Dragon Ball.')
      ).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });

  it('offers only Next on the first transformation, both on an intermediate one, and only Previous on the last', async () => {
    const threeTransformations: CharacterDetail = {
      ...gokuDetail,
      transformations: [
        { id: 1, name: 'Goku SSJ', image: gokuDetail.transformations[0].image, ki: '3 Billion' },
        { id: 2, name: 'Goku SSJ2', image: gokuDetail.transformations[1].image, ki: '6 Billion' },
        { id: 3, name: 'Goku SSJ3', image: 'https://dragonball-api.com/transformaciones/ssj3.webp', ki: '24 Billion' },
      ],
    };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(threeTransformations));
    vi.stubGlobal('fetch', fetchMock);

    renderTransformation(1, 1);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Goku SSJ' })).toBeInTheDocument());
    expect(screen.queryByRole('link', { name: /^← Goku/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Goku SSJ2 →/ })).toBeInTheDocument();
  });

  it('offers both Previous and Next on an intermediate transformation', async () => {
    const threeTransformations: CharacterDetail = {
      ...gokuDetail,
      transformations: [
        { id: 1, name: 'Goku SSJ', image: gokuDetail.transformations[0].image, ki: '3 Billion' },
        { id: 2, name: 'Goku SSJ2', image: gokuDetail.transformations[1].image, ki: '6 Billion' },
        { id: 3, name: 'Goku SSJ3', image: 'https://dragonball-api.com/transformaciones/ssj3.webp', ki: '24 Billion' },
      ],
    };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(threeTransformations));
    vi.stubGlobal('fetch', fetchMock);

    renderTransformation(1, 2);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Goku SSJ2' })).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /← Goku SSJ$/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Goku SSJ3 →/ })).toBeInTheDocument();
  });

  it('offers only Previous on the last transformation', async () => {
    const threeTransformations: CharacterDetail = {
      ...gokuDetail,
      transformations: [
        { id: 1, name: 'Goku SSJ', image: gokuDetail.transformations[0].image, ki: '3 Billion' },
        { id: 2, name: 'Goku SSJ2', image: gokuDetail.transformations[1].image, ki: '6 Billion' },
        { id: 3, name: 'Goku SSJ3', image: 'https://dragonball-api.com/transformaciones/ssj3.webp', ki: '24 Billion' },
      ],
    };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(threeTransformations));
    vi.stubGlobal('fetch', fetchMock);

    renderTransformation(1, 3);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Goku SSJ3' })).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /← Goku SSJ2/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /→$/ })).not.toBeInTheDocument();
  });

  it('offers neither Previous nor Next when the character has a single transformation', async () => {
    const oneTransformation: CharacterDetail = {
      ...gokuDetail,
      transformations: [
        { id: 1, name: 'Goku SSJ', image: gokuDetail.transformations[0].image, ki: '3 Billion' },
      ],
    };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(oneTransformation));
    vi.stubGlobal('fetch', fetchMock);

    renderTransformation(1, 1);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Goku SSJ' })).toBeInTheDocument());
    expect(screen.queryByRole('link', { name: /^← Goku/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /→$/ })).not.toBeInTheDocument();
  });

  it('does not repeat the character fetch when navigating to a sibling transformation', async () => {
    vi.stubGlobal('fetch', mockDragonBallFetch());
    const user = userEvent.setup();
    renderTransformation(1, 1);

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Goku SSJ' })).toBeInTheDocument());
    const fetchCallsAfterFirstLoad = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.length;

    await user.click(screen.getByRole('link', { name: /Goku SSJ2 →/ }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Goku SSJ2' })).toBeInTheDocument());

    expect((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(
      fetchCallsAfterFirstLoad
    );
  });
});
