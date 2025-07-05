const { ethers } = require('ethers');

const provider = new ethers.JsonRpcProvider('https://base-mainnet.g.alchemy.com/v2/hFeeeDTV-4tpKPrCml4oxMtL4IW6u7a_');

(async () => {
  const logs = await provider.getLogs({
    address: '0xf9397f60c1a45c572132e9e0da89f5e7e71da2ef',
    fromBlock: 32425108,
    toBlock: 32425108,
    topics: ['0x6b91251de2956630d5dd3ba90620a11f0a344cfe9b43fb02c1b900003a512b78']
  });
  console.log('Logs in block 32425108:', logs);
})(); 