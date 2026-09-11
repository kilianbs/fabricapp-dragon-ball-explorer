import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from '@/App';
import { AuthProvider } from '@/hooks/AuthContext';
import type { IAuthService } from '@/services/IAuthService';
import { mockDragonBallFetch } from './testUtils/dragonballFixtures';

const authenticatedStub: IAuthService = {
  fabricAuthEnabled: false,
  async signIn() {
    return { id: 'u1', email: 'dev@contoso.com', name: 'dev' };
  },
  async signOut() {},
  async getCurrentUser() {
    return { id: 'u1', email: 'dev@contoso.com', name: 'dev' };
  },
  async initEmbeddedAuth() {
    return null;
  },
};

function renderAppAt(path: string) {
  window.history.pushState({}, '', path);
  return render(
    <AuthProvider authService={authenticatedStub}>
      <App />
    </AuthProvider>
  );
}

async function back() {
  await act(async () => {
    window.history.back();
    // Let the popstate event and the resulting re-render settle.
    await Promise.resolve();
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('App routing (authenticated)', () => {
  it('redirects the root to the character catalog', async () => {
    vi.stubGlobal('fetch', mockDragonBallFetch());
    renderAppAt('/');

    await waitFor(() => expect(screen.getByText('Goku')).toBeInTheDocument());
    expect(window.location.pathname).toBe('/characters');
  });

  it('redirects an unknown address to the character catalog instead of a blank screen', async () => {
    vi.stubGlobal('fetch', mockDragonBallFetch());
    renderAppAt('/does-not-exist');

    await waitFor(() => expect(screen.getByText('Goku')).toBeInTheDocument());
    expect(window.location.pathname).toBe('/characters');
  });

  it('returns to the originating catalog when Back is used after opening a ficha', async () => {
    vi.stubGlobal('fetch', mockDragonBallFetch());
    renderAppAt('/characters');
    await waitFor(() => expect(screen.getByText('Goku')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('link', { name: /Goku/ }));
    await waitFor(() => expect(window.location.pathname).toBe('/characters/1'));

    await back();
    await waitFor(() => expect(window.location.pathname).toBe('/characters'));
  });

  it('switches catalogs from the persistent nav, marking the active one', async () => {
    vi.stubGlobal('fetch', mockDragonBallFetch());
    renderAppAt('/characters');
    await waitFor(() => expect(screen.getByText('Goku')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('link', { name: 'Planetas' }));

    await waitFor(() => expect(screen.getByText('Tierra')).toBeInTheDocument());
    expect(screen.getByRole('link', { name: 'Planetas' })).toHaveClass('bg-gray-900');
    expect(screen.getByRole('link', { name: 'Personajes' })).not.toHaveClass('bg-gray-900');
  });

  it('completes the character -> planet -> character round trip via the cross links', async () => {
    vi.stubGlobal('fetch', mockDragonBallFetch());
    renderAppAt('/characters/1'); // Goku
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Goku' })).toBeInTheDocument());

    await userEvent.click(await screen.findByRole('link', { name: 'Tierra' }));
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Tierra' })).toBeInTheDocument()
    );

    await userEvent.click(await screen.findByRole('link', { name: /Goku/ }));
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Goku' })).toBeInTheDocument()
    );

    // Back should retrace the exact path just taken: Tierra, then the
    // original Goku ficha.
    await back();
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Tierra' })).toBeInTheDocument()
    );
    await back();
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Goku' })).toBeInTheDocument()
    );
  });

  it('opens a direct address to a transformation ficha while authenticated', async () => {
    vi.stubGlobal('fetch', mockDragonBallFetch());
    renderAppAt('/characters/1/transformations/1');

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Goku SSJ' })).toBeInTheDocument()
    );
  });

  it('returns to the character ficha when Back is used after opening a transformation', async () => {
    vi.stubGlobal('fetch', mockDragonBallFetch());
    renderAppAt('/characters/1');
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Goku' })).toBeInTheDocument());

    await userEvent.click(await screen.findByRole('link', { name: /^Goku SSJ Goku SSJ/ }));
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Goku SSJ' })).toBeInTheDocument()
    );

    await back();
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Goku' })).toBeInTheDocument());
  });
});
