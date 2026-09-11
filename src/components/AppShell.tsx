import { Outlet } from 'react-router-dom';

import { CatalogNav } from '@/components/CatalogNav';
import { DragonBallCatalogProvider } from '@/hooks/DragonBallCatalogContext';

/**
 * Layout for every authenticated view. Owns the catalog provider so the
 * characters and planets collections are fetched once, right after sign-in,
 * and shared by every page nested under it.
 */
export function AppShell() {
  return (
    <DragonBallCatalogProvider>
      <div className="min-h-screen bg-white">
        <CatalogNav />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </DragonBallCatalogProvider>
  );
}
