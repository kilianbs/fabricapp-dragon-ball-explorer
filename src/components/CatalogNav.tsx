import { NavLink } from 'react-router-dom';

import { useAuth } from '@/hooks/AuthContext';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
  }`;

/**
 * Persistent header shown on every authenticated view: lets the user jump
 * between the two catalogs from anywhere, including a detail page, without
 * relying on the browser's Back button.
 */
export function CatalogNav() {
  const { signOut } = useAuth();

  return (
    <header className="border-b border-gray-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2" aria-label="Catálogos">
          <NavLink to="/characters" className={linkClass}>
            Personajes
          </NavLink>
          <NavLink to="/planets" className={linkClass}>
            Planetas
          </NavLink>
        </nav>
        <button
          type="button"
          onClick={() => void signOut()}
          className="text-xs text-gray-300 transition-colors hover:text-gray-500"
          aria-label="Cerrar sesión"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
