import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { styled } from '@mui/system';
import { ThemeProvider } from '@mui/material/styles';
import darkTheme from './theme';
import Header from './components/Header';
import Homepage from './Pages/Homepage';
import CP from './Pages/CP';

const StyledAppContainer = styled('div')({
  backgroundColor: '#14161a',
  color: 'white',
  minHeight: '100vh',
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <BrowserRouter>
        <StyledAppContainer>
          <Header />
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/coins/:id" element={<CP />} />
          </Routes>
        </StyledAppContainer>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
