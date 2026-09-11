import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthPage } from '@/components/AuthPage';
import { AppShell } from '@/components/AppShell';
import { useAuth } from '@/hooks/AuthContext';
import { CharacterDetailPage } from '@/pages/CharacterDetailPage';
import { CharactersPage } from '@/pages/CharactersPage';
import { PlanetDetailPage } from '@/pages/PlanetDetailPage';
import { PlanetsPage } from '@/pages/PlanetsPage';
import { TransformationDetailPage } from '@/pages/TransformationDetailPage';

function AuthGuard({
  children,
  requireAuth,
}: {
  children: React.ReactNode;
  requireAuth: boolean;
}) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Cargando…</div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) return <Navigate to="/auth" replace />;
  if (!requireAuth && isAuthenticated) return <Navigate to="/" replace />;

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={
            <AuthGuard requireAuth={false}>
              <AuthPage />
            </AuthGuard>
          }
        />
        {/* ensure all new routes require auth */}
        <Route
          element={
            <AuthGuard requireAuth={true}>
              <AppShell />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate to="/characters" replace />} />
          <Route path="characters" element={<CharactersPage />} />
          <Route path="characters/:id" element={<CharacterDetailPage />} />
          <Route
            path="characters/:characterId/transformations/:transformationId"
            element={<TransformationDetailPage />}
          />
          <Route path="planets" element={<PlanetsPage />} />
          <Route path="planets/:id" element={<PlanetDetailPage />} />
          <Route path="*" element={<Navigate to="/characters" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
