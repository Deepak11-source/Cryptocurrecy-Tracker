
import React, { useEffect, useState, useRef } from 'react';
import { useCryptoState } from '../CryptoContext';
import axios from 'axios';
import { HistoricalChart } from '../config/api';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CircularProgress } from '@mui/material';
import Chart from 'chart.js/auto';  // Updated import
import { chartDays } from '../config/Chartdata';
import SelectButton from './SelectButton';
import { styled } from '@mui/system';

const CoinInfo = ({ coin }) => {
  const [historicData, setHistoricData] = useState();
  const [days, setDays] = useState(1);
  const { currency } = useCryptoState();
  const [flag, setFlag] = useState(false);

  const chartRef = useRef(null);

  const fetchHistoricData = async () => {
    if (coin) {
      const { data } = await axios.get(HistoricalChart(coin.id, days, currency));
      setHistoricData(data.prices);
    }
  };

  const createChart = () => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: historicData.map((coin) => {
            let date = new Date(coin[0]);
            let time =
              date.getHours() > 12
                ? `${date.getHours() - 12}:${date.getMinutes()} PM`
                : `${date.getHours()}:${date.getMinutes()} AM`;
            return days === 1 ? time : date.toLocaleDateString();
          }),
          datasets: [
            {
              data: historicData.map((coin) => coin[1]),
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
    }
  };

  useEffect(() => {
    fetchHistoricData();
    setFlag(true);
  }, [coin, currency, days]);

  useEffect(() => {
    if (historicData && flag) {
      createChart();
    }
  }, [historicData, flag, days]);

  const darkTheme = createTheme({
    palette: {
      primary: {
        main: '#fff',
      },
      mode: 'dark',
    },
  });

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

  return (
    <ThemeProvider theme={darkTheme}>
      <Container>
        {!historicData || flag === false ? (
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
                  onClick={() => {
                    setDays(day.value);
                    setFlag(false);
                  }}
                  selected={day.value === days}
                >
                  {day.label}
                </SelectButton>
              ))}
            </div>
          </>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default CoinInfo;
