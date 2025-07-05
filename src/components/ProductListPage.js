import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Home as HomeIcon, Add as AddIcon } from '@mui/icons-material';

const ProductListPage = () => {
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
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => navigate('/')} sx={{ mr: 1 }}>
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            All Products
          </Typography>
          <Button color="inherit" startIcon={<AddIcon />} onClick={() => navigate('/create-product')}>
            Create Product
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
          Product List
        </Typography>
        {products.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No products found
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/create-product')}
              sx={{ mt: 2 }}
            >
              Create First Product
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3} justifyContent="center">
            {products.map((product, index) => (
              <Grid item xs={12} sm={6} md={4} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={product.title}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      {product.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {product.description}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ₽{product.price}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
};

export default ProductListPage; 