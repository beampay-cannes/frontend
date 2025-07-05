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

// World Chain Configuration
export const WORLD_RPC_URL = process.env.REACT_APP_WORLD_RPC_URL || 'https://worldchain.world';
export const WORLD_CHAIN_ID = process.env.REACT_APP_WORLD_CHAIN_ID || '0xe';
export const WORLD_CHAIN_ID_DECIMAL = parseInt(process.env.REACT_APP_WORLD_CHAIN_ID_DECIMAL) || 14;
export const WORLD_CHAIN_NAME = process.env.REACT_APP_WORLD_CHAIN_NAME || 'World Chain';
export const WORLD_EXPLORER_URL = process.env.REACT_APP_WORLD_EXPLORER_URL || 'https://explorer.worldchain.world';

// Zircuit Configuration
export const ZIRCUIT_RPC_URL = process.env.REACT_APP_ZIRCUIT_RPC_URL || 'https://zircuit-mainnet.drpc.org';
export const ZIRCUIT_CHAIN_ID = process.env.REACT_APP_ZIRCUIT_CHAIN_ID || '0xbef4';
export const ZIRCUIT_CHAIN_ID_DECIMAL = parseInt(process.env.REACT_APP_ZIRCUIT_CHAIN_ID_DECIMAL) || 48900;
export const ZIRCUIT_CHAIN_NAME = process.env.REACT_APP_ZIRCUIT_CHAIN_NAME || 'Zircuit';
export const ZIRCUIT_EXPLORER_URL = process.env.REACT_APP_ZIRCUIT_EXPLORER_URL || 'https://explorer.zircuit.com';

// Flow Configuration
export const FLOW_RPC_URL = process.env.REACT_APP_FLOW_RPC_URL || 'https://mainnet.evm.nodes.onflow.org';
export const FLOW_CHAIN_ID = process.env.REACT_APP_FLOW_CHAIN_ID || '0x2eb';
export const FLOW_CHAIN_ID_DECIMAL = parseInt(process.env.REACT_APP_FLOW_CHAIN_ID_DECIMAL) || 747;
export const FLOW_CHAIN_NAME = process.env.REACT_APP_FLOW_CHAIN_NAME || 'Flow';
export const FLOW_EXPLORER_URL = process.env.REACT_APP_FLOW_EXPLORER_URL || 'https://evm.flowscan.io';

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
  },
  avalanche: {
    chainId: '0xa86a',
    chainName: 'Avalanche C-Chain',
    nativeCurrency: { 
      name: 'Avalanche', 
      symbol: 'AVAX', 
      decimals: 18 
    },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://snowtrace.io'],
  },
  opMainnet: {
    chainId: '0xa',
    chainName: 'Optimism',
    nativeCurrency: { 
      name: 'Ether', 
      symbol: 'ETH', 
      decimals: 18 
    },
    rpcUrls: ['https://mainnet.optimism.io'],
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
  },
  arbitrum: {
    chainId: '0xa4b1',
    chainName: 'Arbitrum One',
    nativeCurrency: { 
      name: 'Ether', 
      symbol: 'ETH', 
      decimals: 18 
    },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://arbiscan.io'],
  },
  polygon: {
    chainId: '0x89',
    chainName: 'Polygon',
    nativeCurrency: { 
      name: 'MATIC', 
      symbol: 'MATIC', 
      decimals: 18 
    },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com'],
  },
  linea: {
    chainId: '0xe708',
    chainName: 'Linea',
    nativeCurrency: { 
      name: 'Ether', 
      symbol: 'ETH', 
      decimals: 18 
    },
    rpcUrls: ['https://rpc.linea.build'],
    blockExplorerUrls: ['https://lineascan.build'],
  },
  worldchain: {
    chainId: WORLD_CHAIN_ID,
    chainName: WORLD_CHAIN_NAME,
    nativeCurrency: { 
      name: 'Ether', 
      symbol: 'ETH', 
      decimals: 18 
    },
    rpcUrls: [WORLD_RPC_URL],
    blockExplorerUrls: [WORLD_EXPLORER_URL],
  },
  zircuit: {
    chainId: ZIRCUIT_CHAIN_ID,
    chainName: ZIRCUIT_CHAIN_NAME,
    nativeCurrency: { 
      name: 'Ether', 
      symbol: 'ETH', 
      decimals: 18 
    },
    rpcUrls: [ZIRCUIT_RPC_URL],
    blockExplorerUrls: [ZIRCUIT_EXPLORER_URL],
  },
  flow: {
    chainId: FLOW_CHAIN_ID,
    chainName: FLOW_CHAIN_NAME,
    nativeCurrency: { 
      name: 'Flow', 
      symbol: 'FLOW', 
      decimals: 18 
    },
    rpcUrls: [FLOW_RPC_URL],
    blockExplorerUrls: [FLOW_EXPLORER_URL],
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
  },
  worldchain: {
    id: WORLD_CHAIN_ID_DECIMAL,
    name: WORLD_CHAIN_NAME,
    network: 'worldchain',
    nativeCurrency: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: {
        http: [WORLD_RPC_URL],
      },
      public: {
        http: [WORLD_RPC_URL],
      },
    },
    blockExplorers: {
      default: {
        name: 'WorldChain Explorer',
        url: WORLD_EXPLORER_URL,
      },
    },
  },
  zircuit: {
    id: ZIRCUIT_CHAIN_ID_DECIMAL,
    name: ZIRCUIT_CHAIN_NAME,
    network: 'zircuit',
    nativeCurrency: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: {
        http: [ZIRCUIT_RPC_URL],
      },
      public: {
        http: [ZIRCUIT_RPC_URL],
      },
    },
    blockExplorers: {
      default: {
        name: 'Zircuit Explorer',
        url: ZIRCUIT_EXPLORER_URL,
      },
    },
  },
  flow: {
    id: FLOW_CHAIN_ID_DECIMAL,
    name: FLOW_CHAIN_NAME,
    network: 'flow',
    nativeCurrency: {
      decimals: 18,
      name: 'Flow',
      symbol: 'FLOW',
    },
    rpcUrls: {
      default: {
        http: [FLOW_RPC_URL],
      },
      public: {
        http: [FLOW_RPC_URL],
      },
    },
    blockExplorers: {
      default: {
        name: 'Flow Explorer',
        url: FLOW_EXPLORER_URL,
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