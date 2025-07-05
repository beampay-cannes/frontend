import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  Chip
} from '@mui/material';
import { ethers } from 'ethers';
import { createEIP7702Transaction } from '../utils/eip7702';

import { 
  NETWORK_CONFIGS 
} from '../config/rpc';



const OrderPayPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [signResult, setSignResult] = useState(null);
  const [signError, setSignError] = useState(null);
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const [approveCompleted, setApproveCompleted] = useState(false);
  const [beamPayAvailable, setBeamPayAvailable] = useState(false);
  const [beamPaySupportedNetworks, setBeamPaySupportedNetworks] = useState([]);

  useEffect(() => {
    fetch('/orders.json')
      .then(res => res.json())
      .then(data => {
        const found = data.find(o => String(o.id) === String(orderId));
        setOrder(found);
      });
  }, [orderId]);

  // Check for BeamPay availability
  useEffect(() => {
    const checkBeamPay = () => {
      if (window.beampay && window.beampay.isAvailable()) {
        console.log('BeamPay is ready!');
        setBeamPayAvailable(true);
        const supportedNetworks = window.beampay.getSupportedNetworks();
        console.log('Supported networks:', supportedNetworks);
        setBeamPaySupportedNetworks(supportedNetworks);
      }
    };

    // Check immediately
    checkBeamPay();

    // Listen for BeamPay ready event
    const handleBeamPayReady = () => {
      console.log('BeamPay API is now available!');
      checkBeamPay();
    };

    window.addEventListener('beampay-ready', handleBeamPayReady);

    return () => {
      window.removeEventListener('beampay-ready', handleBeamPayReady);
    };
  }, []);

  // Определяем текущую сеть из MetaMask
  useEffect(() => {
    if (window.ethereum) {
      const detectNetwork = async () => {
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          console.log('Detected chainId:', chainId);
          console.log('Available networks:', Object.keys(NETWORK_CONFIGS));
          
          // Добавляем детальное логирование для отладки
          Object.keys(NETWORK_CONFIGS).forEach(network => {
            console.log(`Network ${network}: chainId = ${NETWORK_CONFIGS[network].chainId}`);
          });
          
          const networkName = Object.keys(NETWORK_CONFIGS).find(
            network => NETWORK_CONFIGS[network].chainId === chainId
          );
          console.log('Detected network name:', networkName);
          
          // Если сеть не найдена, попробуем найти по числовому chainId
          if (!networkName) {
            const chainIdDecimal = parseInt(chainId, 16);
            console.log('ChainId decimal:', chainIdDecimal);
            
            // Специальная обработка для Base
            if (chainIdDecimal === 8453) {
              console.log('Found Base network by decimal chainId');
              setCurrentNetwork('base');
              return;
            }
            
            // Специальная обработка для Ethereum
            if (chainIdDecimal === 1) {
              console.log('Found Ethereum network by decimal chainId');
              setCurrentNetwork('ethereum');
              return;
            }
            
            // Специальная обработка для Zircuit
            if (chainIdDecimal === 48900) {
              console.log('Found Zircuit network by decimal chainId');
              setCurrentNetwork('zircuit');
              return;
            }
            
            // Специальная обработка для Flow
            if (chainIdDecimal === 747) {
              console.log('Found Flow network by decimal chainId');
              setCurrentNetwork('flow');
              return;
            }
          }
          
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

  const handlePay = async () => {
    setSignResult(null);
    setSignError(null);

    if (!window.ethereum) {
      setSignError('MetaMask is not installed');
      return;
    }
    if (!currentNetwork || currentNetwork === 'unknown') {
      setSignError('Please switch to a supported network (Base, Ethereum, World Chain, Zircuit, or Flow) in MetaMask');
      return;
    }
    if (!order) {
      setSignError('Order not loaded');
      return;
    }

    if (!order.wallet || !ethers.isAddress(order.wallet)) {
      setSignError(`В заказе не указан валидный адрес кошелька получателя! Wallet: ${order.wallet}`);
      setIsTransactionPending(false);
      return;
    }

    try {
      setIsTransactionPending(true);
      setSignResult('Creating EIP-7702 batch transaction (approve + depositForBurn)...');
      const result = await createEIP7702Transaction(currentNetwork, order.id, order);
      if (result.success) {
        setSignResult(`EIP-7702 batch transaction submitted successfully! Transaction Hash: ${result.transactionHash}`);
        console.log('EIP-7702 result:', result);
      } else {
        setSignError(`EIP-7702 transaction failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error in transaction:', error);
      setSignError(`Transaction failed: ${error.message}`);
    } finally {
      setIsTransactionPending(false);
    }
  };

  const handleBeamPayPayment = async () => {
    setSignResult(null);
    setSignError(null);

    if (!beamPayAvailable) {
      setSignError('BeamPay extension is not available. Please install the BeamPay Chrome extension.');
      return;
    }

    if (!order) {
      setSignError('Order not loaded');
      return;
    }

    if (!order.wallet || !ethers.isAddress(order.wallet)) {
      setSignError(`Invalid recipient wallet address in order! Wallet: ${order.wallet}`);
      return;
    }

    if (!order.amount || order.amount <= 0) {
      setSignError(`Invalid payment amount in order! Amount: ${order.amount}`);
      return;
    }

    // Map current network to BeamPay supported networks
    const networkMapping = {
      'ethereum': 'ethereum',
      'base': 'ethereum', // BeamPay might use 'ethereum' for mainnet-compatible networks
      'world': 'ethereum',  // Fallback to ethereum for unsupported networks
      'zircuit': 'zircuit', // Zircuit is supported by BeamPay
      'flow': 'flow'        // Flow is supported by BeamPay
    };

    const beamPayNetwork = networkMapping[currentNetwork] || 'ethereum';

    // Check if the network is supported by BeamPay
    if (!beamPaySupportedNetworks.includes(beamPayNetwork)) {
      setSignError(`Network ${currentNetwork} is not supported by BeamPay. Supported networks: ${beamPaySupportedNetworks.join(', ')}`);
      return;
    }

    try {
      setIsTransactionPending(true);
      setSignResult('Processing payment with BeamPay...');

      const result = await window.beampay.sendPayment({
        chain: beamPayNetwork,
        amount: order.amount.toString(),
        to: order.wallet,
        paymentId: `order_${order.id}`
      });

      console.log('BeamPay payment successful!', result);
      setSignResult(`BeamPay payment successful! Transaction Hash: ${result.txHash}, Network: ${result.network}, Method: ${result.method}`);

    } catch (error) {
      console.error('BeamPay payment failed:', error);
      setSignError(`BeamPay payment failed: ${error.message}`);
    } finally {
      setIsTransactionPending(false);
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
          
          <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, border: '1px solid #333', overflowX: 'auto', fontSize: 13 }}>
            <pre style={{ margin: 0, color: '#fff' }}>{JSON.stringify(order, null, 2)}</pre>
          </Box>
          
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
                  {order.wallet && (
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Recipient Wallet</Typography>
                      <Typography variant="body1" sx={{ color: '#7C4DFF', fontWeight: 700, fontFamily: 'monospace' }}>
                        {order.wallet}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
              {order.wallet !== undefined && (
                <Box sx={{ mt: 3, mb: 2, p: 2, bgcolor: 'rgba(124, 77, 255, 0.08)', borderRadius: 2, border: '1px solid rgba(124, 77, 255, 0.2)' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Recipient Wallet (raw)</Typography>
                  <Typography variant="body1" sx={{ color: '#7C4DFF', fontWeight: 700, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {order.wallet === null ? 'null' : order.wallet === '' ? '(пусто)' : order.wallet}
                  </Typography>
                </Box>
              )}
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
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                      Network: {currentNetwork} | Domain: {currentNetwork === 'base' ? '6' : currentNetwork === 'ethereum' ? '0' : currentNetwork === 'zircuit' ? '48900' : currentNetwork === 'flow' ? '747' : 'unknown'}
                    </Typography>
                    
                    {beamPayAvailable && (
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <Chip 
                          label="BeamPay Available"
                          size="small"
                          sx={{ 
                            background: 'linear-gradient(90deg, #FF6B35 0%, #F7931E 100%)',
                            color: '#fff',
                            fontWeight: 600
                          }}
                        />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Networks: {beamPaySupportedNetworks.join(', ')}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
                
                {currentNetwork === 'unknown' && (
                  <Typography variant="body2" sx={{ color: '#ff9800', mb: 3 }}>
                    Please switch to Base, Ethereum, World Chain, Zircuit, or Flow network in MetaMask
                  </Typography>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handlePay}
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

                  {beamPayAvailable && (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleBeamPayPayment}
                      disabled={isTransactionPending}
                      sx={{ 
                        fontWeight: 700, 
                        fontSize: 16, 
                        py: 1.5,
                        background: 'linear-gradient(90deg, #FF6B35 0%, #F7931E 100%)',
                        boxShadow: '0 4px 24px 0 #FF6B3533',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #e55a2b 0%, #de841a 100%)'
                        }
                      }}
                    >
                      {isTransactionPending ? 'Transaction Pending...' : 'Pay with BeamPay (USDC)'}
                    </Button>
                  )}

                  {!beamPayAvailable && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255, 193, 7, 0.1)', borderRadius: 3, border: '1px solid rgba(255, 193, 7, 0.3)' }}>
                      <Typography variant="body2" sx={{ color: '#FFC107', textAlign: 'center' }}>
                        BeamPay extension not detected. Install the BeamPay Chrome extension for additional payment options.
                      </Typography>
                    </Box>
                  )}
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