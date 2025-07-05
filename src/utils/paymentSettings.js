// Утилита для работы с настройками платежей

// Получение настроек платежей из localStorage
export const getPaymentSettings = () => {
  try {
    const saved = localStorage.getItem('paymentSettings');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Ошибка при загрузке настроек платежей:', error);
    return null;
  }
};

// Сохранение настроек платежей в localStorage
export const savePaymentSettings = (settings) => {
  try {
    localStorage.setItem('paymentSettings', JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Ошибка при сохранении настроек платежей:', error);
    return false;
  }
};

// Проверка валидности адреса кошелька
export const isValidWalletAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Получение информации о сети по ключу
export const getNetworkInfo = (networkKey) => {
  const networks = {
    ethereum: {
      name: 'Ethereum',
      chainId: '0x1',
      color: '#627EEA'
    },
    base: {
      name: 'Base',
      chainId: '0x2105',
      color: '#0052FF'
    },
    worldchain: {
      name: 'World Chain',
      chainId: '0xe',
      color: '#FF6B35'
    }
  };
  
  return networks[networkKey] || networks.ethereum;
};

// Проверка, настроены ли платежи
export const isPaymentSettingsConfigured = () => {
  const settings = getPaymentSettings();
  return settings && settings.walletAddress && isValidWalletAddress(settings.walletAddress);
};

// Получение адреса кошелька для приема платежей
export const getPaymentWalletAddress = () => {
  const settings = getPaymentSettings();
  return settings?.walletAddress || null;
};

// Получение сети для приема платежей
export const getPaymentNetwork = () => {
  const settings = getPaymentSettings();
  return settings?.network || 'ethereum';
};

// Форматирование адреса для отображения
export const formatWalletAddress = (address, startChars = 6, endChars = 4) => {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}; 