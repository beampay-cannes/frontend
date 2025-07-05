import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      pt: 8,
      pb: 4
    }}>
      <Container maxWidth="lg" sx={{ mt: 12, mb: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
            mb: 6,
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          Payments in the world of blockchain. Simple. Instant. BeamPay.
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
            background: '#fff',
            color: '#7C4DFF',
            borderRadius: 3,
            textTransform: 'none',
            boxShadow: '0 0 32px 0 #7C4DFF22',
            transition: 'all 0.2s',
            '&:hover, &:active': {
              background: '#fff',
              color: '#7C4DFF',
              boxShadow: '0 0 48px 8px #7C4DFF44',
            },
          }}
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
        </Button>
      </Container>
    </Box>
  );
};

export default HomePage; 