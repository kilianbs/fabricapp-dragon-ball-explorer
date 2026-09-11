import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { CharacterCard } from '@/components/CharacterCard';
import { characterGoku } from './testUtils/dragonballFixtures';

describe('CharacterCard', () => {
  it('shows image, name, race, gender, ki, max ki and affiliation, all behind one link', () => {
    render(
      <MemoryRouter>
        <CharacterCard character={characterGoku} />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /Goku/ });
    expect(link).toHaveAttribute('href', '/characters/1');
    expect(screen.getByRole('img', { name: 'Goku' })).toHaveAttribute('src', characterGoku.image);
    expect(screen.getByText('Goku')).toBeInTheDocument();
    expect(screen.getByText('Saiyan - Male')).toBeInTheDocument();
    expect(screen.getByText(characterGoku.ki)).toBeInTheDocument();
    expect(screen.getByText(characterGoku.maxKi)).toBeInTheDocument();
    expect(screen.getByText(characterGoku.affiliation)).toBeInTheDocument();
  });

  it('stays selectable and keeps showing every other field when the image fails to load', () => {
    render(
      <MemoryRouter>
        <CharacterCard character={characterGoku} />
      </MemoryRouter>
    );

    const img = screen.getByRole('img', { name: 'Goku' });
    fireEvent.error(img);

    const link = screen.getByRole('link', { name: /Goku/ });
    expect(link).toHaveAttribute('href', '/characters/1');
    expect(screen.getByText('Goku')).toBeInTheDocument();
    expect(screen.getByText('Saiyan - Male')).toBeInTheDocument();
    expect(screen.getByText(characterGoku.ki)).toBeInTheDocument();
    expect(screen.getByText(characterGoku.maxKi)).toBeInTheDocument();
    expect(screen.getByText(characterGoku.affiliation)).toBeInTheDocument();
  });
});
