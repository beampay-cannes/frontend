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
  Chip
} from '@mui/material';
import { ethers } from 'ethers';

import { 
  getNetworkConfig, 
  NETWORK_CONFIGS 
} from '../config/rpc';
import { createEIP7702Transaction } from '../utils/eip7702';

// Адреса контрактов для разных сетей
const CONTRACT_ADDRESSES = {
  ethereum: '0x50c8d8db0711bd17fc21e1e111327580ae41a8ef',
  base: '0xf9397f60c1a45c572132e9e0da89f5e7e71da2ef'
};

const getContractAddress = (network) => {
  return CONTRACT_ADDRESSES[network] || CONTRACT_ADDRESSES.ethereum;
};


const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const CCTP_V2_ADDRESS = '0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d';
const commitSelector = '0x64fc31b3';
const revealSelector = '0x97bf794b';
const TO_ADDRESS = '0x87555C010f5137141ca13b42855d90a108887005'; // Recipient address

// Функция для получения домена CCTP V2 в зависимости от сети
const getCCTPDomain = (network) => {
  const domains = {
    ethereum: 0,    // Ethereum domain
    base: 6,        // Base domain
    worldchain: 14  // World Chain domain
  };
  return domains[network] || 0; // По умолчанию Ethereum
};

function strip0x(str) {
  return typeof str === 'string' && str.startsWith('0x') ? str.slice(2) : str;
}

const TOKEN_MESSENGER_V2_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint32", "name": "destinationDomain", "type": "uint32" },
      { "internalType": "bytes32", "name": "mintRecipient", "type": "bytes32" },
      { "internalType": "address", "name": "burnToken", "type": "address" },
      { "internalType": "bytes32", "name": "destinationCaller", "type": "bytes32" },
      { "internalType": "uint256", "name": "maxFee", "type": "uint256" },
      { "internalType": "uint32", "name": "minFinalityThreshold", "type": "uint32" }
    ],
    "name": "depositForBurn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const USDC_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

const OrderPayPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [signResult, setSignResult] = useState(null);
  const [signError, setSignError] = useState(null);
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const [isAmbireTransactionPending, setIsAmbireTransactionPending] = useState(false);

  useEffect(() => {
    fetch('/orders.json')
      .then(res => res.json())
      .then(data => {
        const found = data.find(o => String(o.id) === String(orderId));
        setOrder(found);
      });
  }, [orderId]);

  // Определяем текущую сеть из MetaMask
  useEffect(() => {
    if (window.ethereum) {
      const detectNetwork = async () => {
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          const networkName = Object.keys(NETWORK_CONFIGS).find(
            network => NETWORK_CONFIGS[network].chainId === chainId
          );
          setCurrentNetwork(networkName || 'unknown');
        } catch (error) {
          console.error('Failed to detect network:', error);
          setCurrentNetwork('unknown');
        }
      };

      detectNetwork();
      
      // Слушаем изменения сети
      window.ethereum.on('chainChanged', (chainId) => {
        const networkName = Object.keys(NETWORK_CONFIGS).find(
          network => NETWORK_CONFIGS[network].chainId === chainId
        );
        setCurrentNetwork(networkName || 'unknown');
      });
    }
  }, []);

  const handleEthersDepositForBurn = async () => {
    setSignResult(null);
    setSignError(null);

    if (!window.ethereum) {
      setSignError('MetaMask is not installed');
      return;
    }
    if (!currentNetwork || currentNetwork === 'unknown') {
      setSignError('Please switch to a supported network (Base, Ethereum, or World Chain) in MetaMask');
      return;
    }
    if (!order) {
      setSignError('Order not loaded');
      return;
    }

    try {
      setIsTransactionPending(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tokenMessengerV2 = new ethers.Contract(
        CCTP_V2_ADDRESS,
        TOKEN_MESSENGER_V2_ABI,
        signer
      );

      const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
      const amount = ethers.parseUnits(order.amount.toString(), 6);
      const destinationDomain = getCCTPDomain(currentNetwork);
      const mintRecipient = ethers.zeroPadValue(order.wallet, 32);
      const burnToken = USDC_ADDRESS;
      const destinationCaller = ethers.zeroPadValue('0x0', 32);
      const maxFee = ethers.parseUnits('0.1', 6); // 0.1 USDC
      const minFinalityThreshold = 100; // для Instant

      const userAddress = await signer.getAddress();
      const allowance = await usdc.allowance(userAddress, CCTP_V2_ADDRESS);
      if (allowance < amount) {
        setSignResult('Approving USDC for CCTP...');
        const approveTx = await usdc.approve(CCTP_V2_ADDRESS, amount);
        await approveTx.wait();
        setSignResult(`USDC approved: ${approveTx.hash}`);
      } else {
        setSignResult('USDC already approved');
      }

      setSignResult('Sending depositForBurn transaction...');
      const tx = await tokenMessengerV2.depositForBurn(
        amount,
        destinationDomain,
        mintRecipient,
        burnToken,
        destinationCaller,
        maxFee,
        minFinalityThreshold
      );

      setSignResult(`Tx sent: ${tx.hash}`);
      await tx.wait();
      setSignResult(`Tx confirmed: ${tx.hash}`);
    } catch (err) {
      setSignError(err.message || 'Failed to send depositForBurn transaction');
    } finally {
      setIsTransactionPending(false);
    }
  };

  // Проверяем, установлен ли Ambire Wallet
  const isAmbireWalletInstalled = () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      return false;
    }
    
    // Проверяем различные способы определения Ambire Wallet
    return (
      window.ethereum.isAmbireWallet ||
      window.ethereum.isAmbire ||
      window.ethereum.providers?.some(provider => 
        provider.isAmbireWallet || 
        provider.isAmbire ||
        provider.constructor.name === 'AmbireWalletProvider'
      ) ||
      // Проверяем по названию в window.ethereum
      (window.ethereum.constructor.name === 'AmbireWalletProvider') ||
      // Проверяем по user agent или другим признакам
      (window.ethereum.selectedProvider && 
       (window.ethereum.selectedProvider.isAmbireWallet || 
        window.ethereum.selectedProvider.isAmbire))
    );
  };

  // Функция для оплаты через Ambire Wallet
  const handleAmbireWalletPay = async () => {
    setSignResult(null);
    setSignError(null);
    
    // Отладочная информация
    console.log('=== WALLET DEBUG INFO ===');
    console.log('window.ethereum:', window.ethereum);
    console.log('window.ethereum.isAmbireWallet:', window.ethereum?.isAmbireWallet);
    console.log('window.ethereum.isAmbire:', window.ethereum?.isAmbire);
    console.log('window.ethereum.constructor.name:', window.ethereum?.constructor?.name);
    console.log('window.ethereum.providers:', window.ethereum?.providers);
    console.log('isAmbireWalletInstalled():', isAmbireWalletInstalled());
    
    if (!isAmbireWalletInstalled()) {
      setSignError('Ambire Wallet не установлен. Пожалуйста, установите Ambire Wallet.');
      return;
    }

    if (!currentNetwork || currentNetwork === 'unknown') {
      setSignError('Пожалуйста, переключитесь на поддерживаемую сеть (Base, Ethereum или World Chain) в Ambire Wallet');
      return;
    }

    if (!order) {
      setSignError('Заказ не загружен');
      return;
    }

    try {
      setIsAmbireTransactionPending(true);
      setSignResult('Подключение к Ambire Wallet...');

      // Подключаемся к Ambire Wallet
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      const account = accounts[0];
      setSignResult('Отправка транзакции через Ambire Wallet...');

      // Подготавливаем данные транзакции
      const orderIdHex = '0x' + window.BigInt(order.id).toString(16).padStart(64, '0');
      const contractAddress = getContractAddress(currentNetwork);
      
      // Создаем простую транзакцию для Ambire Wallet
      const transaction = {
        to: contractAddress,
        data: `0xbd08606f${orderIdHex.slice(2)}`, // Вызов функции с orderId
        value: '0x0',
        from: account
      };

      // Отправляем транзакцию
      const hash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transaction]
      });

      console.log('Ambire Wallet Transaction Hash:', hash);
      setSignResult(`Транзакция отправлена через Ambire Wallet! Hash: ${hash}`);

      // Проверяем статус транзакции
      const checkTransactionStatus = async () => {
        try {
          const receipt = await window.ethereum.request({
            method: 'eth_getTransactionReceipt',
            params: [hash]
          });

          if (receipt && receipt.status === '0x1') {
            console.log('Ambire Wallet transaction confirmed!');
            alert(`Транзакция подтверждена! Hash: ${hash}`);
            setIsAmbireTransactionPending(false);
            return true;
          } else if (receipt && receipt.status === '0x0') {
            console.error('Ambire Wallet transaction failed');
            alert('Транзакция не удалась');
            setIsAmbireTransactionPending(false);
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error checking transaction status:', error);
          return false;
        }
      };

      // Polling статуса транзакции
      let attempts = 0;
      const maxAttempts = 30;
      const interval = setInterval(async () => {
        attempts++;
        const completed = await checkTransactionStatus();

        if (completed || attempts >= maxAttempts) {
          clearInterval(interval);
          if (attempts >= maxAttempts) {
            console.log('Ambire Wallet transaction polling timed out');
            alert('Проверка статуса транзакции Ambire Wallet истекла');
            setIsAmbireTransactionPending(false);
          }
        }
      }, 2000);

    } catch (error) {
      console.error('=== AMBIRE WALLET ERROR ===');
      console.error('Error:', error);
      console.error('Message:', error?.message);
      console.error('Code:', error?.code);

      setSignError('Ошибка Ambire Wallet: ' + (error?.message || 'Неизвестная ошибка'));
      setIsAmbireTransactionPending(false);
    }
  };

  if (!order) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)', pt: 8, pb: 8 }}>
        <Container maxWidth="sm" sx={{ mt: 8 }}>
          <Typography variant="h5" align="center" sx={{ color: '#fff' }}>Order not found</Typography>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/')} sx={{ color: '#fff', borderColor: '#7C4DFF' }}>Back to Home</Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)', pt: 8, pb: 8 }}>
      <Container maxWidth="md">
        <Card sx={{ width: '100%', p: 4, boxShadow: '0 8px 40px 0 #7C4DFF22' }}>
          <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 700, color: '#fff', mb: 4 }}>
            Pay for Order #{order.id}
          </Typography>
          
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ mb: 4, p: 3, bgcolor: 'rgba(124, 77, 255, 0.1)', borderRadius: 3, border: '1px solid rgba(124, 77, 255, 0.3)' }}>
              <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>Order ID</Typography>
              <Typography variant="h4" sx={{ color: '#7C4DFF', fontWeight: 700, fontFamily: 'monospace', mb: 3 }}>
                {order.id}
              </Typography>
              
              <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(124, 77, 255, 0.3)' }}>
                <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>Order Details</Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Product</Typography>
                    <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
                      {order.productTitle}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Customer</Typography>
                    <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
                      {order.name}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Delivery Address</Typography>
                    <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
                      {order.address}
                    </Typography>
                  </Box>
                  
                  {order.quantity && (
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Quantity</Typography>
                      <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
                        {order.quantity}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
                {currentNetwork && currentNetwork !== 'unknown' && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>Current network:</Typography>
                    <Chip 
                      label={NETWORK_CONFIGS[currentNetwork].chainName}
                      sx={{ 
                        background: 'linear-gradient(90deg, #7C4DFF 0%, #00E5FF 100%)',
                        color: '#fff',
                        fontWeight: 700
                      }}
                    />
                  </Box>
                )}
                
                {currentNetwork === 'unknown' && (
                  <Typography variant="body2" sx={{ color: '#ff9800', mb: 3 }}>
                    Please switch to Base, Ethereum, or World Chain network in MetaMask
                  </Typography>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleEthersDepositForBurn}
                    disabled={!currentNetwork || currentNetwork === 'unknown' || isTransactionPending}
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: 16, 
                      py: 1.5,
                      background: 'linear-gradient(90deg, #00E5FF 0%, #7C4DFF 100%)',
                      boxShadow: '0 4px 24px 0 #00E5FF33',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #00c4e6 0%, #6a3de8 100%)'
                      }
                    }}
                  >
                    {isTransactionPending ? 'Transaction Pending...' : 'Pay with MetaMask (USDC + CCTP V2)'}
                  </Button>
                </Box>
                
                {signResult && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 3, border: '1px solid rgba(76, 175, 80, 0.3)' }}>
                    <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 700, mb: 1 }}>Transaction:</Typography>
                    <Typography variant="body2" sx={{ color: '#fff', wordBreak: 'break-all' }}>{signResult}</Typography>
                  </Box>
                )}
                
                {signError && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(244, 67, 54, 0.1)', borderRadius: 3, border: '1px solid rgba(244, 67, 54, 0.3)' }}>
                    <Typography variant="body2" sx={{ color: '#f44336' }}>{signError}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default OrderPayPage; 