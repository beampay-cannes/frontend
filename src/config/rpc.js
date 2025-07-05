// Base Network Configuration
export const BASE_RPC_URL = process.env.REACT_APP_BASE_RPC_URL || 'https://base-mainnet.g.alchemy.com/v2/hFeeeDTV-4tpKPrCml4oxMtL4IW6u7a_';
export const BASE_CHAIN_ID = process.env.REACT_APP_BASE_CHAIN_ID || '0x2105';
export const BASE_CHAIN_ID_DECIMAL = parseInt(process.env.REACT_APP_BASE_CHAIN_ID_DECIMAL) || 8453;
export const BASE_CHAIN_NAME = process.env.REACT_APP_BASE_CHAIN_NAME || 'Base';
export const BASE_EXPLORER_URL = process.env.REACT_APP_BASE_EXPLORER_URL || 'https://basescan.org';

// Ethereum Mainnet Configuration
export const ETH_RPC_URL = process.env.REACT_APP_ETH_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/hFeeeDTV-4tpKPrCml4oxMtL4IW6u7a_';
export const ETH_CHAIN_ID = process.env.REACT_APP_ETH_CHAIN_ID || '0x1';
export const ETH_CHAIN_ID_DECIMAL = parseInt(process.env.REACT_APP_ETH_CHAIN_ID_DECIMAL) || 1;
export const ETH_CHAIN_NAME = process.env.REACT_APP_ETH_CHAIN_NAME || 'Ethereum';
export const ETH_EXPLORER_URL = process.env.REACT_APP_ETH_EXPLORER_URL || 'https://etherscan.io';

// Network configurations for MetaMask
export const NETWORK_CONFIGS = {
  base: {
    chainId: BASE_CHAIN_ID,
    chainName: BASE_CHAIN_NAME,
    nativeCurrency: { 
      name: 'Ether', 
      symbol: 'ETH', 
      decimals: 18 
    },
    rpcUrls: [BASE_RPC_URL],
    blockExplorerUrls: [BASE_EXPLORER_URL],
  },
  ethereum: {
    chainId: ETH_CHAIN_ID,
    chainName: ETH_CHAIN_NAME,
    nativeCurrency: { 
      name: 'Ether', 
      symbol: 'ETH', 
      decimals: 18 
    },
    rpcUrls: [ETH_RPC_URL],
    blockExplorerUrls: [ETH_EXPLORER_URL],
  }
};

// Chain configurations for viem
export const CHAIN_CONFIGS = {
  base: {
    id: BASE_CHAIN_ID_DECIMAL,
    name: BASE_CHAIN_NAME,
    network: 'base',
    nativeCurrency: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: {
        http: [BASE_RPC_URL],
      },
      public: {
        http: [BASE_RPC_URL],
      },
    },
    blockExplorers: {
      default: {
        name: 'BaseScan',
        url: BASE_EXPLORER_URL,
      },
    },
  },
  ethereum: {
    id: ETH_CHAIN_ID_DECIMAL,
    name: ETH_CHAIN_NAME,
    network: 'ethereum',
    nativeCurrency: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: {
        http: [ETH_RPC_URL],
      },
      public: {
        http: [ETH_RPC_URL],
      },
    },
    blockExplorers: {
      default: {
        name: 'Etherscan',
        url: ETH_EXPLORER_URL,
      },
    },
  }
};

// Helper function to get network config by name
export const getNetworkConfig = (networkName) => {
  return NETWORK_CONFIGS[networkName] || NETWORK_CONFIGS.base;
};

// Helper function to get chain config by name
export const getChainConfig = (networkName) => {
  return CHAIN_CONFIGS[networkName] || CHAIN_CONFIGS.base;
};

// Legacy exports for backward compatibility
export const BASE_NETWORK_CONFIG = NETWORK_CONFIGS.base;
export const customBaseChain = CHAIN_CONFIGS.base; 