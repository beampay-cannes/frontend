import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Dashboard as DashboardIcon
} from '@mui/icons-material';

const HomePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/products.json')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CRM System
          </Typography>
          <Button 
            color="inherit" 
            onClick={() => navigate('/dashboard')}
            startIcon={<DashboardIcon />}
          >
            Dashboard
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h1" component="h1" gutterBottom sx={{ mb: 4 }}>
            Hello World
          </Typography>
          <Typography variant="h4" color="text.secondary" sx={{ mb: 6 }}>
            Welcome to our CRM System for Product Management and Payment Tracking
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
          Products
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {products.length > 0 ? (
            products.map((product, index) => (
              <Grid item xs={12} sm={6} md={4} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Card
                  sx={{ width: 320, height: 420, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
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
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      sx={{ mb: 2, width: '100%' }}
                      onClick={e => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
                    >
                      Buy
                    </Button>
                    <Typography variant="h6" color="primary" sx={{ mt: 'auto' }}>
                      ₽{product.price}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="h6" color="text.secondary">
                No products found
              </Typography>
            </Grid>
          )}
        </Grid>
      </Container>
    </>
  );
};

export default HomePage; 