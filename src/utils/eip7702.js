import { 
  createPublicClient, 
  createWalletClient, 
  custom, 
  zeroAddress,
} from 'viem';
import { 
  Implementation,
  toMetaMaskSmartAccount,
  getDeleGatorEnvironment,
} from '@metamask/delegation-toolkit';

// Конфигурация сетей
const NETWORKS = {
  ethereum: {
    id: 1,
    name: 'ethereum',
    chainId: '0x1',
    rpc: 'https://eth-mainnet.g.alchemy.com/v2/hFeeeDTV-4tpKPrCml4oxMtL4IW6u7a_',
    bundler: 'https://bundler.eth.samczsun.com',
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
  worldchain: {
    id: 14,
    name: 'worldchain',
    chainId: '0xe',
    rpc: 'https://worldchain.world',
    bundler: 'https://bundler.worldchain.world',
    contract: '0x50c8d8db0711bd17fc21e1e111327580ae41a8ef' // Временный адрес, нужно заменить на реальный
  }
};

// Создание клиентов для конкретной сети
function createClients(networkName) {
  const network = NETWORKS[networkName];
  if (!network) {
    throw new Error(`Network ${networkName} not supported`);
  }

  const publicClient = createPublicClient({
    chain: { id: network.id, name: network.name },
    transport: custom(window.ethereum),
  });

  return { publicClient, network };
}

// Создание wallet client для подписи
function createWalletClientForNetwork(networkName) {
  const network = NETWORKS[networkName];
  return createWalletClient({
    chain: { id: network.id, name: network.name },
    transport: custom(window.ethereum),
  });
}

// Авторизация EIP-7702 делегации
async function authorize7702Delegation(walletClient, networkName) {
  const network = NETWORKS[networkName];
  const environment = getDeleGatorEnvironment(network.id);
  const contractAddress = environment.implementations.EIP7702StatelessDeleGatorImpl;

  console.log(`Authorizing EIP-7702 delegation for ${networkName}...`);
  const [account] = await walletClient.requestAddresses();
  const authorization = await walletClient.signAuthorization({
    account, 
    contractAddress,
    executor: "self", 
  });

  console.log(`Authorization signed for ${networkName}`);
  return authorization;
}

// Отправка авторизации через EIP-7702 транзакцию
async function submitAuthorization(walletClient, authorization) {
  console.log('Submitting EIP-7702 authorization...');
  
  const hash = await walletClient.sendTransaction({ 
    authorizationList: [authorization], 
    data: "0x", 
    to: zeroAddress, 
  });

  console.log(`EIP-7702 transaction submitted: ${hash}`);
  return hash;
}

// Создание MetaMask smart account
async function createSmartAccount(publicClient, walletClient, networkName) {
  const [address] = await walletClient.requestAddresses();

  console.log(`Creating smart account for ${address} on ${networkName}...`);

  const smartAccount = await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Stateless7702,
    address, 
    signatory: { walletClient },
  });

  console.log(`Smart account created for ${networkName}`);
  return smartAccount;
}

// Основная функция для создания EIP-7702 транзакции
export async function createEIP7702Transaction(networkName, orderId) {
  try {
    console.log(`Creating EIP-7702 transaction for order ${orderId} on ${networkName}...`);

    // Создаем клиенты
    const { publicClient, network } = createClients(networkName);
    const walletClient = createWalletClientForNetwork(networkName);

    // Авторизуем делегацию
    const authorization = await authorize7702Delegation(walletClient, networkName);
    
    // Отправляем авторизацию
    await submitAuthorization(walletClient, authorization);

    // Создаем smart account
    const smartAccount = await createSmartAccount(publicClient, walletClient, networkName);

    // Подготавливаем вызов контракта
    const calls = [
      {
        to: network.contract,
        data: `0xbd08606f${orderId.toString().padStart(64, '0')}`, // Вызов функции с orderId
        value: 0n
      }
    ];

    return {
      success: true,
      authorization,
      smartAccount,
      calls,
      network: networkName,
      orderId
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