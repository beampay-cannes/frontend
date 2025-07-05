import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Grid,
  TextField
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Home as HomeIcon, Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';

const BACKEND_URL = 'http://localhost:4000';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch('/products.json')
      .then(res => res.json())
      .then(data => {
        const found = data.find(p => String(p.id) === String(id));
        setProduct(found);
      });
  }, [id]);

  const handleBuy = async () => {
    if (!name || !address || quantity < 1) {
      alert('Please fill in all fields');
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productTitle: product.title,
          name,
          address,
          quantity
        })
      });
      const result = await res.json();
      if (result.success) {
        // alert('Order placed!');
        setName('');
        setAddress('');
        setQuantity(1);
        navigate(`/order/${result.order.id}/pay`);
      } else {
        alert(result.error || 'Failed to place order');
      }
    } catch (err) {
      alert('Failed to place order');
    }
  };

  if (!product) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Typography variant="h5" align="center">Product not found</Typography>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/')}>Back to Home</Button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/')} sx={{ mr: 2 }}>
            <HomeIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Product Details
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
        <Card sx={{ width: '100%', minHeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
          <Grid container spacing={4} alignItems="flex-start" justifyContent="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ width: '100%', height: 320, overflow: 'hidden', mb: 3 }}>
                <img
                  src={product.image}
                  alt={product.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <CardContent sx={{ width: '100%' }}>
                <Typography variant="h4" gutterBottom>{product.title}</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'left' }}>{product.description}</Typography>
                <Typography variant="h5" color="primary" sx={{ mb: 3 }}>₽{product.price}</Typography>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    label="Your name"
                    fullWidth
                    value={name}
                    onChange={e => setName(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Delivery address"
                    fullWidth
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      sx={{ minWidth: 40 }}
                    >
                      <RemoveIcon />
                    </Button>
                    <Typography variant="h6" sx={{ mx: 2, minWidth: 32, textAlign: 'center' }}>{quantity}</Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => setQuantity(q => q + 1)}
                      sx={{ minWidth: 40 }}
                    >
                      <AddIcon />
                    </Button>
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    onClick={handleBuy}
                  >
                    Buy
                  </Button>
                </Box>
              </CardContent>
            </Grid>
          </Grid>
        </Card>
      </Container>
    </>
  );
};

export default ProductPage; 