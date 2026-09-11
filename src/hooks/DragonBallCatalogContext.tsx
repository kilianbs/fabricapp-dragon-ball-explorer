import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { fetchAllCharacters, fetchAllPlanets } from '@/services/dragonball/dragonballApi';
import type { CharacterSummary, PlanetSummary } from '@/services/dragonball/types';

interface DragonBallCatalogValue {
  characters: CharacterSummary[];
  planets: PlanetSummary[];
  /** True while the initial load (or a retry after failure) is in flight. */
  loading: boolean;
  /** Set when the load failed; cleared automatically on a successful retry. */
  error: string | null;
  /** Re-runs the load. Safe to call repeatedly; concurrent calls collapse into one. */
  retry: () => void;
}

const DragonBallCatalogContext = createContext<DragonBallCatalogValue | undefined>(
  undefined
);

export function DragonBallCatalogProvider({ children }: { children: ReactNode }) {
  const [characters, setCharacters] = useState<CharacterSummary[]>([]);
  const [planets, setPlanets] = useState<PlanetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef<Promise<void> | null>(null);

  const load = useCallback(() => {
    if (inFlight.current) {
      return inFlight.current;
    }
    setLoading(true);
    setError(null);
    const run = Promise.all([fetchAllCharacters(), fetchAllPlanets()])
      .then(([characterData, planetData]) => {
        setCharacters(characterData);
        setPlanets(planetData);
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : 'No se ha podido cargar el catálogo.';
        setError(message);
      })
      .finally(() => {
        setLoading(false);
        inFlight.current = null;
      });
    inFlight.current = run;
    return run;
  }, []);

  useEffect(() => {
    void load();
    // Load once on mount; `retry` re-invokes `load` explicitly afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retry = useCallback(() => {
    void load();
  }, [load]);

  const value = useMemo<DragonBallCatalogValue>(
    () => ({ characters, planets, loading, error, retry }),
    [characters, planets, loading, error, retry]
  );

  return (
    <DragonBallCatalogContext.Provider value={value}>
      {children}
    </DragonBallCatalogContext.Provider>
  );
}

export function useDragonBallCatalog(): DragonBallCatalogValue {
  const context = useContext(DragonBallCatalogContext);
  if (context === undefined) {
    throw new Error(
      'useDragonBallCatalog must be used within a DragonBallCatalogProvider'
    );
  }
  return context;
}
