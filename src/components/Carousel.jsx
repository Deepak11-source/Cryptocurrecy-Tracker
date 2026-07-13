import './Carousel.css';
import { TrendingCoins } from '../config/api';
import { useCryptoState } from '../CryptoContext';
import useFetch from '../hooks/useFetch';
import formatNumber from '../utils/formatNumber';
import AliceCarousel from 'react-alice-carousel';
import { Link } from 'react-router-dom';
import { Typography } from '@mui/material';

const Carousel = () => {
  const { currency, symbol } = useCryptoState();
  const { data: trending, loading, error } = useFetch(TrendingCoins(currency));

  if (error) {
    return (
      <Typography sx={{ color: 'red', textAlign: 'center' }}>
        Couldn&apos;t load trending coins. Please try again later.
      </Typography>
    );
  }

  if (loading || !trending) {
    return null;
  }

  const items = trending.map((coin) => {
    let profit = coin.price_change_percentage_24h >= 0;
    return (
      <Link className="carouselItem" to={`/coins/${coin.id}`} key={coin.id}>
        <img
          src={coin?.image}
          alt={coin.name}
          height="80"
          style={{ marginBottom: 10 }}
        />
        <span>
          {coin?.symbol}
          &nbsp;
          <span
            style={{
              color: profit > 0 ? 'rgb(14, 203, 129)' : 'red',
              fontWeight: 500,
            }}
          >
            {profit && '+'}
            {coin?.price_change_percentage_24h?.toFixed(2)}%
          </span>
        </span>
        <span style={{ fontSize: 22, fontWeight: 500 }}>
          {symbol} {formatNumber(coin?.current_price.toFixed(2))}
        </span>
      </Link>
    );
  });

  const responsive = {
    0: {
      items: 2,
    },
    512: {
      items: 4,
    },
  };

  return (
    <div className="carousel">
      <AliceCarousel
        mouseTracking
        infinite
        autoPlayInterval={1000}
        animationDuration={1500}
        disableDotsControls
        disableButtonsControls
        responsive={responsive}
        autoPlay
        items={items}
      />
    </div>
  );
};

export default Carousel;
