// Упрощенная реализация EIP-7702 с использованием ethers.js для кодирования
// и wallet_sendCalls для отправки транзакций

import { ethers } from 'ethers';

const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

// Конфигурация сетей CCTP V2
const NETWORKS = {
  ethereum: {
    id: 1,
    name: 'ethereum',
    chainId: '0x1',
    rpc: 'https://eth-mainnet.g.alchemy.com/v2/hFeeeDTV-4tpKPrCml4oxMtL4IW6u7a_',
    bundler: 'https://bundler.eth.samczsun.com',
    contract: '0x50c8d8db0711bd17fc21e1e111327580ae41a8ef'
  },
  avalanche: {
    id: 43114,
    name: 'avalanche',
    chainId: '0xa86a',
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    bundler: 'https://bundler.avax.network',
    contract: '0x50c8d8db0711bd17fc21e1e111327580ae41a8ef'
  },
  opMainnet: {
    id: 10,
    name: 'opMainnet',
    chainId: '0xa',
    rpc: 'https://mainnet.optimism.io',
    bundler: 'https://bundler.optimism.io',
    contract: '0x50c8d8db0711bd17fc21e1e111327580ae41a8ef'
  },
  arbitrum: {
    id: 42161,
    name: 'arbitrum',
    chainId: '0xa4b1',
    rpc: 'https://arb1.arbitrum.io/rpc',
    bundler: 'https://bundler.arbitrum.io',
    contract: '0x50c8d8db0711bd17fc21e1e111327580ae41a8ef'
  },
  base: {
    id: 8453,
    name: 'base',
    chainId: '0x2105',
    rpc: 'https://base-mainnet.g.alchemy.com/v2/hFeeeDTV-4tpKPrCml4oxMtL4IW6u7a_',
    bundler: 'https://bundler.base.org',
    contract: '0xf9397f60c1a45c572132e9e0da89f5e7e71da2ef'
  },
  polygon: {
    id: 137,
    name: 'polygon',
    chainId: '0x89',
    rpc: 'https://polygon-rpc.com',
    bundler: 'https://bundler.polygon.io',
    contract: '0x50c8d8db0711bd17fc21e1e111327580ae41a8ef'
  },
  unichain: {
    id: 10,
    name: 'unichain',
    chainId: '0xa',
    rpc: 'https://rpc.unichain.world',
    bundler: 'https://bundler.unichain.world',
    contract: '0x50c8d8db0711bd17fc21e1e111327580ae41a8ef'
  },
  linea: {
    id: 59144,
    name: 'linea',
    chainId: '0xe708',
    rpc: 'https://rpc.linea.build',
    bundler: 'https://bundler.linea.build',
    contract: '0x50c8d8db0711bd17fc21e1e111327580ae41a8ef'
  },
  codex: {
    id: 12,
    name: 'codex',
    chainId: '0xc',
    rpc: 'https://rpc.codex.world',
    bundler: 'https://bundler.codex.world',
    contract: '0x50c8d8db0711bd17fc21e1e111327580ae41a8ef'
  },
  sonic: {
    id: 13,
    name: 'sonic',
    chainId: '0xd',
    rpc: 'https://rpc.sonic.world',
    bundler: 'https://bundler.sonic.world',
    contract: '0x50c8d8db0711bd17fc21e1e111327580ae41a8ef'
  },
  worldchain: {
    id: 14,
    name: 'worldchain',
    chainId: '0xe',
    rpc: 'https://worldchain.world',
    bundler: 'https://bundler.worldchain.world',
    contract: '0x50c8d8db0711bd17fc21e1e111327580ae41a8ef'
  }
};

// Полная конфигурация CCTP V2 Mainnet
const CCTP_V2_CONFIG = {
  // TokenMessengerV2 Mainnet
  tokenMessenger: {
    ethereum: '0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d',
    avalanche: '0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d',
    opMainnet: '0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d',
    arbitrum: '0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d',
    base: '0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d',
    polygon: '0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d',
    unichain: '0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d',
    linea: '0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d',
    codex: '0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d',
    sonic: '0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d',
    worldchain: '0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d'
  },
  // MessageTransmitterV2 Mainnet
  messageTransmitter: {
    ethereum: '0x81D40F21F12A8F0E3252Bccb954D722d4c464B64',
    avalanche: '0x81D40F21F12A8F0E3252Bccb954D722d4c464B64',
    opMainnet: '0x81D40F21F12A8F0E3252Bccb954D722d4c464B64',
    arbitrum: '0x81D40F21F12A8F0E3252Bccb954D722d4c464B64',
    base: '0x81D40F21F12A8F0E3252Bccb954D722d4c464B64',
    polygon: '0x81D40F21F12A8F0E3252Bccb954D722d4c464B64',
    unichain: '0x81D40F21F12A8F0E3252Bccb954D722d4c464B64',
    linea: '0x81D40F21F12A8F0E3252Bccb954D722d4c464B64',
    codex: '0x81D40F21F12A8F0E3252Bccb954D722d4c464B64',
    sonic: '0x81D40F21F12A8F0E3252Bccb954D722d4c464B64',
    worldchain: '0x81D40F21F12A8F0E3252Bccb954D722d4c464B64'
  }
};

// Функция для получения домена CCTP V2 в зависимости от сети
const getCCTPDomain = (network) => {
  const domains = {
    ethereum: 0,      // Ethereum domain
    avalanche: 1,     // Avalanche domain
    opMainnet: 2,     // OP Mainnet domain
    arbitrum: 3,      // Arbitrum domain
    base: 6,          // Base domain
    polygon: 7,       // Polygon PoS domain
    unichain: 10,     // Unichain domain
    linea: 11,        // Linea domain
    codex: 12,        // Codex domain
    sonic: 13,        // Sonic domain
    worldchain: 14    // World Chain domain
  };
  console.log(`Getting domain for network: ${network}, domain: ${domains[network] || 0}`);
  return domains[network] || 0; // По умолчанию Ethereum
};

// Функция для получения адреса TokenMessengerV2 в зависимости от сети
const getTokenMessengerAddress = (network) => {
  const address = CCTP_V2_CONFIG.tokenMessenger[network];
  console.log(`Getting TokenMessenger address for network: ${network}, address: ${address}`);
  return address || CCTP_V2_CONFIG.tokenMessenger.ethereum; // По умолчанию Ethereum
};

// ABI для функций
const USDC_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)"
];

const CCTP_V2_ABI = [
  // {
  //   "inputs": [
  //     { "internalType": "uint256", "name": "amount", "type": "uint256" },
  //     { "internalType": "uint32", "name": "destinationDomain", "type": "uint32" },
  //     { "internalType": "bytes32", "name": "mintRecipient", "type": "bytes32" },
  //     { "internalType": "address", "name": "burnToken", "type": "address" },
  //     { "internalType": "bytes32", "name": "destinationCaller", "type": "bytes32" },
  //     { "internalType": "uint256", "name": "maxFee", "type": "uint256" },
  //     { "internalType": "uint32", "name": "minFinalityThreshold", "type": "uint32" }
  //   ],
  //   "name": "depositForBurn",
  //   "outputs": [],
  //   "stateMutability": "nonpayable",
  //   "type": "function"
  // },
  {
    "inputs": [
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint32", "name": "destinationDomain", "type": "uint32" },
      { "internalType": "bytes32", "name": "mintRecipient", "type": "bytes32" },
      { "internalType": "address", "name": "burnToken", "type": "address" },
      { "internalType": "bytes32", "name": "destinationCaller", "type": "bytes32" },
      { "internalType": "uint256", "name": "maxFee", "type": "uint256" },
      { "internalType": "uint32", "name": "minFinalityThreshold", "type": "uint32" },
      { "internalType": "bytes", "name": "hookData", "type": "bytes" }
    ],
    "name": "depositForBurnWithHook",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Функция для отправки только approve транзакции
export async function sendApproveTransaction(networkName, orderId, orderData) {
  try {
    console.log(`Sending approve transaction for order ${orderId} on ${networkName}...`);

    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const network = NETWORKS[networkName];
    if (!network) {
      throw new Error(`Network ${networkName} not supported`);
    }

    // Получаем аккаунт пользователя
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];

    if (!account) {
      throw new Error('No account found');
    }

    // Получаем chainId (используется для логирования)
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log('Current chainId:', chainId);

    // Подготавливаем данные для транзакций
    const amount = Math.floor(orderData.amount * 1000000); // конвертируем в wei (6 decimals)
    console.log('Network name:', networkName);
    // Используем sellerChainId из заказа, если есть
    const destinationDomain = orderData.sellerChainId
      ? Number(orderData.sellerChainId)
      : getCCTPDomain(networkName);
    // Правильно форматируем mintRecipient как bytes32 (32 байта)
    const mintRecipient = ethers.zeroPadValue(orderData.wallet, 32);
    // Правильно форматируем destinationCaller как bytes32 (32 байта нулей)
    const destinationCaller = ethers.zeroPadValue('0x', 32);
    const maxFee = ethers.parseUnits('0.01', 6); // 0.01 USDC
    const minFinalityThreshold = 100;

    console.log('Transaction parameters:');
    console.log('Amount:', amount);
    console.log('Destination domain:', destinationDomain);
    console.log('Mint recipient (raw):', orderData.wallet);
    console.log('Mint recipient (bytes32):', mintRecipient);
    console.log('Destination caller (bytes32):', destinationCaller);
    console.log('USDC address:', USDC_ADDRESS);
    console.log('Max fee:', maxFee.toString());
    console.log('Min finality threshold:', minFinalityThreshold);

    // Создаем интерфейсы для кодирования
    const usdcInterface = new ethers.Interface(USDC_ABI);
    const cctpInterface = new ethers.Interface(CCTP_V2_ABI);

    // Получаем правильный адрес TokenMessengerV2 для текущей сети
    const tokenMessengerAddress = getTokenMessengerAddress(networkName);
    
    // Кодируем approve call data
    const approveCallData = usdcInterface.encodeFunctionData('approve', [
      tokenMessengerAddress,
      amount
    ]);

    // Создаем hookData с transactionId
    const hookData = ethers.toUtf8Bytes(`order_${orderId}`);
    
    // Проверяем параметры перед кодированием
    console.log('Parameters for depositForBurnWithHook:');
    console.log('1. amount (uint256):', amount);
    console.log('2. destinationDomain (uint32):', destinationDomain);
    console.log('3. mintRecipient (bytes32):', mintRecipient);
    console.log('4. burnToken (address):', USDC_ADDRESS);
    console.log('5. destinationCaller (bytes32):', destinationCaller);
    console.log('6. maxFee (uint256):', maxFee.toString());
    console.log('7. minFinalityThreshold (uint32):', minFinalityThreshold);
    console.log('8. hookData (bytes):', ethers.hexlify(hookData));

    // Кодируем depositForBurnWithHook call data
    const depositForBurnCallData = cctpInterface.encodeFunctionData('depositForBurnWithHook', [
      amount,
      destinationDomain,
      mintRecipient,
      USDC_ADDRESS,
      destinationCaller,
      maxFee,
      minFinalityThreshold,
      hookData
    ]);

    console.log('Encoded call data:');
    console.log('Approve call data:', approveCallData);
    console.log('DepositForBurn call data:', depositForBurnCallData);

    // Отправляем только approve транзакцию
    const res = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: account,
        to: USDC_ADDRESS,
        data: approveCallData,
        value: '0x0',
      }]
    });

    console.log("SendCalls Response:", res);

    // Извлекаем хеш транзакции из ответа
    const txHash = typeof res === 'string' ? res : res.hash || res.transactionHash || res;

    return {
      success: true,
      transactionHash: String(txHash),
      network: networkName,
      orderId,
      type: 'approve',
      call: {
        to: USDC_ADDRESS,
        data: approveCallData,
        value: '0x0',
      }
    };

  } catch (error) {
    console.error(`Error in approve transaction for ${networkName}:`, error);
    return {
      success: false,
      error: error.message,
      network: networkName,
      orderId
    };
  }
}

// Функция для отправки только depositForBurn транзакции
export async function sendDepositForBurnTransaction(networkName, orderId, orderData) {
  try {
    console.log(`Sending depositForBurn transaction for order ${orderId} on ${networkName}...`);

    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const network = NETWORKS[networkName];
    if (!network) {
      throw new Error(`Network ${networkName} not supported`);
    }

    // Получаем аккаунт пользователя
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];

    if (!account) {
      throw new Error('No account found');
    }

    // Подготавливаем данные для транзакции
    const amount = Math.floor(orderData.amount * 1000000); // конвертируем в wei (6 decimals)
    const destinationDomain = orderData.sellerChainId
      ? Number(orderData.sellerChainId)
      : getCCTPDomain(networkName);
    // Правильно форматируем mintRecipient как bytes32 (32 байта)
    const mintRecipient = ethers.zeroPadValue(orderData.wallet, 32);
    // Правильно форматируем destinationCaller как bytes32 (32 байта нулей)
    const destinationCaller = ethers.zeroPadValue('0x', 32);
    const maxFee = ethers.parseUnits('0.01', 6); // 0.01 USDC
    const minFinalityThreshold = 100;

    console.log('DepositForBurn parameters:');
    console.log('Amount:', amount);
    console.log('Destination domain:', destinationDomain);
    console.log('Mint recipient (raw):', orderData.wallet);
    console.log('Mint recipient (bytes32):', mintRecipient);
    console.log('Destination caller (bytes32):', destinationCaller);
    console.log('USDC address:', USDC_ADDRESS);
    console.log('Max fee:', maxFee.toString());
    console.log('Min finality threshold:', minFinalityThreshold);

    // Создаем интерфейс для кодирования
    const cctpInterface = new ethers.Interface(CCTP_V2_ABI);

    // Создаем hookData с transactionId
    const hookData = ethers.toUtf8Bytes(`order_${orderId}`);
    
    // Проверяем параметры перед кодированием
    console.log('Parameters for depositForBurnWithHook:');
    console.log('1. amount (uint256):', amount);
    console.log('2. destinationDomain (uint32):', destinationDomain);
    console.log('3. mintRecipient (bytes32):', mintRecipient);
    console.log('4. burnToken (address):', USDC_ADDRESS);
    console.log('5. destinationCaller (bytes32):', destinationCaller);
    console.log('6. maxFee (uint256):', maxFee.toString());
    console.log('7. minFinalityThreshold (uint32):', minFinalityThreshold);
    console.log('8. hookData (bytes):', ethers.hexlify(hookData));

    // Получаем правильный адрес TokenMessengerV2 для текущей сети
    const tokenMessengerAddress = getTokenMessengerAddress(networkName);
    
    // Кодируем depositForBurnWithHook call data
    const depositForBurnCallData = cctpInterface.encodeFunctionData('depositForBurnWithHook', [
      amount,
      destinationDomain,
      mintRecipient,
      USDC_ADDRESS,
      destinationCaller,
      maxFee,
      minFinalityThreshold,
      hookData
    ]);

    console.log('Encoded depositForBurn call data:', depositForBurnCallData);

    // Отправляем depositForBurn транзакцию
    const res = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: account,
        to: tokenMessengerAddress,
        data: depositForBurnCallData,
        value: '0x0',
      }]
    });

    console.log("DepositForBurn Response:", res);

    // Извлекаем хеш транзакции из ответа
    const txHash = typeof res === 'string' ? res : res.hash || res.transactionHash || res;

    return {
      success: true,
      transactionHash: String(txHash),
      network: networkName,
      orderId,
      type: 'depositForBurn',
      call: {
        to: tokenMessengerAddress,
        data: depositForBurnCallData,
        value: '0x0',
      }
    };

  } catch (error) {
    console.error(`Error in depositForBurn transaction for ${networkName}:`, error);
    return {
      success: false,
      error: error.message,
      network: networkName,
      orderId
    };
  }
}

export async function createEIP7702Transaction(networkName, orderId, orderData) {
  try {
    console.log(`Creating EIP-7702 transaction for order ${orderId} on ${networkName}...`);

    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const network = NETWORKS[networkName];
    if (!network) {
      throw new Error(`Network ${networkName} not supported`);
    }

    // Получаем аккаунт пользователя
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];

    if (!account) {
      throw new Error('No account found');
    }

    const chainId = await window.ethereum.request({ method: 'eth_chainId' });

    // Подготавливаем данные для транзакций
    const amount = Math.floor(orderData.amount * 1000000); // конвертируем в wei (6 decimals)
    const destinationDomain = orderData.sellerChainId
      ? Number(orderData.sellerChainId)
      : getCCTPDomain(networkName);
    const mintRecipient = ethers.zeroPadValue(orderData.wallet, 32);
    const destinationCaller = ethers.zeroPadValue('0x', 32);
    const maxFee = ethers.parseUnits('0.01', 6); // 0.01 USDC
    const minFinalityThreshold = 100;

    console.log('Transaction parameters:');
    console.log('Amount:', amount);
    console.log('Destination domain:', destinationDomain);
    console.log('Mint recipient (raw):', orderData.wallet);
    console.log('Mint recipient (bytes32):', mintRecipient);
    console.log('Destination caller (bytes32):', destinationCaller);
    console.log('USDC address:', USDC_ADDRESS);
    console.log('Max fee:', maxFee.toString());
    console.log('Min finality threshold:', minFinalityThreshold);

    const usdcInterface = new ethers.Interface(USDC_ABI);
    const cctpInterface = new ethers.Interface(CCTP_V2_ABI);

    // Создаем hookData с transactionId
    const hookData = ethers.toUtf8Bytes(`order_${orderId}`);
    console.log('HookData:', ethers.hexlify(hookData));

    const approveCallData = usdcInterface.encodeFunctionData('approve', [
      getTokenMessengerAddress(networkName),
      amount
    ]);

    const depositForBurnCallData = cctpInterface.encodeFunctionData('depositForBurnWithHook', [
      amount,
      destinationDomain,
      mintRecipient,
      USDC_ADDRESS,
      destinationCaller,
      maxFee,
      minFinalityThreshold,
      hookData
    ]);

    console.log('Approve call data:', approveCallData);
    console.log('DepositForBurn call data:', depositForBurnCallData);

    // Batch вызов через wallet_sendCalls
    console.log('📤 SENDING WALLET_SENDCALLS REQUEST...');
    const res = await window.ethereum.request({
      method: 'wallet_sendCalls',
      params: [{
        version: '2.0.0',
        chainId: chainId,
        from: account,
        atomicRequired: true,
        calls: [
          {
            to: USDC_ADDRESS,
            data: approveCallData,
            value: '0x0',
          },
          {
            to: getTokenMessengerAddress(networkName),
            data: depositForBurnCallData,
            value: '0x0',
          }
        ],
      }]
    });

    console.log('🔥 METAMASK RESPONSE - ПОЛНЫЙ ВЫВОД:');
    console.log('📋 Response Raw:', res);
    console.log('📋 Response Type:', typeof res);
    console.log('📋 Response Constructor:', res?.constructor?.name);
    console.log('📋 Response Keys:', Object.keys(res || {}));
    console.log('📋 Response Values:', Object.values(res || {}));
    console.log('📋 Response JSON:', JSON.stringify(res, null, 2));
    console.log('📋 Response String:', String(res));
    console.log('📋 Response ToString:', res?.toString?.());
    
    // Проверяем все возможные поля
    console.log('🔍 CHECKING ALL POSSIBLE FIELDS:');
    console.log('- res.id:', res?.id);
    console.log('- res.hash:', res?.hash);
    console.log('- res.transactionHash:', res?.transactionHash);
    console.log('- res.txHash:', res?.txHash);
    console.log('- res.bundleId:', res?.bundleId);
    console.log('- res.result:', res?.result);
    console.log('- res.data:', res?.data);
    console.log('- res.value:', res?.value);
    console.log('- res.receipt:', res?.receipt);
    console.log('- res.transaction:', res?.transaction);
    console.log('- res.transactions:', res?.transactions);
    console.log('- res.calls:', res?.calls);
    console.log('- res.status:', res?.status);
    console.log('- res.success:', res?.success);
    
    // Если есть вложенные объекты, тоже выводим
    if (res?.result && typeof res.result === 'object') {
      console.log('🔍 NESTED RESULT OBJECT:');
      console.log('- result keys:', Object.keys(res.result));
      console.log('- result values:', Object.values(res.result));
      console.log('- result JSON:', JSON.stringify(res.result, null, 2));
    }
    
    if (res?.data && typeof res.data === 'object') {
      console.log('🔍 NESTED DATA OBJECT:');
      console.log('- data keys:', Object.keys(res.data));
      console.log('- data values:', Object.values(res.data));
      console.log('- data JSON:', JSON.stringify(res.data, null, 2));
    }
    
    if (res?.transactions && Array.isArray(res.transactions)) {
      console.log('🔍 TRANSACTIONS ARRAY:');
      res.transactions.forEach((tx, i) => {
        console.log(`- Transaction ${i}:`, tx);
        console.log(`- Transaction ${i} keys:`, Object.keys(tx || {}));
        console.log(`- Transaction ${i} JSON:`, JSON.stringify(tx, null, 2));
      });
    }

    // EIP-7702 возвращает bundle ID, а не transaction hash
    // Нужно дождаться выполнения батча и получить реальный хеш
    const bundleId = res.id || res;
    
    console.log('⚠️  EIP-7702 Bundle ID (not tx hash):', bundleId);
    
    // Попробуем дождаться выполнения батча и получить реальный хеш
    let actualTxHash = null;
    
    try {
      console.log('🔍 Trying to get actual transaction hash from bundle...');
      
      // Ждем немного чтобы батч выполнился
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Попробуем получить статус батча
      console.log('📤 SENDING WALLET_GETBUNDLESTATUS REQUEST...');
      const bundleStatus = await window.ethereum.request({
        method: 'wallet_getBundleStatus', 
        params: [bundleId]
      });
      
      console.log('🔥 BUNDLE STATUS RESPONSE - ПОЛНЫЙ ВЫВОД:');
      console.log('📋 Bundle Status Raw:', bundleStatus);
      console.log('📋 Bundle Status Type:', typeof bundleStatus);
      console.log('📋 Bundle Status Constructor:', bundleStatus?.constructor?.name);
      console.log('📋 Bundle Status Keys:', Object.keys(bundleStatus || {}));
      console.log('📋 Bundle Status Values:', Object.values(bundleStatus || {}));
      console.log('📋 Bundle Status JSON:', JSON.stringify(bundleStatus, null, 2));
      console.log('📋 Bundle Status String:', String(bundleStatus));
      console.log('📋 Bundle Status ToString:', bundleStatus?.toString?.());
      
      // Проверяем все возможные поля
      console.log('🔍 CHECKING ALL BUNDLE STATUS FIELDS:');
      console.log('- bundleStatus.id:', bundleStatus?.id);
      console.log('- bundleStatus.hash:', bundleStatus?.hash);
      console.log('- bundleStatus.transactionHash:', bundleStatus?.transactionHash);
      console.log('- bundleStatus.txHash:', bundleStatus?.txHash);
      console.log('- bundleStatus.bundleId:', bundleStatus?.bundleId);
      console.log('- bundleStatus.result:', bundleStatus?.result);
      console.log('- bundleStatus.data:', bundleStatus?.data);
      console.log('- bundleStatus.value:', bundleStatus?.value);
      console.log('- bundleStatus.receipt:', bundleStatus?.receipt);
      console.log('- bundleStatus.transaction:', bundleStatus?.transaction);
      console.log('- bundleStatus.transactions:', bundleStatus?.transactions);
      console.log('- bundleStatus.calls:', bundleStatus?.calls);
      console.log('- bundleStatus.status:', bundleStatus?.status);
      console.log('- bundleStatus.success:', bundleStatus?.success);
      console.log('- bundleStatus.receipts:', bundleStatus?.receipts);
      console.log('- bundleStatus.hashes:', bundleStatus?.hashes);
      console.log('- bundleStatus.results:', bundleStatus?.results);
      
      // Если есть массив транзакций, детально выводим каждую
      if (bundleStatus?.transactions && Array.isArray(bundleStatus.transactions)) {
        console.log('🔍 BUNDLE TRANSACTIONS ARRAY:');
        bundleStatus.transactions.forEach((tx, i) => {
          console.log(`📋 Transaction ${i} Raw:`, tx);
          console.log(`📋 Transaction ${i} Type:`, typeof tx);
          console.log(`📋 Transaction ${i} Keys:`, Object.keys(tx || {}));
          console.log(`📋 Transaction ${i} Values:`, Object.values(tx || {}));
          console.log(`📋 Transaction ${i} JSON:`, JSON.stringify(tx, null, 2));
          console.log(`📋 Transaction ${i} String:`, String(tx));
          
          // Проверяем все возможные поля хеша
          console.log(`🔍 Transaction ${i} Hash Fields:`);
          console.log(`- tx.hash:`, tx?.hash);
          console.log(`- tx.transactionHash:`, tx?.transactionHash);
          console.log(`- tx.txHash:`, tx?.txHash);
          console.log(`- tx.id:`, tx?.id);
          console.log(`- tx.result:`, tx?.result);
          console.log(`- tx.receipt:`, tx?.receipt);
          console.log(`- tx.receipt?.transactionHash:`, tx?.receipt?.transactionHash);
          console.log(`- tx.receipt?.hash:`, tx?.receipt?.hash);
        });
      }
      
      // Если есть массив результатов, выводим их тоже
      if (bundleStatus?.results && Array.isArray(bundleStatus.results)) {
        console.log('🔍 BUNDLE RESULTS ARRAY:');
        bundleStatus.results.forEach((result, i) => {
          console.log(`📋 Result ${i}:`, result);
          console.log(`📋 Result ${i} JSON:`, JSON.stringify(result, null, 2));
        });
      }
      
      // Если есть массив хешей, выводим их
      if (bundleStatus?.hashes && Array.isArray(bundleStatus.hashes)) {
        console.log('🔍 BUNDLE HASHES ARRAY:');
        bundleStatus.hashes.forEach((hash, i) => {
          console.log(`📋 Hash ${i}:`, hash);
        });
      }
      
      if (bundleStatus && bundleStatus.transactions && bundleStatus.transactions.length > 0) {
        // Берем хеш последней транзакции (depositForBurn)
        const lastTx = bundleStatus.transactions[bundleStatus.transactions.length - 1];
        actualTxHash = lastTx.hash || lastTx.transactionHash || lastTx;
        console.log('✅ Found actual transaction hash:', actualTxHash);
      }
    } catch (error) {
      console.log('❌ Could not get bundle status:', error.message);
      console.log('❌ Bundle status error object:', error);
    }
    
    // Если не удалось получить реальный хеш, используем bundle ID
    const finalTxHash = actualTxHash || bundleId;
    console.log('Final hash to use:', finalTxHash);

    return {
      success: true,
      transactionHash: String(finalTxHash || ''),
      bundleId: String(bundleId || ''),
      actualTransactionHash: String(actualTxHash || ''),
      network: networkName,
      orderId,
      calls: [
        {
          to: USDC_ADDRESS,
          data: approveCallData,
          value: '0x0',
        },
        {
          to: getTokenMessengerAddress(networkName),
          data: depositForBurnCallData,
          value: '0x0',
        }
      ]
    };
  } catch (error) {
    console.error(`Error in EIP-7702 transaction for ${networkName}:`, error);
    return {
      success: false,
      error: error.message,
      network: networkName,
      orderId
    };
  }
}

export { NETWORKS }; 