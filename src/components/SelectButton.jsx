import { styled } from '@mui/system';

const StyledSelectButton = styled('span')(({ selected }) => ({
  border: '1px solid gold',
  borderRadius: 5,
  padding: 10,
  paddingLeft: 20,
  paddingRight: 20,
  fontFamily: 'Montserrat',
  cursor: 'pointer',
  backgroundColor: selected ? 'gold' : '',
  color: selected ? 'black' : '',
  fontWeight: selected ? 700 : 500,
  margin: '10px',
  '&:hover': {
    backgroundColor: 'gold',
    color: 'black',
  },
  width: '22%',
}));

const SelectButton = ({ children, selected, onClick }) => {
  return (
    <StyledSelectButton selected={selected} onClick={onClick}>
      {children}
    </StyledSelectButton>
  );
};

export default SelectButton;
