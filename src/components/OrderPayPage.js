import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Paper
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Home as HomeIcon } from '@mui/icons-material';
import { QRCodeCanvas } from 'qrcode.react';
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
const commitSelector = '0x64fc31b3';
const revealSelector = '0x97bf794b';
const TO_ADDRESS = '0x87555C010f5137141ca13b42855d90a108887005'; // Recipient address

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

  const payUrl = `${window.location.origin}/order/${orderId}/pay/mobile`;

  const handleMetaMaskPay = async () => {
    setSignResult(null);
    setSignError(null);
    if (!window.ethereum) {
      setSignError('MetaMask is not installed');
      return;
    }

    // Проверяем, поддерживается ли текущая сеть
    if (!currentNetwork || currentNetwork === 'unknown') {
      setSignError('Please switch to a supported network (Base or Ethereum) in MetaMask');
      return;
    }

    const networkConfig = getNetworkConfig(currentNetwork);

    try {
      setSignResult('Creating EIP-7702 smart account and signing...');
      
      // Создаем EIP-7702 транзакцию локально
      const eip7702Result = await createEIP7702Transaction(currentNetwork, order.id);
      
      if (!eip7702Result.success) {
        setSignError(`EIP-7702 Error: ${eip7702Result.error}`);
        return;
      }

      setSignResult('Sending signed data to backend...');
      
      // Отправляем подписанные данные на backend
      const response = await fetch('http://localhost:4000/eip7702/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          network: currentNetwork,
          orderId: order.id,
          signedData: {
            authorization: eip7702Result.authorization,
            userOperation: eip7702Result.userOperation
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setSignResult(`EIP-7702 User Operation sent on ${networkConfig.chainName}! Hash: ${result.userOperationHash}`);
      } else {
        setSignError(`Backend Error: ${result.error}`);
      }
    } catch (err) {
      setSignError(err.message || 'Failed to send EIP-7702 transaction');
    }
  };

  const handleMetaMaskBatchPay = async () => {
    setSignResult(null);
    setSignError(null);
    if (!window.ethereum) {
      setSignError('MetaMask is not installed');
      return;
    }
    if (!currentNetwork || currentNetwork === 'unknown') {
      setSignError('Please switch to a supported network (Base or Ethereum) in MetaMask');
      return;
    }
    if (!order) {
      setSignError('Order not loaded');
      return;
    }
    try {
      const chainId = parseInt(NETWORK_CONFIGS[currentNetwork].chainId, 16);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = { address: accounts[0] };
      // PAYMENT_ID: order.id as hex, 32 bytes
      const PAYMENT_ID = '0x' + window.BigInt(order.id).toString(16).padStart(64, '0');
      // DECLARED_AMOUNT: order.amount (USDC, 6 decimals)
      const amount = parseFloat(order.amount) || 0;
      if (isNaN(amount)) {
        setSignError('Invalid order amount');
        return;
      }
      const DECLARED_AMOUNT = window.BigInt(Math.round(amount * 1e6));
      // commit calldata
      const commitCallData = commitSelector +
        '000000000000000000000000' + TO_ADDRESS.slice(2) +
        DECLARED_AMOUNT.toString(16).padStart(64, '0') +
        PAYMENT_ID.slice(2);
      // reveal calldata
      const revealCallData = revealSelector +
        '000000000000000000000000' + TO_ADDRESS.slice(2) +
        DECLARED_AMOUNT.toString(16).padStart(64, '0') +
        PAYMENT_ID.slice(2);
      // transfer calldata (1 USDC for demo)
      const transferCallData = '0xa9059cbb' +
        '000000000000000000000000' + TO_ADDRESS.slice(2) +
        DECLARED_AMOUNT.toString(16).padStart(64, '0');
      const contractAddress = getContractAddress(currentNetwork);
      setSignResult('Sending EIP-7702 batch call...');
      const res = await window.ethereum.request({
        method: 'wallet_sendCalls',
        params: [{
          version: '2.0.0',
          chainId: '0x' + chainId.toString(16),
          from: account.address,
          atomicRequired: true,
          calls: [
            {
              to: contractAddress,
              data: commitCallData,
              value: '0x0',
            },
            {
              to: USDC_ADDRESS,
              data: transferCallData,
              value: '0x0',
            },
            {
              to: contractAddress,
              data: revealCallData,
              value: '0x0',
            }
          ],
        }]
      });
      console.log('EIP-7702 Batch Call Response:', res);
      setSignResult('SendCalls Response: ' + JSON.stringify(res));
      
      // Start polling for transaction status
      setIsTransactionPending(true);
      
      const pollForStatus = async () => {
        try {
          const status = await window.ethereum?.request({
            method: 'wallet_getCallsStatus',
            params: [res.id]
          });

          console.log("Calls Status:", status);

          if (status.status === 'CONFIRMED' || status.status === 200 || status.status === 100) {
            const txnHash = status.receipts?.[0]?.transactionHash;
            console.log('Transaction confirmed! Hash:', txnHash);

            // Check if EOA now has code (indicating EIP-7702 delegation worked)
            try {
              const eoaCode = await window.ethereum?.request({
                method: 'eth_getCode',
                params: [account.address, 'latest']
              });
              console.log('EOA code after transaction:', eoaCode);
              const isSmartEoa = eoaCode !== "0x";
              console.log('Is Smart EOA:', isSmartEoa);

              alert(`Transaction confirmed! Hash: ${txnHash}\nEOA is now smart: ${isSmartEoa}`);
            } catch (codeError) {
              console.error('Error checking EOA code:', codeError);
              alert(`Transaction confirmed! Hash: ${txnHash}`);
            }

            setIsTransactionPending(false);
            return true;
          } else if (status.status === 'PENDING' || status.status === 'pending') {
            console.log('Transaction still pending...');
            return false;
          } else {
            console.error('Transaction failed with status:', status.status);
            alert('Transaction failed with status: ' + status.status);
            setIsTransactionPending(false);
            return true;
          }
        } catch (error) {
          console.error('Error polling status:', error);
          return false;
        }
      };

      // Poll every 2 seconds for up to 2 minutes
      let attempts = 0;
      const maxAttempts = 60;
      const interval = setInterval(async () => {
        attempts++;
        const completed = await pollForStatus();

        if (completed || attempts >= maxAttempts) {
          clearInterval(interval);
          if (attempts >= maxAttempts) {
            console.log('Polling timed out');
            alert('Transaction status polling timed out');
            setIsTransactionPending(false);
          }
        }
      }, 2000);

    } catch (error) {
      console.error('=== WALLET_SENDCALLS ERROR ===');
      console.error('Error:', error);
      console.error('Message:', error?.message);
      console.error('Code:', error?.code);

      alert('wallet_sendCalls failed: ' + (error?.message || 'Unknown error'));
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
      setSignError('Пожалуйста, переключитесь на поддерживаемую сеть (Base или Ethereum) в Ambire Wallet');
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
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Typography variant="h5" align="center">Order not found</Typography>
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
            Pay for Order
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>Scan QR to Pay</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <QRCodeCanvas value={payUrl} size={200} />
          </Box>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Or pay from browser:
          </Typography>
          
          {currentNetwork && currentNetwork !== 'unknown' && (
            <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
              Current network: {NETWORK_CONFIGS[currentNetwork].chainName}
            </Typography>
          )}
          
          {currentNetwork === 'unknown' && (
            <Typography variant="body2" color="warning.main" sx={{ mb: 2 }}>
              Please switch to Base or Ethereum network in MetaMask
            </Typography>
          )}

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleMetaMaskPay}
            disabled={!currentNetwork || currentNetwork === 'unknown'}
            sx={{ mb: 2 }}
          >
            Pay with MetaMask
          </Button>
          
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={handleMetaMaskBatchPay}
            disabled={!currentNetwork || currentNetwork === 'unknown' || isTransactionPending}
            sx={{ mb: 2 }}
          >
            {isTransactionPending ? 'Transaction Pending...' : 'Pay with MetaMask (EIP-7702 batch)'}
          </Button>
          
          <Button
            variant="contained"
            color="success"
            size="large"
            onClick={handleAmbireWalletPay}
            disabled={!currentNetwork || currentNetwork === 'unknown' || isAmbireTransactionPending}
            sx={{ mb: 2 }}
          >
            {isAmbireTransactionPending ? 'Ambire Transaction Pending...' : 'Pay with Ambire Wallet'}
          </Button>
          
          {signResult && (
            <Box sx={{ mt: 2, wordBreak: 'break-all' }}>
              <Typography variant="body2" color="success.main">Transaction:</Typography>
              <Typography variant="body2">{signResult}</Typography>
            </Box>
          )}
          {signError && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="error">{signError}</Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default OrderPayPage; 