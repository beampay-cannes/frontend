import React from 'react';
import { AppBar, Toolbar, Button, Stack, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Sellers', path: '/sellers' },
  { label: 'Create Seller', path: '/create-seller' },
];

const NavBar = ({ ThemeToggleButton }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: 'linear-gradient(90deg, #7C4DFF 0%, #B39DFF 25%, #5A8FFF 70%, #00E5FF 100%)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 32px 0 rgba(124,77,255,0.10)',
        borderBottom: '1.5px solid rgba(255,255,255,0.12)',
        mb: 4,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 80 }}>
        <Box
          sx={{
            fontWeight: 900,
            fontSize: 32,
            letterSpacing: 2,
            background: 'linear-gradient(90deg, #B39DFF 0%, #7C4DFF 40%, #00E5FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 24px #7C4DFF55, 0 1px 0 #fff',
            userSelect: 'none',
            fontFamily: 'Inter, Roboto, Arial, sans-serif',
            cursor: 'pointer',
            mr: 4,
            transition: 'text-shadow 0.3s',
            '&:hover': {
              textShadow: '0 4px 32px #00E5FF99, 0 1px 0 #fff',
              background: 'linear-gradient(90deg, #fff 0%, #7C4DFF 40%, #00E5FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            },
          }}
          onClick={() => navigate('/')}
        >
          BeamPay
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              onClick={() => navigate(item.path)}
              variant="text"
              sx={{
                color: location.pathname === item.path ? '#7C4DFF' : '#fff',
                fontWeight: 700,
                fontSize: 18,
                background: location.pathname === item.path
                  ? '#fff'
                  : 'transparent',
                boxShadow: location.pathname === item.path
                  ? '0 0 16px 2px #7C4DFF33'
                  : 'none',
                borderRadius: 3,
                px: 3,
                py: 1.2,
                transition: 'all 0.2s',
                '&:hover': {
                  background: '#fff',
                  color: '#7C4DFF',
                  boxShadow: '0 0 24px 4px #7C4DFF33',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
          {ThemeToggleButton && <ThemeToggleButton />}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar; 