import React, { useEffect, useState } from "react";
import { useCryptoState } from "../CryptoContext";
import { useParams } from "react-router-dom";
import { SingleCoin } from "../config/api";
import axios from "axios";
import CoinInfo from "../components/CoinInfo";
import DOMPurify from "dompurify";
import { styled } from "@mui/system";
import { Typography } from "@mui/material";

export function numberWithCommas(x) {
  const parsedNumber = parseFloat(x);
  if (isNaN(parsedNumber)) {
    return "Invalid Number";
  }
  return parsedNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const CP = () => {
  const { id } = useParams();
  const [coin, setCoin] = useState();
  const { currency, symbol } = useCryptoState();

  const fetchCoin = async () => {
    const { data } = await axios.get(SingleCoin(id));

    setCoin(data);
  };

  useEffect(() => {
    fetchCoin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency]);

  const StyledDiv = styled("div")({
    display: "flex",
    "@media (max-width: 960px)": {
      flexDirection: "column",
      alignItems: "center",
    },
  });

  const SidebarDiv = styled("div")({
    width: "30%",
    "@media (max-width: 960px)": {
      width: "100%",
    },
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: 25,
    borderRight: "2px solid grey",
  });

  const MarketDataDiv = styled("div")({
    alignSelf: "start",
    padding: 25,
    paddingTop: 10,
    width: "100%",
    "@media (max-width: 960px)": {
      display: "flex",
      justifyContent: "space-around",
    },
    "@media (max-width: 600px)": {
      flexDirection: "column",
      alignItems: "center",
    },
    "@media (max-width: 400px)": {
      alignItems: "start",
    },
  });

  return (
    <StyledDiv>
      <SidebarDiv>
        <img
          src={coin?.image.large}
          alt={coin?.name}
          height="200px"
          style={{ marginBottom: "20px" }}
        />
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            marginBottom: "20px",
            fontFamily: "Montserrat",
          }}
        >
          {coin?.name}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            width: "100%",
            fontFamily: "Montserrat",
            padding: "25px",
            paddingBottom: "15px",
            paddingTop: "0",
            textAlign: "justify",
          }}
        >
          {coin?.description.en.split(". ")[0] && (
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(coin.description.en.split(". ")[0]),
              }}
            />
          )}
        </Typography>

        <MarketDataDiv>
          <span style={{ display: "flex" }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                marginBottom: "20px",
                fontFamily: "Montserrat",
              }}
            >
              Rank:
            </Typography>
            &nbsp; &nbsp;
            <Typography
              variant="h5"
              style={{
                fontFamily: "Montserrat",
              }}
            >
              {numberWithCommas(coin?.market_cap_rank)}
            </Typography>
          </span>

          <span style={{ display: "flex" }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                marginBottom: "20px",
                fontFamily: "Montserrat",
              }}
            >
              Current Price:
            </Typography>
            &nbsp; &nbsp;
            <Typography
              variant="h5"
              style={{
                fontFamily: "Montserrat",
              }}
            >
              {symbol}{" "}
              {coin?.market_data.current_price[currency.toLowerCase()] !==
              undefined
                ? numberWithCommas(
                    coin?.market_data.current_price[currency.toLowerCase()]
                  )
                : "N/A"}
            </Typography>
          </span>
          <span style={{ display: "flex" }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                marginBottom: "20px",
                fontFamily: "Montserrat",
              }}
            >
              Market Cap:
            </Typography>
            &nbsp; &nbsp;
            <Typography
              variant="h5"
              style={{
                fontFamily: "Montserrat",
              }}
            >
              {symbol}{" "}
              {coin?.market_data.market_cap[currency.toLowerCase()] !==
              undefined
                ? numberWithCommas(
                    coin?.market_data.market_cap[currency.toLowerCase()]
                      .toString()
                      .slice(0, -6)
                  )
                : "N/A"}{" "}
              M
            </Typography>
          </span>
        </MarketDataDiv>
      </SidebarDiv>
      {/* CHART */}
      <CoinInfo coin={coin} />
    </StyledDiv>
  );
};

export default CP;
