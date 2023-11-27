import React, { useEffect, useState } from 'react';
import axios from "axios";
import { CoinList } from "../config/api";
import { useCryptoState } from '../CryptoContext';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Container } from '@mui/system';
import { LinearProgress, Pagination, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useNavigate } from "react-router-dom";

export function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


const CoinsTable = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currency, symbol } = useCryptoState();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const fetchCoins = async () => {
    setLoading(true);
    const { data } = await axios.get(CoinList(currency));
    // console.log(data);

    setCoins(data);
    setLoading(false);
  };

  console.log(coins);

  useEffect(() => {
    fetchCoins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency]);

  const darkTheme = createTheme({
    palette: {
      primary: {
        main: '#fff',
      },
      mode: 'dark',
    },
  });

  const handleSearch = () => {
    return coins.filter(
      (coin) =>
        coin.name.toLowerCase().includes(search) ||
        coin.symbol.toLowerCase().includes(search)
    );
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Container sx={{textAlign:"center"}}>
        <Typography variant='h4' sx={{margin:'18px', fontFamily:'Montserrat'}}>
          Cryptocurrency prices by Market Cap
        </Typography>
        <TextField variant='outlined' label='Search for Crypto Currency....' sx={{width:'100%', marginBottom:'20px'}} onChange={(e) => setSearch(e.target.value)}/>
        <TableContainer>
          {
            loading ? ( <LinearProgress sx={{backgroundColor: "gold"}}/> ) : 
            (
              <Table>
                <TableHead sx={{backgroundColor:"#EEBC1D"}}>
                  <TableRow>
                    {["Coin", "Price", "24h Change", "Market Cap"].map((head) => (
                      <TableCell sx={{color:"black", fontWeight:"700", fontFamily:"Montserrat"}} key={head} align={head === "Coin" ? "" : 'right'}>
                        {head}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                      {handleSearch()
                      .slice((page-1)*10, (page-1)*10+10)
                      .map((row) => {
                        const profit = row.price_change_percentage_24h > 0;
                        return (
                          <TableRow
                            onClick = {()=>navigate(`/coins/${row.id}`)}
                            sx={{
                              backgroundColor: "#16171a",
                              cursor: "pointer",
                              fontFamily: "Montserrat",
                              "&:hover": {
                                backgroundColor: "#131111",
                              },
                            }}
                            
                            key={row.name}
                          >
                            <TableCell component='th' scope='row'
                              sx={{
                                display:"flex",
                                gap:"15px"
                              }}
                            >
                              <img
                                src={row?.image}
                                alt={row.name}
                                height="50px"
                                sx={{marginBottom:'10px'}}
                              />
                              <div style={{display:"flex", flexDirection:"column"}}>
                                <span style={{textTransform:"uppercase", fontSize:"22px"}}>{row.symbol}</span>
                                <span style={{color:"darkgrey"}}>{row.name}</span>
                              </div>      
                            </TableCell>
                            
                            <TableCell align='right'>
                              {symbol}{" "}
                              {numberWithCommas(row.current_price.toFixed(2))}      
                            </TableCell>
                            
                            <TableCell align='right' sx={{
                              color : profit ? "rgb(14, 203, 129)" : "red",
                              fontWeight: '500',
                            }}>
                              { profit && "+"}
                              {row.price_change_percentage_24h.toFixed(2)}%
                            </TableCell>

                            <TableCell align='right'>
                              {symbol}{" "}
                              {numberWithCommas(
                                row.market_cap.toString().slice(0, -6)
                              )}
                              M
                            </TableCell>

                          </TableRow>
                        )
                      })}
                </TableBody>
              </Table>
            )
          }
        </TableContainer>
        <Pagination
          sx={{
            padding:'20px',
            width:'100%',
            display:'flex',
            justifyContent:'center',
            "& .MuiPaginationItem-root" : {
              color:'gold',
            },
          }}
          count={(handleSearch()?.length / 10).toFixed(0)}
          onChange={( _, value) => {
            setPage(value);
            window.scroll(0, 450);
          }}
        />
      </Container>
    </ThemeProvider>
  )
}

export default CoinsTable