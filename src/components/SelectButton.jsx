import React from 'react';
import { styled } from "@mui/system";

const SelectButton = ({ children, selected, onClick }) => {
    
    const SelectButton = styled("span")(({ selected }) => ({
        border: "1px solid gold",
        borderRadius: 5,
        padding: 10,
        paddingLeft: 20,
        paddingRight: 20,
        fontFamily: "Montserrat",
        cursor: "pointer",
        backgroundColor: selected ? "gold" : "",
        color: selected ? "black" : "",
        fontWeight: selected ? 700 : 500,
        margin:'10px',
        "&:hover": {
          backgroundColor: "gold",
          color: "black",
        },
        width: "22%",
      }));

  return (
    <SelectButton onClick={onClick}>
        {children}
    </SelectButton>
  )
}

export default SelectButton