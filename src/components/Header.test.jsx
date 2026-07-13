import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import CryptoContext from '../CryptoContext';

afterEach(() => {
  cleanup();
});

function renderHeader() {
  return render(
    <MemoryRouter>
      <CryptoContext>
        <Header />
      </CryptoContext>
    </MemoryRouter>
  );
}

describe('Header', () => {
  it('renders the app title and defaults to INR', () => {
    renderHeader();
    expect(screen.getByText('CryptoTracker')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveTextContent('INR');
  });

  it('switches currency to USD when selected', async () => {
    renderHeader();
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'USD' }));
    expect(screen.getByRole('combobox')).toHaveTextContent('USD');
  });
});
