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
import MobilePayPage from './components/MobilePayPage';
import PaymentSettings from './components/PaymentSettings';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
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
            <Route path="/order/:orderId/pay/mobile" element={<MobilePayPage />} />
            <Route path="/payment-settings" element={<PaymentSettings />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App; 