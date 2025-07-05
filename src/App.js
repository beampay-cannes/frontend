import React, { useMemo, useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import ProductForm from './components/ProductForm';
import PaymentsPage from './components/PaymentsPage';
import ProductListPage from './components/ProductListPage';
import ProductPage from './components/ProductPage';
import OrderListPage from './components/OrderListPage';
import OrderPayPage from './components/OrderPayPage';
import MobilePayPage from './components/MobilePayPage';
import PaymentSettings from './components/PaymentSettings';
import NavBar from './components/NavBar';
import './App.css';
import { IconButton, Box, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

// Контекст для темы
const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const useColorMode = () => useContext(ColorModeContext);

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: { main: '#7C4DFF' }, // Violet Beam
    secondary: { main: '#00E5FF' }, // Laser Cyan
    background: {
      default: mode === 'light' ? '#F5F7FA' : '#181A20',
      paper: mode === 'light' ? '#FFFFFF' : '#23263B',
    },
    success: { main: '#00C853' },
    warning: { main: '#FF9100' },
    info: { main: '#2979FF' },
    divider: mode === 'light' ? '#E3E6F0' : '#23263B',
    text: {
      primary: mode === 'light' ? '#181A20' : '#F5F7FA',
      secondary: mode === 'light' ? '#7C4DFF' : '#B39DDB',
    },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          boxShadow: '0 2px 16px 0 rgba(124,77,255,0.10)',
          transition: 'all 0.2s',
        },
        containedPrimary: {
          background: 'linear-gradient(90deg, #7C4DFF 0%, #2979FF 100%)',
          color: '#fff',
          boxShadow: '0 4px 24px 0 rgba(124,77,255,0.15)',
        },
        containedSecondary: {
          background: 'linear-gradient(90deg, #00E5FF 0%, #7C4DFF 100%)',
          color: '#fff',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: '0 4px 32px 0 rgba(124,77,255,0.10)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #7C4DFF 0%, #2979FF 100%)',
          boxShadow: '0 2px 16px 0 rgba(124,77,255,0.10)',
        },
      },
    },
  },
});

function ThemeToggleButton() {
  const colorMode = useColorMode();
  const theme = createTheme(getDesignTokens('light'));
  const isDark = theme.palette.mode === 'dark';
  return (
    <Tooltip title={isDark ? 'Светлая тема' : 'Тёмная тема'}>
      <IconButton onClick={colorMode.toggleColorMode} color="inherit" sx={{ ml: 1 }}>
        {isDark ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Tooltip>
  );
}

function SellersPage() {
  return (
    <Box sx={{ mt: 8, textAlign: 'center' }}>
      <h2 style={{ fontWeight: 900, fontSize: 36, marginBottom: 24 }}>Sellers</h2>
      <p style={{ fontSize: 20, color: '#7C4DFF' }}>List of all sellers will be here.</p>
    </Box>
  );
}

function CreateSellerPage() {
  return (
    <Box sx={{ mt: 8, textAlign: 'center' }}>
      <h2 style={{ fontWeight: 900, fontSize: 36, marginBottom: 24 }}>Create Seller</h2>
      <p style={{ fontSize: 20, color: '#7C4DFF' }}>Seller registration form will be here.</p>
    </Box>
  );
}

function App() {
  const [mode, setMode] = useState('light');
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );
  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <NavBar ThemeToggleButton={ThemeToggleButton} />
          <div className="App">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<Dashboard ThemeToggleButton={ThemeToggleButton} />} />
              <Route path="/create-product" element={<ProductForm />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/products" element={<ProductListPage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/orders" element={<OrderListPage />} />
              <Route path="/order/:orderId/pay" element={<OrderPayPage />} />
              <Route path="/order/:orderId/pay/mobile" element={<MobilePayPage />} />
              <Route path="/payment-settings" element={<PaymentSettings />} />
              <Route path="/sellers" element={<SellersPage />} />
              <Route path="/create-seller" element={<CreateSellerPage />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App; 