import { useCryptoState } from '../CryptoContext';
import { useParams } from 'react-router-dom';
import { SingleCoin } from '../config/api';
import CoinInfo from '../components/CoinInfo';
import DOMPurify from 'dompurify';
import { styled } from '@mui/system';
import { CircularProgress, Typography } from '@mui/material';
import useFetch from '../hooks/useFetch';
import formatNumber from '../utils/formatNumber';

const StyledDiv = styled('div')({
  display: 'flex',
  '@media (max-width: 960px)': {
    flexDirection: 'column',
    alignItems: 'center',
  },
});

const SidebarDiv = styled('div')({
  width: '30%',
  '@media (max-width: 960px)': {
    width: '100%',
  },
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: 25,
  borderRight: '2px solid grey',
});

const MarketDataDiv = styled('div')({
  alignSelf: 'start',
  padding: 25,
  paddingTop: 10,
  width: '100%',
  '@media (max-width: 960px)': {
    display: 'flex',
    justifyContent: 'space-around',
  },
  '@media (max-width: 600px)': {
    flexDirection: 'column',
    alignItems: 'center',
  },
  '@media (max-width: 400px)': {
    alignItems: 'start',
  },
});

const CP = () => {
  const { id } = useParams();
  const { currency, symbol } = useCryptoState();
  const { data: coin, loading, error } = useFetch(SingleCoin(id));

  if (error) {
    return (
      <Typography sx={{ color: 'red', textAlign: 'center', marginTop: '40px' }}>
        Couldn&apos;t load this coin. Please try again later.
      </Typography>
    );
  }

  if (loading || !coin) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
        <CircularProgress style={{ color: 'gold' }} size={100} thickness={2} />
      </div>
    );
  }

  return (
    <StyledDiv>
      <SidebarDiv>
        <img
          src={coin?.image.large}
          alt={coin?.name}
          height="200px"
          style={{ marginBottom: '20px' }}
        />
        <Typography
          variant="h3"
          sx={{
            fontWeight: 'bold',
            marginBottom: '20px',
            fontFamily: 'Montserrat',
          }}
        >
          {coin?.name}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            width: '100%',
            fontFamily: 'Montserrat',
            padding: '25px',
            paddingBottom: '15px',
            paddingTop: '0',
            textAlign: 'justify',
          }}
        >
          {coin?.description.en.split('. ')[0] && (
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(coin.description.en.split('. ')[0]),
              }}
            />
          )}
        </Typography>

        <MarketDataDiv>
          <span style={{ display: 'flex' }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                marginBottom: '20px',
                fontFamily: 'Montserrat',
              }}
            >
              Rank:
            </Typography>
            &nbsp; &nbsp;
            <Typography variant="h5" style={{ fontFamily: 'Montserrat' }}>
              {formatNumber(coin?.market_cap_rank)}
            </Typography>
          </span>

          <span style={{ display: 'flex' }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                marginBottom: '20px',
                fontFamily: 'Montserrat',
              }}
            >
              Current Price:
            </Typography>
            &nbsp; &nbsp;
            <Typography variant="h5" style={{ fontFamily: 'Montserrat' }}>
              {symbol}{' '}
              {coin?.market_data.current_price[currency.toLowerCase()] !==
              undefined
                ? formatNumber(
                    coin?.market_data.current_price[currency.toLowerCase()]
                  )
                : 'N/A'}
            </Typography>
          </span>
          <span style={{ display: 'flex' }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                marginBottom: '20px',
                fontFamily: 'Montserrat',
              }}
            >
              Market Cap:
            </Typography>
            &nbsp; &nbsp;
            <Typography variant="h5" style={{ fontFamily: 'Montserrat' }}>
              {symbol}{' '}
              {coin?.market_data.market_cap[currency.toLowerCase()] !==
              undefined
                ? formatNumber(
                    coin?.market_data.market_cap[currency.toLowerCase()]
                      .toString()
                      .slice(0, -6)
                  )
                : 'N/A'}{' '}
              M
            </Typography>
          </span>
        </MarketDataDiv>
      </SidebarDiv>
      <CoinInfo coin={coin} />
    </StyledDiv>
  );
};

export default CP;
