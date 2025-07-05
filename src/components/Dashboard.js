import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Payment as PaymentIcon,
  ShoppingCart as ShoppingCartIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const Dashboard = () => {
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
    const saved = localStorage.getItem('paymentSettings');
    if (saved) {
      setPaymentSettings(JSON.parse(saved));
    }
  }, []);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CRM System
          </Typography>
          <IconButton color="inherit" onClick={() => navigate('/payments')}>
            <Badge badgeContent={stats.totalPayments} color="secondary">
              <PaymentIcon />
            </Badge>
          </IconButton>
          <IconButton color="inherit" onClick={() => navigate('/payment-settings')}>
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
            Dashboard
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'center', maxWidth: 900 }}>
            <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Products
                  </Typography>
                  <Typography variant="h3" component="div">
                    {stats.totalProducts}
                  </Typography>
                  <ShoppingCartIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Card
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate('/orders')}
              >
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Orders / Unpaid Orders
                  </Typography>
                  <Typography variant="h3" component="div">
                    {stats.totalOrders} / {stats.totalOrders - stats.totalPayments}
                  </Typography>
                  <PaymentIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h3" component="div">
                    ₽{stats.totalPayments * 100}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Base: {stats.basePayments} | ETH: {stats.ethereumPayments}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/create-product')}
            sx={{ mb: 2 }}
          >
            Create Product
          </Button>
        </Box>

        {/* Карточка с настройками платежей */}
        {paymentSettings && (
          <Card sx={{ mb: 4, bgcolor: 'primary.light', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <SettingsIcon sx={{ mr: 1 }} />
                Настройки платежей
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Сеть: <strong>{paymentSettings.network === 'ethereum' ? 'Ethereum' : 
                               paymentSettings.network === 'base' ? 'Base' : 
                               paymentSettings.network === 'worldchain' ? 'World Chain' : 'Неизвестно'}</strong>
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2 }}>
                Адрес: {paymentSettings.walletAddress}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/payment-settings')}
                sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                Изменить настройки
              </Button>
            </CardContent>
          </Card>
        )}

        {!paymentSettings && (
          <Card sx={{ mb: 4, bgcolor: 'warning.light', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <SettingsIcon sx={{ mr: 1 }} />
                Внимание: Настройки платежей не настроены
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Для приема платежей необходимо настроить сеть и адрес кошелька.
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate('/payment-settings')}
                sx={{ bgcolor: 'white', color: 'warning.main', '&:hover': { bgcolor: 'grey.100' } }}
              >
                Настроить платежи
              </Button>
            </CardContent>
          </Card>
        )}

        <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' }}>
          Recent Products
        </Typography>
        <>
          <Grid container spacing={3} justifyContent="center">
            {stats.recentProducts.map((product, index) => (
              <Grid item xs={12} sm={6} md={4} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Card sx={{ width: 320, height: 420, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ width: '100%', height: 200, overflow: 'hidden' }}>
                    <img
                      src={product.image}
                      alt={product.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </Box>
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Typography gutterBottom variant="h5" component="div" sx={{ textAlign: 'center' }}>
                      {product.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                      {product.description}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 'auto' }}>
                      ₽{product.price}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/products')}
              disabled={stats.totalProducts === 0}
            >
              Full Product List
            </Button>
          </Box>
        </>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            {/* ScannerControl убран, теперь сканер доступен только по ссылке */}
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Dashboard; 