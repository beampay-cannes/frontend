import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Button,
  Box,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Payment as PaymentIcon,
  ShoppingCart as ShoppingCartIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { getPaymentSettings, getNetworkInfo } from '../utils/paymentSettings';

const Dashboard = ({ ThemeToggleButton }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalPayments: 0,
    basePayments: 0,
    ethereumPayments: 0,
    recentProducts: []
  });
  const [paymentSettings, setPaymentSettings] = useState(null);

  useEffect(() => {
    // Загружаем статистику
    fetch('/products.json')
      .then(res => res.json())
      .then(products => {
        fetch('/orders.json')
          .then(res => res.json())
          .then(orders => {
            const paidOrders = orders.filter(order => order.status === 'paid');
            const basePayments = paidOrders.filter(order => order.paidNetwork === 'base').length;
            const ethereumPayments = paidOrders.filter(order => order.paidNetwork === 'ethereum').length;
            setStats({
              totalProducts: products.length,
              totalOrders: orders.length,
              totalPayments: paidOrders.length,
              basePayments: basePayments,
              ethereumPayments: ethereumPayments,
              recentProducts: products.slice(-3).reverse()
            });
          });
      });

    // Загружаем настройки платежей
    const saved = getPaymentSettings();
    if (saved) {
      setPaymentSettings(saved);
    }
  }, []);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      pt: 8,
      pb: 4
    }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ 
          mb: 6, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 900,
              letterSpacing: 2,
              background: 'linear-gradient(90deg, #7C4DFF 0%, #00E5FF 50%, #2979FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 32px rgba(124,77,255,0.3)',
              mb: 2
            }}
          >
            Dashboard
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 300,
              letterSpacing: 1
            }}
          >
            Manage your business
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={4} sx={{ mb: 6, justifyContent: 'center' }}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={0}
              sx={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 3,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 32px rgba(124,77,255,0.2)',
                  border: '1px solid rgba(124,77,255,0.3)'
                }
              }}
              onClick={() => navigate('/products')}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mb: 2,
                p: 2,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(124,77,255,0.2) 0%, rgba(0,229,255,0.2) 100%)',
                width: 80,
                height: 80,
                mx: 'auto'
              }}>
                <ShoppingCartIcon sx={{ 
                  fontSize: 40, 
                  color: '#7C4DFF',
                  filter: 'drop-shadow(0 0 8px rgba(124,77,255,0.5))'
                }} />
              </Box>
              <Typography 
                variant="h3" 
                component="div" 
                sx={{ 
                  fontWeight: 700,
                  color: '#fff',
                  mb: 1,
                  textShadow: '0 0 16px rgba(124,77,255,0.5)'
                }}
              >
                {String(stats.totalProducts || 0)}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 500,
                  letterSpacing: 0.5
                }}
              >
                Total Products
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={0}
              sx={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 3,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 32px rgba(0,229,255,0.2)',
                  border: '1px solid rgba(0,229,255,0.3)'
                }
              }}
              onClick={() => navigate('/orders')}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mb: 2,
                p: 2,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(0,229,255,0.2) 0%, rgba(41,121,255,0.2) 100%)',
                width: 80,
                height: 80,
                mx: 'auto'
              }}>
                <PaymentIcon sx={{ 
                  fontSize: 40, 
                  color: '#00E5FF',
                  filter: 'drop-shadow(0 0 8px rgba(0,229,255,0.5))'
                }} />
              </Box>
              <Typography 
                variant="h3" 
                component="div" 
                sx={{ 
                  fontWeight: 700,
                  color: '#fff',
                  mb: 1,
                  textShadow: '0 0 16px rgba(0,229,255,0.5)'
                }}
              >
                {String(stats.totalOrders || 0)}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 500,
                  letterSpacing: 0.5
                }}
              >
                Orders / {String((stats.totalOrders || 0) - (stats.totalPayments || 0))} unpaid
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Action Button */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/create-product')}
            sx={{
              background: 'linear-gradient(90deg, #7C4DFF 0%, #00E5FF 100%)',
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              letterSpacing: 0.5,
              boxShadow: '0 4px 16px rgba(124,77,255,0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(124,77,255,0.4)',
                background: 'linear-gradient(90deg, #7C4DFF 0%, #00E5FF 100%)'
              }
            }}
          >
            Create Product
          </Button>
        </Box>

        {/* Payment Settings Card */}
        {paymentSettings && (
          <Paper
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, rgba(124,77,255,0.1) 0%, rgba(0,229,255,0.1) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(124,77,255,0.2)',
              borderRadius: 3,
              p: 4,
              mb: 6,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, #7C4DFF 0%, #00E5FF 100%)',
                boxShadow: '0 0 16px rgba(124,77,255,0.5)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{ 
                p: 1.5,
                borderRadius: '50%',
                background: 'rgba(124,77,255,0.2)',
                mr: 2
              }}>
                <SettingsIcon sx={{ color: '#7C4DFF', fontSize: 28 }} />
              </Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#fff',
                  fontWeight: 600,
                  letterSpacing: 0.5
                }}
              >
                Payment Settings
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.6)',
                      mb: 0.5,
                      fontWeight: 500
                    }}
                  >
                    Network
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#fff',
                      fontWeight: 600,
                      background: 'rgba(124,77,255,0.2)',
                      px: 2,
                      py: 1,
                      borderRadius: 3,
                      display: 'inline-block'
                    }}
                  >
                    {String(getNetworkInfo(paymentSettings.network).name || '')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.6)',
                      mb: 0.5,
                      fontWeight: 500
                    }}
                  >
                    Wallet Address
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: 'monospace',
                      color: '#fff',
                      background: 'rgba(0,0,0,0.3)',
                      px: 2,
                      py: 1,
                      borderRadius: 3,
                      wordBreak: 'break-all'
                    }}
                  >
                    {String(paymentSettings.walletAddress || '')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/payment-settings')}
              sx={{
                color: '#7C4DFF',
                borderColor: '#7C4DFF',
                borderRadius: 3,
                px: 3,
                py: 1,
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#00E5FF',
                  color: '#00E5FF',
                  background: 'rgba(0,229,255,0.1)',
                  boxShadow: '0 0 16px rgba(0,229,255,0.3)'
                }
              }}
            >
              Change Settings
            </Button>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard; 