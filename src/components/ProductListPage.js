import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const ProductListPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/products.json')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      pt: 8,
      pb: 4
    }}>
      <Container maxWidth="lg">
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
            All Products
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 300,
              letterSpacing: 1
            }}
          >
            Manage your product catalog
          </Typography>
        </Box>

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

        {products.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <Paper
              elevation={0}
              sx={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 3,
                p: 6,
                textAlign: 'center',
                maxWidth: 400
              }}
            >
              <Typography variant="h5" sx={{ color: '#fff', mb: 2 }}>
                No Products
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                Add your first product to start selling
              </Typography>
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
                Create First Product
              </Button>
            </Paper>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
            {products.map((product, index) => {
              let title = product.title;
              let description = product.description;
              // Keep original English titles and descriptions
              // if (title === 'Chair') title = 'Chair';
              // if (title === 'Table') title = 'Table';
              // if (title === 'Sofa') title = 'Sofa';
              // if (description === 'Blue chair') description = 'Blue chair';
              // if (description === 'Wooden table') description = 'Wooden table';
              // if (description === 'Great sofa') description = 'Great sofa';
              return (
                <Box key={index} sx={{ minWidth: 320, maxWidth: 360, flex: '1 1 320px', m: 1, display: 'flex', flexDirection: 'column' }}>
                  <Link to={`/product/${product.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit', height: '100%' }}>
                    <Paper
                      elevation={0}
                      sx={{
                        background: 'linear-gradient(135deg, rgba(124,77,255,0.10) 0%, rgba(0,229,255,0.08) 100%)',
                        backdropFilter: 'blur(24px)',
                        border: '2px solid rgba(124,77,255,0.25)',
                        borderRadius: 3,
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        boxShadow: '0 0 32px 0 rgba(124,77,255,0.15), 0 4px 32px 0 rgba(0,229,255,0.10)',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.03)',
                          boxShadow: '0 0 48px 8px #7C4DFF66, 0 8px 40px 0 #00E5FF33',
                          border: '2.5px solid #7C4DFF',
                          borderRadius: 3
                        }
                      }}
                    >
                      <Box sx={{ width: '100%', minHeight: 200, maxHeight: 200, flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                        <img
                          src={product.image || 'https://via.placeholder.com/300x200?text=No+Photo'}
                          alt={title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      </Box>
                      <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography
                            variant="h6"
                            component="div"
                            sx={{ textAlign: 'center', color: '#fff', fontWeight: 600, mb: 1, lineHeight: 1.3 }}
                          >
                            {String(title || '')}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', mb: 2, lineHeight: 1.5 }}
                          >
                            {String(description || '')}
                          </Typography>
                        </Box>
                        <Typography
                          variant="h5"
                          sx={{ color: '#7C4DFF', fontWeight: 700, textAlign: 'center', textShadow: '0 0 8px rgba(124,77,255,0.5)' }}
                        >
                          {String(product.price || '')} USDC
                        </Typography>
                      </Box>
                    </Paper>
                  </Link>
                </Box>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ProductListPage; 