import React from "react";
import { Container, Typography } from "@mui/material";
import './Banner.css'
import Carousel from "./Carousel";
const Banner = () => {
  return (
    <div className="bg">
      <Container
        sx={{
          height: "400px",
          display: "flex",
          flexDirection: "column",
          paddingTop: "25px",
          justifyContent: "space-around",
        }}
      >
        <div className="tagLine">
            <Typography
            variant="h2"
            sx={{
                fontWeight: "bold",
                marginBottom: "15px",
                fontFamily: "Montserrat",
            }}
            >
                Crypto Tracker
            </Typography>
            <Typography
            variant='subtitle2'
            sx={{
                color: "darkgrey",
                textTransform: "capitalize",
                fontFamily: "Montserrat",
            }}
            >
                Get all the Info regarding your favorite Crypto Currency
            </Typography>
        </div>
        <Carousel/>
      </Container>
    </div>
  );
};

export default Banner;
