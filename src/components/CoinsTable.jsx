import { useState } from 'react';
import { CoinList } from '../config/api';
import { useCryptoState } from '../CryptoContext';
import { Container } from '@mui/system';
import {
  LinearProgress,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import formatNumber from '../utils/formatNumber';

const CoinsTable = () => {
  const { currency, symbol } = useCryptoState();
  const { data: coins, loading, error } = useFetch(CoinList(currency));
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!coins) return [];
    return coins.filter(
      (coin) =>
        coin.name.toLowerCase().includes(search) ||
        coin.symbol.toLowerCase().includes(search)
    );
  };

  const filtered = handleSearch();

  return (
    <Container sx={{ textAlign: 'center' }}>
      <Typography
        variant="h4"
        sx={{ margin: '18px', fontFamily: 'Montserrat' }}
      >
        Cryptocurrency prices by Market Cap
      </Typography>
      <TextField
        variant="outlined"
        label="Search for Crypto Currency...."
        sx={{ width: '100%', marginBottom: '20px' }}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />
      {error ? (
        <Typography sx={{ color: 'red', margin: '20px' }}>
          Couldn&apos;t load coin prices. Please try again later.
        </Typography>
      ) : (
        <TableContainer>
          {loading ? (
            <LinearProgress sx={{ backgroundColor: 'gold' }} />
          ) : (
            <Table>
              <TableHead sx={{ backgroundColor: '#EEBC1D' }}>
                <TableRow>
                  {['Coin', 'Price', '24h Change', 'Market Cap'].map((head) => (
                    <TableCell
                      sx={{
                        color: 'black',
                        fontWeight: '700',
                        fontFamily: 'Montserrat',
                      }}
                      key={head}
                      align={head === 'Coin' ? '' : 'right'}
                    >
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered
                  .slice((page - 1) * 10, (page - 1) * 10 + 10)
                  .map((row) => {
                    const profit = row.price_change_percentage_24h > 0;
                    return (
                      <TableRow
                        onClick={() => navigate(`/coins/${row.id}`)}
                        sx={{
                          backgroundColor: '#16171a',
                          cursor: 'pointer',
                          fontFamily: 'Montserrat',
                          '&:hover': {
                            backgroundColor: '#131111',
                          },
                        }}
                        key={row.name}
                      >
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{
                            display: 'flex',
                            gap: '15px',
                          }}
                        >
                          <img
                            src={row?.image}
                            alt={row.name}
                            height="50px"
                            style={{ marginBottom: '10px' }}
                          />
                          <div
                            style={{ display: 'flex', flexDirection: 'column' }}
                          >
                            <span
                              style={{
                                textTransform: 'uppercase',
                                fontSize: '22px',
                              }}
                            >
                              {row.symbol}
                            </span>
                            <span style={{ color: 'darkgrey' }}>
                              {row.name}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell align="right">
                          {symbol}{' '}
                          {row.current_price != null
                            ? formatNumber(row.current_price.toFixed(2))
                            : 'N/A'}
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            color: profit ? 'rgb(14, 203, 129)' : 'red',
                            fontWeight: '500',
                          }}
                        >
                          {row.price_change_percentage_24h != null ? (
                            <>
                              {profit && '+'}
                              {row.price_change_percentage_24h.toFixed(2)}%
                            </>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>

                        <TableCell align="right">
                          {symbol}{' '}
                          {row.market_cap != null
                            ? `${formatNumber(
                                row.market_cap.toString().slice(0, -6)
                              )}M`
                            : 'N/A'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      )}
      <Pagination
        sx={{
          padding: '20px',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          '& .MuiPaginationItem-root': {
            color: 'gold',
          },
        }}
        page={page}
        count={Math.ceil(filtered.length / 10)}
        onChange={(_, value) => {
          setPage(value);
          window.scroll(0, 450);
        }}
      />
    </Container>
  );
};

export default CoinsTable;
