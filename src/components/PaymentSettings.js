import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Chip,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  Save as SaveIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckCircleIcon,
  Wallet as WalletIcon,
  NetworkCheck as NetworkIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { NETWORK_CONFIGS } from '../config/rpc';
import { 
  getPaymentSettings, 
  savePaymentSettings, 
  isValidWalletAddress
} from '../utils/paymentSettings';

const PaymentSettings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    network: 'ethereum',
    walletAddress: '',
    isDefault: true
  });
  
  const [savedSettings, setSavedSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [copied, setCopied] = useState(false);

  // Загружаем сохраненные настройки при монтировании компонента
  useEffect(() => {
    const saved = getPaymentSettings();
    if (saved) {
      setSettings(saved);
      setSavedSettings(saved);
    }
  }, []);

  // Валидация адреса кошелька
  const isValidAddress = isValidWalletAddress;

  // Обработка изменения полей
  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Сохранение настроек
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
      // Сохраняем настройки
      const success = savePaymentSettings(settings);
      if (success) {
        setSavedSettings(settings);
        setMessage({ type: 'success', text: 'Настройки платежей успешно сохранены!' });
      } else {
        setMessage({ type: 'error', text: 'Ошибка при сохранении настроек' });
      }
      
      // Здесь можно добавить отправку на сервер
      // await fetch('/api/payment-settings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });
      
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка при сохранении настроек' });
    } finally {
      setIsLoading(false);
    }
  };

  // Копирование адреса в буфер обмена
  const handleCopyAddress = async () => {
    if (savedSettings?.walletAddress) {
      try {
        await navigator.clipboard.writeText(savedSettings.walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Ошибка копирования:', error);
      }
    }
  };

  // Получение информации о сети
  const getNetworkInfo = (networkKey) => {
    return NETWORK_CONFIGS[networkKey] || NETWORK_CONFIGS.ethereum;
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Настройки платежей
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
          Настройки платежей
        </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Форма настройки */}
        <Grid item xs={12} md={6}>
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
            </CardContent>
          </Card>
        </Grid>

        {/* Информация о текущих настройках */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                Текущие настройки
              </Typography>

              {savedSettings ? (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Сеть:
                    </Typography>
                    <Chip
                      label={getNetworkInfo(savedSettings.network).chainName}
                      color="primary"
                      variant="outlined"
                      icon={<NetworkIcon />}
                    />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Адрес кошелька:
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      p: 1, 
                      bgcolor: 'grey.50', 
                      borderRadius: 1,
                      wordBreak: 'break-all'
                    }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', flex: 1 }}>
                        {savedSettings.walletAddress}
                      </Typography>
                      <Tooltip title={copied ? 'Скопировано!' : 'Копировать адрес'}>
                        <IconButton 
                          size="small" 
                          onClick={handleCopyAddress}
                          color={copied ? 'success' : 'default'}
                        >
                          {copied ? <CheckCircleIcon /> : <CopyIcon />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="body2" color="text.secondary">
                    <strong>Информация о сети:</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Chain ID: {getNetworkInfo(savedSettings.network).chainId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    RPC: {getNetworkInfo(savedSettings.network).rpcUrls[0]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Explorer: {getNetworkInfo(savedSettings.network).blockExplorerUrls[0]}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Настройки платежей не настроены. Пожалуйста, укажите сеть и адрес кошелька.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Дополнительная информация */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Важная информация
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Убедитесь, что указанный адрес кошелька корректен и принадлежит вам
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Платежи будут приниматься только в указанной сети
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Для изменения сети или адреса кошелька обновите настройки выше
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Рекомендуется использовать кошелек с поддержкой CCTP V2 для кросс-чейн транзакций
          </Typography>
                 </CardContent>
       </Card>
     </Container>
    </>
  );
};

export default PaymentSettings; 