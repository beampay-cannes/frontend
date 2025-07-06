import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  Chip,
  TextField,
  Alert
} from '@mui/material';
import { ethers } from 'ethers';
import { createEIP7702Transaction } from '../utils/eip7702';
import axios from 'axios';

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
  const [transactionHash, setTransactionHash] = useState(null);
  const [manualTxHash, setManualTxHash] = useState('');
  const [cctpStatus, setCctpStatus] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

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

  // Функция для получения CCTP domain
  const getCCTPDomain = (networkName) => {
    const domainMap = {
      'ethereum': 0,
      'base': 6,
      'zircuit': 48900,
      'flow': 747,
      'world': 14
    };
    return domainMap[networkName] || 0;
  };

  // Функция для получения адреса TokenMessengerV2
  const getTokenMessengerAddress = (networkName) => {
    const addresses = {
      'ethereum': '0x50c8d8db0711bd17fc21e1e111327580ae41a8ef',
      'base': '0x81D40F21F12A8F0E3252Bccb954D722d4c464B64',
      'zircuit': '0x50c8d8db0711bd17fc21e1e111327580ae41a8ef',
      'flow': '0x50c8d8db0711bd17fc21e1e111327580ae41a8ef',
      'world': '0x50c8d8db0711bd17fc21e1e111327580ae41a8ef'
    };
    return addresses[networkName] || '0x50c8d8db0711bd17fc21e1e111327580ae41a8ef';
  };

  // Функция для обработки ручного ввода и проверки CCTP
  const handleManualCCTPCheck = async () => {
    if (!manualTxHash.trim()) {
      alert('Please enter a transaction hash');
      return;
    }

    // ВАЖНО: Для проверки статуса используем все возможные source domains!
    // Пробуем 0 (Ethereum), 6 (Base), и другие популярные
    const possibleSrcDomains = [0, 6, 48900, 747, 14]; // Ethereum, Base, Zircuit, Flow, World
    
    console.log('🔍 DEBUG Check params:');
    console.log('- manualTxHash:', manualTxHash);
    console.log('- manualTxHash.trim():', manualTxHash.trim());
    console.log('- currentNetwork:', currentNetwork);
    console.log('- possibleSrcDomains:', possibleSrcDomains);
    
    // Пробуем каждый domain пока не найдем транзакцию
    let foundTransaction = false;
    for (const srcDomain of possibleSrcDomains) {
      console.log(`🔍 Trying source domain: ${srcDomain}`);
      const found = await checkCCTPTransaction(manualTxHash.trim(), srcDomain);
      if (found) {
        console.log(`✅ Found transaction in domain: ${srcDomain}`);
        foundTransaction = true;
        break;
      }
    }
    
    // Если не найдено ни в одном домене
    if (!foundTransaction) {
      console.log('❌ Transaction not found in any domain');
      setCctpStatus({
        status: 'not_found',
        message: 'Transaction not found in any supported domain (Ethereum, Base, Zircuit, Flow, World)',
        data: null
      });
    }
  };

  // Функция для проверки CCTP API
  const checkCCTPTransaction = async (txHash, srcDomain) => {
    console.log('🔍 DEBUG Function params:');
    console.log('- txHash:', txHash);
    console.log('- srcDomain:', srcDomain);
    console.log('- !txHash:', !txHash);
    console.log('- !srcDomain:', !srcDomain);
    console.log('- srcDomain === undefined:', srcDomain === undefined);
    console.log('- srcDomain === null:', srcDomain === null);
    
    if (!txHash || srcDomain === undefined || srcDomain === null) {
      console.log('❌ Invalid parameters, skipping...');
      return false;
    }

    setIsMonitoring(true);
    
    const url = `https://iris-api.circle.com/v2/messages/${srcDomain}?transactionHash=${txHash}`;
    
    console.log('🔍 CCTP Check Details:');
    console.log('- Transaction Hash:', String(txHash || ''));
    console.log('- Source Domain:', String(srcDomain || ''));
    console.log('- API URL:', url);
    
    try {
      const response = await axios.get(url);
      console.log('✅ API Response:', response.data);
      
      if (!response.data) {
        console.log('❌ Empty response from Circle API');
        return false;
      }
      
      if (response.data.error) {
        console.log('❌ API Error:', response.data.error);
        return false;
      }
      
      if (response.data?.messages?.[0]) {
        const message = response.data.messages[0];
        console.log('📋 Message Object:', message);
        
        // Получаем decoded данные если они есть
        const decodedMessage = message.decodedMessage || {};
        const decodedMessageBody = decodedMessage.decodedMessageBody || {};
        
        console.log('🔍 API Response structure:');
        console.log('- message.message:', message.message);
        console.log('- message.attestation:', message.attestation);
        console.log('- decodedMessage.sourceDomain:', decodedMessage.sourceDomain);
        console.log('- decodedMessage.destinationDomain:', decodedMessage.destinationDomain);
        console.log('- decodedMessageBody.amount:', decodedMessageBody.amount);
        console.log('- decodedMessageBody.mintRecipient:', decodedMessageBody.mintRecipient);
        
        const statusData = {
          status: String(message.status || 'unknown'),
          messageHash: String(message.messageHash || message.hash || 'N/A'),
          sourceDomain: String(decodedMessage.sourceDomain || message.sourceDomain || 'N/A'),
          destinationDomain: String(decodedMessage.destinationDomain || message.destinationDomain || 'N/A'),
          amount: decodedMessageBody.amount ? String(ethers.formatUnits(decodedMessageBody.amount, 6)) : 
                 message.amount ? String(ethers.formatUnits(message.amount, 6)) : 
                 String(message.amount_usdc || 'N/A'),
          recipient: String(decodedMessageBody.mintRecipient || message.mintRecipient || message.recipient || message.to || 'N/A'),
          // ВАЖНО: Используем ПРЯМЫЕ значения из API, не из decoded!
          message: message.message || null,
          attestation: message.attestation || null,
          timestamp: String(message.timestamp || message.created_at || ''),
          data: message
        };
        
        console.log('✅ Final statusData:');
        console.log('- status:', statusData.status);
        console.log('- sourceDomain:', statusData.sourceDomain);
        console.log('- destinationDomain:', statusData.destinationDomain);
        console.log('- amount:', statusData.amount);
        console.log('- recipient:', statusData.recipient);
        console.log('- message length:', statusData.message?.length);
        console.log('- attestation length:', statusData.attestation?.length);
        
        setCctpStatus(statusData);
        
        if (message.status === 'complete') {
          console.log('✅ Transaction complete! Ready for minting.');
        } else if (message.status === 'failed') {
          console.log('❌ Transaction failed.');
        } else {
          console.log('⏳ Transaction still pending.');
        }
        
        return true; // Транзакция найдена!
      } else {
        console.log('❌ No message found for this transaction hash in domain', srcDomain);
        return false;
      }
    } catch (error) {
      console.error('❌ Error fetching transaction status:', error.message);
      
      // Если это 404, значит транзакции нет в этом домене - пробуем следующий
      if (error.response?.status === 404) {
        console.log('⚠️ 404 - Transaction not found in domain', srcDomain);
        return false;
      }
      
      // Для других ошибок показываем только для последнего домена
      setCctpStatus({
        status: 'error',
        message: `Error: ${String(error.message || error || '')}`,
        data: null
      });
      return false;
    } finally {
      setIsMonitoring(false);
    }
  };

  // Функция для mint на destination chain
  const handleMintOnDestination = async () => {
    if (!cctpStatus || !cctpStatus.message || !cctpStatus.attestation) {
      alert('Missing message or attestation data');
      return;
    }

    setIsMinting(true);
    
    try {
      // Определяем destination network
      const destinationDomain = cctpStatus.destinationDomain;
      const destinationDomainNum = parseInt(destinationDomain);
      let destinationNetwork = 'ethereum'; // default
      
      console.log('🔍 DEBUG Mint params:');
      console.log('- cctpStatus.destinationDomain:', destinationDomain);
      console.log('- typeof destinationDomain:', typeof destinationDomain);
      console.log('- destinationDomainNum:', destinationDomainNum);
      console.log('- currentNetwork:', currentNetwork);
      
      // Проверяем что destinationDomain валидный
      if (destinationDomain === 'N/A' || isNaN(destinationDomainNum)) {
        throw new Error(`❌ Invalid destination domain: "${destinationDomain}". Please check CCTP status again to get valid data.`);
      }
      
      if (destinationDomainNum === 6) destinationNetwork = 'base';
      else if (destinationDomainNum === 48900) destinationNetwork = 'zircuit';
      else if (destinationDomainNum === 747) destinationNetwork = 'flow';
      else if (destinationDomainNum === 14) destinationNetwork = 'world';
      else if (destinationDomainNum === 0) destinationNetwork = 'ethereum';
      
      console.log('✅ Determined destination network:', destinationNetwork);
      console.log('🔄 Current network:', currentNetwork);
      console.log('🔄 Need to be on:', destinationNetwork);
      
      // ПРОСТО ПРОВЕРЯЕМ что пользователь на правильной сети
      // НЕ ПЕРЕКЛЮЧАЕМ АВТОМАТИЧЕСКИ - пусть сам переключит!
      if (currentNetwork !== destinationNetwork) {
        const networkName = NETWORK_CONFIGS[destinationNetwork]?.chainName || destinationNetwork;
        const errorMsg = `❌ WRONG NETWORK! You need to be on ${networkName} network to mint. Please switch manually in MetaMask.`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('✅ You are on the correct network, proceeding with mint...');
      
      // Получаем аккаунт пользователя
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      
      // Создаем интерфейс для receiveMessage
      const tokenMessengerABI = [
        {
          "inputs": [
            { "internalType": "bytes", "name": "message", "type": "bytes" },
            { "internalType": "bytes", "name": "attestation", "type": "bytes" }
          ],
          "name": "receiveMessage",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ];
      
      const tokenMessengerInterface = new ethers.Interface(tokenMessengerABI);
      const tokenMessengerAddress = getTokenMessengerAddress(destinationNetwork);
      
      // Кодируем вызов receiveMessage
      const receiveMessageCallData = tokenMessengerInterface.encodeFunctionData('receiveMessage', [
        cctpStatus.message,
        cctpStatus.attestation
      ]);
      
      console.log('💰 Preparing mint transaction...');
      console.log('💰 Destination network:', destinationNetwork);
      console.log('💰 TokenMessenger address:', tokenMessengerAddress);
      console.log('💰 User account:', account);
      console.log('💰 Message:', cctpStatus.message);
      console.log('💰 Message length:', cctpStatus.message?.length);
      console.log('💰 Attestation:', cctpStatus.attestation);
      console.log('💰 Attestation length:', cctpStatus.attestation?.length);
      console.log('💰 Call data:', receiveMessageCallData);
      console.log('💰 Call data length:', receiveMessageCallData?.length);
      
      // Отправляем транзакцию
      console.log('💰 Sending mint transaction...');
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: tokenMessengerAddress,
          data: receiveMessageCallData,
          value: '0x0',
        }]
      });
      
      console.log('✅ Mint transaction sent:', txHash);
      console.log('✅ Mint transaction type:', typeof txHash);
      setSignResult(`Mint transaction sent successfully! Transaction Hash: ${String(txHash || '')}`);
      
    } catch (error) {
      console.error('❌ Error minting on destination chain:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error code:', error.code);
      setSignError(`Mint failed: ${String(error.message || error || '')}`);
    } finally {
      console.log('🏁 Mint process finished');
      setIsMinting(false);
    }
  };

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
      setSignError(`В заказе не указан валидный адрес кошелька получателя! Wallet: ${String(order.wallet)}`);
      setIsTransactionPending(false);
      return;
    }

    try {
      setIsTransactionPending(true);
      setSignResult('Creating EIP-7702 batch transaction (approve + depositForBurn)...');
      const result = await createEIP7702Transaction(currentNetwork, String(order.id), order);
      if (result.success) {
        setSignResult(`EIP-7702 batch transaction submitted successfully! Transaction Hash: ${String(result.transactionHash || '')}`);
        setTransactionHash(String(result.transactionHash || ''));
        console.log('EIP-7702 result:', result);
        
        // Автоматически заполняем поле для ручного ввода
        setManualTxHash(String(result.transactionHash || ''));
      } else {
        setSignError(`EIP-7702 transaction failed: ${String(result.error || '')}`);
      }
    } catch (error) {
      console.error('Error in transaction:', error);
      setSignError(`Transaction failed: ${String(error.message || error || '')}`);
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
      setSignError(`Invalid recipient wallet address in order! Wallet: ${String(order.wallet)}`);
      return;
    }

    if (!order.amount || order.amount <= 0) {
      setSignError(`Invalid payment amount in order! Amount: ${String(order.amount)}`);
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
      setSignError(`Network ${String(currentNetwork || '')} is not supported by BeamPay. Supported networks: ${String(beamPaySupportedNetworks.map(String).join(', '))}`);
      return;
    }

    try {
      setIsTransactionPending(true);
      setSignResult('Processing payment with BeamPay...');

      const result = await window.beampay.sendPayment({
        chain: beamPayNetwork,
        amount: String(order.amount),
        to: String(order.wallet),
        paymentId: `order_${String(order.id)}`
      });

      console.log('BeamPay payment successful!', result);
      setSignResult(`BeamPay payment successful! Transaction Hash: ${String(result.txHash || '')}, Network: ${String(result.network || '')}, Method: ${String(result.method || '')}`);

    } catch (error) {
      console.error('BeamPay payment failed:', error);
      setSignError(`BeamPay payment failed: ${String(error.message || error || '')}`);
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
            Pay for Order #{String(order.id)}
          </Typography>
          
          <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, border: '1px solid #333', overflowX: 'auto', fontSize: 13 }}>
            <pre style={{ margin: 0, color: '#fff' }}>{JSON.stringify(order, null, 2)}</pre>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ mb: 4, p: 3, bgcolor: 'rgba(124, 77, 255, 0.1)', borderRadius: 3, border: '1px solid rgba(124, 77, 255, 0.3)' }}>
              <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>Order ID</Typography>
              <Typography variant="h4" sx={{ color: '#7C4DFF', fontWeight: 700, fontFamily: 'monospace', mb: 3 }}>
                {String(order.id)}
              </Typography>
              
              <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(124, 77, 255, 0.3)' }}>
                <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>Order Details</Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Product</Typography>
                    <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
                      {String(order.productTitle || '')}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Customer</Typography>
                    <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
                      {String(order.name || '')}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Delivery Address</Typography>
                    <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
                      {String(order.address || '')}
                    </Typography>
                  </Box>
                  
                  {order.quantity && (
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Quantity</Typography>
                      <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
                        {String(order.quantity || '')}
                      </Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Amount</Typography>
                    <Typography variant="body1" sx={{ color: '#00E5FF', fontWeight: 700, fontSize: '1.2rem' }}>
                      {String(order.amount || '')} USDC
                    </Typography>
                  </Box>
                  {order.wallet && (
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Recipient Wallet</Typography>
                      <Typography variant="body1" sx={{ color: '#7C4DFF', fontWeight: 700, fontFamily: 'monospace' }}>
                        {String(order.wallet || '')}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
              {order.wallet !== undefined && (
                <Box sx={{ mt: 3, mb: 2, p: 2, bgcolor: 'rgba(124, 77, 255, 0.08)', borderRadius: 2, border: '1px solid rgba(124, 77, 255, 0.2)' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Recipient Wallet (raw)</Typography>
                  <Typography variant="body1" sx={{ color: '#7C4DFF', fontWeight: 700, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {order.wallet === null ? 'null' : order.wallet === '' ? '(пусто)' : String(order.wallet || '')}
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
                          Networks: {String(beamPaySupportedNetworks.map(String).join(', '))}
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

                {/* CCTP Manual Check */}
                <Box sx={{ mt: 3, p: 3, bgcolor: 'rgba(0, 229, 255, 0.1)', borderRadius: 3, border: '1px solid rgba(0, 229, 255, 0.3)' }}>
                  <Typography variant="h6" sx={{ color: '#00E5FF', fontWeight: 700, mb: 2, textAlign: 'center' }}>
                    CCTP Bridge Status
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                      Enter Transaction Hash:
                    </Typography>
                    <TextField
                      fullWidth
                      value={manualTxHash}
                      onChange={(e) => setManualTxHash(e.target.value)}
                      placeholder="0x..."
                      variant="outlined"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: '#fff',
                          fontFamily: 'monospace',
                          '& fieldset': {
                            borderColor: 'rgba(0, 229, 255, 0.3)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(0, 229, 255, 0.5)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#00E5FF',
                          },
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: 'rgba(255, 255, 255, 0.5)',
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                      Current Network: {currentNetwork ? NETWORK_CONFIGS[currentNetwork]?.chainName : 'Unknown'} (Domain: {getCCTPDomain(currentNetwork)})
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleManualCCTPCheck}
                      disabled={isMonitoring || !manualTxHash.trim()}
                      sx={{
                        fontWeight: 700,
                        fontSize: 14,
                        py: 1,
                        px: 3,
                        background: 'linear-gradient(90deg, #00E5FF 0%, #7C4DFF 100%)',
                        boxShadow: '0 4px 24px 0 #00E5FF33',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #00c4e6 0%, #6a3de8 100%)'
                        }
                      }}
                    >
                      {isMonitoring ? 'Checking...' : 'Check CCTP Status'}
                    </Button>
                  </Box>

                  {cctpStatus && (
                    <Box sx={{ mt: 2 }}>
                      <Alert 
                        severity={
                          cctpStatus.status === 'complete' ? 'success' :
                          cctpStatus.status === 'failed' ? 'error' :
                          cctpStatus.status === 'pending' ? 'info' : 'warning'
                        }
                        sx={{ mb: 2 }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Status: {String(cctpStatus.status || 'UNKNOWN').toUpperCase()}
                        </Typography>
                        {cctpStatus.message && (
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {String(cctpStatus.message || '')}
                          </Typography>
                        )}
                      </Alert>

                      {cctpStatus.status === 'complete' && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
                          <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 600, mb: 1 }}>
                            Bridge Details:
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            Amount: {String(cctpStatus.amount || '')} USDC
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            From Domain: {String(cctpStatus.sourceDomain || '')}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            To Domain: {String(cctpStatus.destinationDomain || '')}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            Recipient: {String(cctpStatus.recipient || '')}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Mint Section - всегда доступен */}
                  <Box sx={{ mt: 3, p: 3, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 3, border: '1px solid rgba(76, 175, 80, 0.3)' }}>
                    <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 700, mb: 2, textAlign: 'center' }}>
                      🌉 Mint on Destination Chain
                    </Typography>
                    
                    <Box sx={{ textAlign: 'center' }}>
                      {!cctpStatus ? (
                        <Box>
                          <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              ℹ️ Check CCTP Status First
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              Enter a transaction hash above and click "Check CCTP Status" to get bridge data for minting.
                            </Typography>
                          </Alert>
                          <Button
                            variant="contained"
                            size="large"
                            disabled={true}
                            sx={{ 
                              fontWeight: 700, 
                              fontSize: 16, 
                              py: 1.5,
                              background: 'rgba(76, 175, 80, 0.3)',
                              color: 'rgba(255, 255, 255, 0.5)'
                            }}
                          >
                            Mint on Destination Chain
                          </Button>
                        </Box>
                      ) : cctpStatus.status !== 'complete' ? (
                        <Box>
                          <Alert severity="warning" sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              ⏳ Bridge Not Ready
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              Bridge status: {String(cctpStatus.status || 'UNKNOWN').toUpperCase()}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {cctpStatus.status === 'pending' ? 'Wait for bridge to complete, then check status again.' : 'Bridge must be complete before minting.'}
                            </Typography>
                          </Alert>
                          <Button
                            variant="contained"
                            size="large"
                            disabled={true}
                            sx={{ 
                              fontWeight: 700, 
                              fontSize: 16, 
                              py: 1.5,
                              background: 'rgba(255, 193, 7, 0.3)',
                              color: 'rgba(255, 255, 255, 0.5)'
                            }}
                          >
                            Mint on Destination Chain
                          </Button>
                        </Box>
                      ) : !cctpStatus.message || !cctpStatus.attestation ? (
                        <Box>
                          <Alert severity="error" sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              ❌ Missing Bridge Data
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              Missing: {!cctpStatus.message ? 'message' : ''} {!cctpStatus.attestation ? 'attestation' : ''}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              Check the transaction hash again to get complete data.
                            </Typography>
                          </Alert>
                          <Button
                            variant="contained"
                            size="large"
                            onClick={() => {
                              if (manualTxHash.trim()) {
                                handleManualCCTPCheck();
                              } else {
                                alert('Please enter the transaction hash above and click "Check CCTP Status" first');
                              }
                            }}
                            disabled={isMonitoring || !manualTxHash.trim()}
                            sx={{ 
                              fontWeight: 700, 
                              fontSize: 16, 
                              py: 1.5,
                              background: 'linear-gradient(90deg, #FFC107 0%, #FF9800 100%)',
                              boxShadow: '0 4px 24px 0 #FFC10733',
                              '&:hover': {
                                background: 'linear-gradient(90deg, #ffb300 0%, #f57c00 100%)'
                              }
                            }}
                          >
                            🔄 Refresh CCTP Data
                          </Button>
                        </Box>
                      ) : cctpStatus.destinationDomain === 'N/A' || isNaN(parseInt(cctpStatus.destinationDomain)) ? (
                        <Box>
                          <Alert severity="warning" sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              ⚠️ Invalid destination domain detected!
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              Current destination domain: "{String(cctpStatus.destinationDomain || '')}"
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              Please refresh the CCTP data by checking the transaction hash again.
                            </Typography>
                          </Alert>
                          <Button
                            variant="contained"
                            size="large"
                            onClick={() => {
                              if (manualTxHash.trim()) {
                                handleManualCCTPCheck();
                              } else {
                                alert('Please enter the transaction hash above and click "Check CCTP Status" first');
                              }
                            }}
                            disabled={isMonitoring || !manualTxHash.trim()}
                            sx={{ 
                              fontWeight: 700, 
                              fontSize: 16, 
                              py: 1.5,
                              background: 'linear-gradient(90deg, #FFC107 0%, #FF9800 100%)',
                              boxShadow: '0 4px 24px 0 #FFC10733',
                              '&:hover': {
                                background: 'linear-gradient(90deg, #ffb300 0%, #f57c00 100%)'
                              }
                            }}
                          >
                            🔄 Refresh CCTP Data
                          </Button>
                        </Box>
                      ) : (
                        <Box>
                          <Alert severity="success" sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              ✅ Ready to Mint!
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              Bridge data is complete. You can now mint USDC on the destination chain.
                            </Typography>
                          </Alert>
                          <Button
                            variant="contained"
                            size="large"
                            onClick={handleMintOnDestination}
                            disabled={isMinting}
                            sx={{ 
                              fontWeight: 700, 
                              fontSize: 16, 
                              py: 1.5,
                              background: 'linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%)',
                              boxShadow: '0 4px 24px 0 #4CAF5033',
                              '&:hover': {
                                background: 'linear-gradient(90deg, #45a049 0%, #7cb342 100%)'
                              }
                            }}
                          >
                            {isMinting ? 'Minting...' : 'Mint on Destination Chain'}
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default OrderPayPage; 