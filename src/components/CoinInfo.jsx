import { useEffect, useRef, useState } from 'react';
import { useCryptoState } from '../CryptoContext';
import { HistoricalChart } from '../config/api';
import { CircularProgress, Typography } from '@mui/material';
import Chart from 'chart.js/auto';
import { chartDays } from '../config/Chartdata';
import SelectButton from './SelectButton';
import { styled } from '@mui/system';
import useFetch from '../hooks/useFetch';

const Container = styled('div')({
  width: '75%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 25,
  padding: 40,
  '@media (max-width: 960px)': {
    width: '100%',
    marginTop: 0,
    padding: 20,
    paddingTop: 0,
  },
});

const CoinInfo = ({ coin }) => {
  const [days, setDays] = useState(1);
  const { currency } = useCryptoState();
  const chartRef = useRef(null);

  const {
    data: historicChart,
    loading,
    error,
  } = useFetch(coin ? HistoricalChart(coin.id, days, currency) : null);
  const historicData = historicChart?.prices;

  useEffect(() => {
    if (!chartRef.current || !historicData) return;

    const ctx = chartRef.current.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: historicData.map((entry) => {
          const date = new Date(entry[0]);
          const time =
            date.getHours() > 12
              ? `${date.getHours() - 12}:${date.getMinutes()} PM`
              : `${date.getHours()}:${date.getMinutes()} AM`;
          return days === 1 ? time : date.toLocaleDateString();
        }),
        datasets: [
          {
            data: historicData.map((entry) => entry[1]),
            label: `Price (Past ${days} Days) in ${currency}`,
            borderColor: '#EEBC1D',
          },
        ],
      },
      options: {
        elements: {
          point: {
            radius: 1,
          },
        },
      },
    });

    return () => chart.destroy();
  }, [historicData, days, currency]);

  if (error) {
    return (
      <Container>
        <Typography sx={{ color: 'red' }}>
          Couldn&apos;t load the price chart. Please try again later.
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      {loading || !historicData ? (
        <CircularProgress style={{ color: 'gold' }} size={250} thickness={1} />
      ) : (
        <>
          <canvas ref={chartRef} width="400" height="180"></canvas>
          <div
            style={{
              display: 'flex',
              marginTop: 20,
              justifyContent: 'space-around',
              width: '100%',
            }}
          >
            {chartDays.map((day) => (
              <SelectButton
                key={day.value}
                onClick={() => setDays(day.value)}
                selected={day.value === days}
              >
                {day.label}
              </SelectButton>
            ))}
          </div>
        </>
      )}
    </Container>
  );
};

export default CoinInfo;
