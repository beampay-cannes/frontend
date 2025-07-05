import React, { useState, useEffect } from 'react';
import { Container, Typography, Card, CardContent, TextField, Button, FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import { Save as SaveIcon, Wallet as WalletIcon, NetworkCheck as NetworkIcon } from '@mui/icons-material';
import { NETWORK_CONFIGS } from '../config/rpc';
import { getPaymentSettings, savePaymentSettings, isValidWalletAddress } from '../utils/paymentSettings';

const PaymentSettings = () => {
  const [settings, setSettings] = useState({
    network: 'ethereum',
    walletAddress: '',
    isDefault: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const saved = getPaymentSettings();
    if (saved) {
      setSettings(saved);
    }
  }, []);

  const isValidAddress = isValidWalletAddress;

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!settings.walletAddress.trim()) {
      setMessage({ type: 'error', text: 'Пожалуйста, введите адрес кошелька' });
      return;
    }
    if (!isValidAddress(settings.walletAddress)) {
      setMessage({ type: 'error', text: 'Неверный формат адреса кошелька' });
      return;
    }
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const success = savePaymentSettings(settings);
      if (success) {
        setMessage({ type: 'success', text: 'Настройки платежей успешно сохранены!' });
      } else {
        setMessage({ type: 'error', text: 'Ошибка при сохранении настроек' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка при сохранении настроек' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      pt: 8,
      pb: 4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Container maxWidth="sm">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <WalletIcon sx={{ mr: 1 }} />
              Настройка реквизитов
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Сеть для приема платежей</InputLabel>
              <Select
                value={settings.network}
                label="Сеть для приема платежей"
                onChange={(e) => handleChange('network', e.target.value)}
              >
                <MenuItem value="ethereum">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <NetworkIcon sx={{ mr: 1, color: '#627EEA' }} />
                    Ethereum
                  </Box>
                </MenuItem>
                <MenuItem value="base">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <NetworkIcon sx={{ mr: 1, color: '#0052FF' }} />
                    Base
                  </Box>
                </MenuItem>
                <MenuItem value="worldchain">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <NetworkIcon sx={{ mr: 1, color: '#FF6B35' }} />
                    World Chain
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Адрес кошелька"
              value={settings.walletAddress}
              onChange={(e) => handleChange('walletAddress', e.target.value)}
              placeholder="0x..."
              sx={{ mb: 3 }}
              error={settings.walletAddress && !isValidAddress(settings.walletAddress)}
              helperText={settings.walletAddress && !isValidAddress(settings.walletAddress)
                ? 'Неверный формат адреса'
                : 'Введите адрес кошелька для приема платежей'
              }
            />
            <Button
              variant="contained"
              fullWidth
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={isLoading || !settings.walletAddress.trim()}
              size="large"
            >
              {isLoading ? 'Сохранение...' : 'Сохранить настройки'}
            </Button>
            {message.text && (
              <Typography sx={{ mt: 2 }} color={message.type === 'error' ? 'error' : 'success.main'}>
                {message.text}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default PaymentSettings; 