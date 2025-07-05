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
  Paper,
  Divider,
  Chip,
  Alert
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  Home as HomeIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { createWalletClient, custom, encodeFunctionData } from 'viem';
import { 
  getChainConfig,
  NETWORK_CONFIGS 
} from '../config/rpc';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '0xf9397f60c1a45c572132e9e0da89f5e7e71da2ef';
const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_data", "type": "bytes32" }
    ],
    "name": "emitData",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const MobilePayPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'pending', 'success', 'error'
  const [transactionHash, setTransactionHash] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [hasMetaMask, setHasMetaMask] = useState(false);

  useEffect(() => {
    // Проверяем наличие MetaMask
    setHasMetaMask(!!window.ethereum);
    
    // Загружаем данные заказа
    fetch('/orders.json')
      .then(res => res.json())
      .then(data => {
        const found = data.find(o => String(o.id) === String(orderId));
        if (found) {
          setOrder(found);
          // Если заказ уже оплачен, показываем статус
          if (found.status === 'paid') {
            setPaymentStatus('success');
          }
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading order:', error);
        setErrorMessage('Failed to load order details');
        setLoading(false);
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

  const handleMetaMaskPay = async () => {
    if (!window.ethereum) {
      setErrorMessage('MetaMask is not installed. Please install MetaMask to pay.');
      setPaymentStatus('error');
      return;
    }

    // Проверяем, поддерживается ли текущая сеть
    if (!currentNetwork || currentNetwork === 'unknown') {
      setErrorMessage('Please switch to a supported network (Base or Ethereum) in MetaMask');
      setPaymentStatus('error');
      return;
    }

    setPaymentStatus('pending');
    setErrorMessage(null);

    const chainConfig = getChainConfig(currentNetwork);

    try {
      const client = createWalletClient({
        chain: chainConfig,
        transport: custom(window.ethereum)
      });
      
      const [account] = await client.requestAddresses();
      const orderIdHex = '0x' + window.BigInt(order.id).toString(16).padStart(64, '0');
      const data = encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: 'emitData',
        args: [orderIdHex]
      });
      
      const hash = await client.sendTransaction({
        account,
        to: CONTRACT_ADDRESS,
        data
      });
      
      setTransactionHash(hash);
      setPaymentStatus('success');
      
      // Обновляем статус заказа локально
      setOrder(prev => ({ ...prev, status: 'paid', paidAt: new Date().toISOString() }));
      
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send transaction');
      setPaymentStatus('error');
    }
  };

  const getNetworkDisplayName = () => {
    if (!currentNetwork || currentNetwork === 'unknown') return 'Unknown Network';
    return NETWORK_CONFIGS[currentNetwork].chainName;
  };

  const getStatusColor = () => {
    if (!order) return 'default';
    return order.status === 'paid' ? 'success' : 'warning';
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h6">Loading order details...</Typography>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>Order Not Found</Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          The order you're looking for doesn't exist or has been removed.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Go to Home
        </Button>
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
            Mobile Payment
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ mt: 2, mb: 4 }}>
        <Paper sx={{ p: 3, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PaymentIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Order #{order.id}</Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Product</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {order.productName}
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Amount</Typography>
            <Typography variant="h6" color="primary.main">
              ${order.amount}
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Status</Typography>
            <Chip 
              label={order.status === 'paid' ? 'Paid' : 'Unpaid'} 
              color={getStatusColor()}
              size="small"
            />
          </Box>
          
          {order.status === 'paid' && order.paidAt && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Paid At</Typography>
              <Typography variant="body2">
                {new Date(order.paidAt).toLocaleString()}
              </Typography>
            </Box>
          )}
        </Paper>

        {order.status === 'paid' ? (
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'success.light' }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>Payment Successful!</Typography>
            <Typography variant="body2">
              This order has already been paid.
            </Typography>
          </Paper>
        ) : (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
              Complete Payment
            </Typography>
            
            {!hasMetaMask && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                MetaMask is not installed. Please install MetaMask to pay for this order.
              </Alert>
            )}
            
            {hasMetaMask && currentNetwork && (
              <Box sx={{ mb: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Current Network</Typography>
                <Chip 
                  label={getNetworkDisplayName()} 
                  color={currentNetwork === 'unknown' ? 'error' : 'primary'}
                  size="small"
                />
              </Box>
            )}
            
            {currentNetwork === 'unknown' && hasMetaMask && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Please switch to Base or Ethereum network in MetaMask
              </Alert>
            )}
            
            {paymentStatus === 'pending' && (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body1">Processing payment...</Typography>
              </Box>
            )}
            
            {paymentStatus === 'success' && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Payment successful! Transaction hash: {transactionHash}
              </Alert>
            )}
            
            {paymentStatus === 'error' && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}
            
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={handleMetaMaskPay}
              disabled={!hasMetaMask || !currentNetwork || currentNetwork === 'unknown' || paymentStatus === 'pending'}
              startIcon={<PaymentIcon />}
            >
              {paymentStatus === 'pending' ? 'Processing...' : 'Pay with MetaMask'}
            </Button>
          </Paper>
        )}
      </Container>
    </>
  );
};

export default MobilePayPage; 