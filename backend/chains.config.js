module.exports = [
  {
    name: 'ethereum',
    enabled: true,
    contract: '0x2BfC586A555bFd792b9a8b0936277b515CF45773',
    rpc: 'https://eth-mainnet.g.alchemy.com/v2/hFeeeDTV-4tpKPrCml4oxMtL4IW6u7a_',
    eventTopic: '0x71b4e18d983a3d72dfd6b1450d60c020be859bd1f345a9c61fd7a0c9dc2b3502'
  },
  {
    name: 'zircuit',
    enabled: true,
    contract: '0x04fd13aED1B64639CCcCeeF1492741835ADCc15F',
    rpc: 'https://zircuit-mainnet.drpc.org',
    eventTopic: '0x71b4e18d983a3d72dfd6b1450d60c020be859bd1f345a9c61fd7a0c9dc2b3502'
  },
  {
    name: 'flow',
    enabled: true,
    contract: '0xEF96A222dEb97BeE8c7c6D24A64a7eb47C2d1186',
    rpc: 'https://mainnet.evm.nodes.onflow.org',
    eventTopic: '0x71b4e18d983a3d72dfd6b1450d60c020be859bd1f345a9c61fd7a0c9dc2b3502'
  },
  {
    name: 'base',
    enabled: false,
    contract: '0xf9397f60c1a45c572132e9e0da89f5e7e71da2ef',
    rpc: 'https://base-mainnet.g.alchemy.com/v2/hFeeeDTV-4tpKPrCml4oxMtL4IW6u7a_',
    eventTopic: 'bd08606ff9a1cf52e08c39be01403b1ac0f930e1be6edbba825cfa3ffa9f3249'
  }
]; 