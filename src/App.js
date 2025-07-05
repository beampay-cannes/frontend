import React from 'react';
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

import PaymentSettings from './components/PaymentSettings';
import NavBar from './components/NavBar';
import './App.css';

const getDesignTokens = () => ({
  palette: {
    mode: 'dark',
    primary: { main: '#7C4DFF' },
    secondary: { main: '#00E5FF' },
    background: {
      default: '#181A20',
      paper: '#23263B',
    },
    success: { main: '#00C853' },
    warning: { main: '#FF9100' },
    info: { main: '#2979FF' },
    divider: '#23263B',
    text: {
      primary: '#F5F7FA',
      secondary: '#B39DDB',
    },
  },
  shape: { borderRadius: 3 },
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
          borderRadius: 3,
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
          borderRadius: 3,
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

const theme = createTheme(getDesignTokens());

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <NavBar />
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-product" element={<ProductForm />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/orders" element={<OrderListPage />} />
            <Route path="/order/:orderId/pay" element={<OrderPayPage />} />

            <Route path="/payment-settings" element={<PaymentSettings />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App; 