import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';

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
      // Получаем кошелёк и chain продавца одним запросом
      const sellerRes = await fetch('http://localhost:4000/api/seller');
      const sellerData = await sellerRes.json();
      const sellerWallet = sellerData.walletAddress;
      const sellerChainId = sellerData.chain_id;

      const res = await fetch(`${BACKEND_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productTitle: product.title,
          name,
          address,
          quantity,
          wallet: sellerWallet,
          sellerChainId: sellerChainId
        })
      });
      const result = await res.json();
      if (result.success) {
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
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)', pt: 8, pb: 8 }}>
        <Container maxWidth="sm" sx={{ mt: 8 }}>
          <Typography variant="h5" align="center">Product not found</Typography>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/')}>Back to Home</Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)', pt: 8, pb: 8 }}>
      <Container maxWidth="md">
        <Card sx={{ width: '100%', minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, boxShadow: '0 8px 40px 0 #7C4DFF22' }}>
          <Grid container spacing={4} alignItems="stretch" justifyContent="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ width: '100%', height: 320, overflow: 'hidden', borderRadius: 3, boxShadow: '0 4px 32px 0 #7C4DFF22', background: '#181A20' }}>
                <img
                  src={product.image}
                  alt={product.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <CardContent sx={{ width: '100%' }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#fff' }}>{product.title}</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'left' }}>{product.description}</Typography>
                <Typography variant="h5" sx={{ mb: 3, color: '#7C4DFF', fontWeight: 700, textShadow: '0 0 8px #7C4DFF55' }}>₽{product.price}</Typography>
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
                    sx={{ fontWeight: 700, fontSize: 20, py: 2, mt: 2, background: 'linear-gradient(90deg, #7C4DFF 0%, #00E5FF 100%)', boxShadow: '0 4px 24px 0 #7C4DFF33' }}
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
    </Box>
  );
};

export default ProductPage; 