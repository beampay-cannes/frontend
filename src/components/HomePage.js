import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Grid, Card, CardContent, Box } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';

const demoProducts = [
  {
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    title: 'Sofa on the Beach',
    description: 'A comfy sofa with a sea view.',
    price: 1200
  },
  {
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
    title: 'Minimalist Room',
    description: 'Bright and clean interior.',
    price: 800
  },
  {
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    title: 'Green Sofa',
    description: 'Modern green sofa for your living room.',
    price: 950
  }
];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography
        variant="h2"
        sx={{
          fontWeight: 900,
          letterSpacing: 2,
          mb: 2,
          background: 'linear-gradient(90deg, #7C4DFF 0%, #00E5FF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center',
          userSelect: 'none',
        }}
      >
        BeamPay
      </Typography>
      <Typography
        variant="h5"
        sx={{
          color: '#7C4DFF',
          mb: 4,
          textAlign: 'center',
          fontWeight: 500,
        }}
      >
        Платежи в мире блокчейна. Просто. Мгновенно. BeamPay.
      </Typography>
      <Button
        variant="contained"
        size="large"
        startIcon={<DashboardIcon />}
        sx={{
          mb: 6,
          px: 5,
          py: 2,
          fontSize: 22,
          fontWeight: 700,
          background: 'linear-gradient(90deg, #7C4DFF 0%, #2979FF 100%)',
          boxShadow: '0 0 24px 0 #7C4DFF88',
          borderRadius: 3,
          textTransform: 'none',
          transition: 'box-shadow 0.2s',
          '&:hover': {
            background: 'linear-gradient(90deg, #00E5FF 0%, #7C4DFF 100%)',
            boxShadow: '0 0 32px 4px #00E5FF88',
          },
        }}
        onClick={() => navigate('/dashboard')}
      >
        Перейти в дашборд
      </Button>
      <Typography variant="h4" sx={{ mt: 6, mb: 3, textAlign: 'center', fontWeight: 700 }}>
        Продукты
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {demoProducts.map((product, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card
              sx={{
                width: 320,
                height: 420,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: 4,
                boxShadow: '0 0 32px 0 #7C4DFF22',
                border: '2px solid',
                borderImage: 'linear-gradient(90deg, #7C4DFF 0%, #00E5FF 100%) 1',
                transition: 'box-shadow 0.2s, border-color 0.2s',
                '&:hover': {
                  boxShadow: '0 0 48px 8px #00E5FF44',
                  borderColor: '#00E5FF',
                },
              }}
            >
              <Box sx={{ width: '100%', height: 200, overflow: 'hidden', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                <img
                  src={product.image}
                  alt={product.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </Box>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Typography gutterBottom variant="h5" component="div" sx={{ textAlign: 'center', fontWeight: 700 }}>
                  {product.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                  {product.description}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 'auto', fontWeight: 700 }}>
                  {product.price} USDC
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default HomePage; 