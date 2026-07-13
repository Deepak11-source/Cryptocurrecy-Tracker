import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CoinsTable from './CoinsTable';
import CryptoContext from '../CryptoContext';
import useFetch from '../hooks/useFetch';

vi.mock('../hooks/useFetch');

const MOCK_COINS = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'btc',
    image: 'bitcoin.png',
    current_price: 50000,
    price_change_percentage_24h: 2.5,
    market_cap: 900000000000,
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'eth',
    image: 'ethereum.png',
    current_price: 3000,
    price_change_percentage_24h: -1.2,
    market_cap: 400000000000,
  },
];

function renderTable() {
  return render(
    <MemoryRouter>
      <CryptoContext>
        <CoinsTable />
      </CryptoContext>
    </MemoryRouter>
  );
}

afterEach(() => {
  vi.resetAllMocks();
  cleanup();
});

describe('CoinsTable', () => {
  it('renders a row per coin once loaded', () => {
    useFetch.mockReturnValue({ data: MOCK_COINS, loading: false, error: null });
    renderTable();
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
  });

  it('filters rows via the search box', async () => {
    useFetch.mockReturnValue({ data: MOCK_COINS, loading: false, error: null });
    renderTable();
    const user = userEvent.setup();
    await user.type(
      screen.getByLabelText('Search for Crypto Currency....'),
      'bitcoin'
    );
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.queryByText('Ethereum')).not.toBeInTheDocument();
  });

  it('shows an error message when the fetch fails', () => {
    useFetch.mockReturnValue({
      data: null,
      loading: false,
      error: new Error('network down'),
    });
    renderTable();
    expect(
      screen.getByText("Couldn't load coin prices. Please try again later.")
    ).toBeInTheDocument();
  });
});
