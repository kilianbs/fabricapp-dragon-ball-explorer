import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';

describe('shared view states', () => {
  it('LoadingState shows its label', () => {
    render(<LoadingState label="Cargando personajes…" />);
    expect(screen.getByText('Cargando personajes…')).toBeInTheDocument();
  });

  it('ErrorState invokes retry when its control is used', async () => {
    const onRetry = vi.fn();
    render(<ErrorState message="No se han podido cargar los datos." onRetry={onRetry} />);

    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('EmptyState invokes its action when provided', async () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        message="Sin resultados"
        actionLabel="Limpiar búsqueda"
        onAction={onAction}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
