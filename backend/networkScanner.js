const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
const CHAINS = require('./chains.config');

// Base Network Configuration (отключено)
// const BASE_CONTRACT_ADDRESS = '...';
// const BASE_ALCHEMY_RPC = '...';

// Ethereum Network Configuration (updated for ConfirmedPayment event)
const ETH_CONTRACT_ADDRESS = '0x2BfC586A555bFd792b9a8b0936277b515CF45773';
const ETH_ALCHEMY_RPC = 'https://eth-mainnet.g.alchemy.com/v2/hFeeeDTV-4tpKPrCml4oxMtL4IW6u7a_';

const ORDERS_PATH = path.join(__dirname, '../public/orders.json');
const LAST_SYNCED_BLOCK_PATH = path.join(__dirname, 'last_synced_block.json');
const EVENT_TOPIC = '0x71b4e18d983a3d72dfd6b1450d60c020be859bd1f345a9c61fd7a0c9dc2b3502';

// Только Ethereum клиент
const ethProvider = new ethers.JsonRpcProvider(ETH_ALCHEMY_RPC);

// Чтение последнего засинканого блока из файла
function getLastSyncedBlockFromFile(enabledChains) {
  try {
    if (fs.existsSync(LAST_SYNCED_BLOCK_PATH)) {
      const data = fs.readFileSync(LAST_SYNCED_BLOCK_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading last synced block file:', error);
  }
  // Возвращаем объект с null для каждой активной сети
  const obj = {};
  for (const chain of enabledChains) obj[chain.name] = null;
  return obj;
}

// Сохранение последнего засинканого блока в файл
function saveLastSyncedBlock(blocks) {
  try {
    fs.writeFileSync(LAST_SYNCED_BLOCK_PATH, JSON.stringify(blocks, null, 2));
    console.log('Last synced blocks saved:', blocks);
  } catch (error) {
    console.error('Error saving last synced block:', error);
  }
}

// Получение событий из ноды для конкретной сети
async function getEventsFromNode(provider, contractAddress, eventTopic, fromBlock, toBlock, eventType = 'payment') {
  try {
    const logs = await provider.getLogs({
      address: contractAddress,
      fromBlock: fromBlock,
      toBlock: toBlock,
      topics: [eventTopic]
    });
    
    const events = [];
    for (const log of logs) {
      try {
        if (eventType === 'mint') {
          // Обработка mint событий для Base TokenMessenger
          console.log(`Found Mint event: txHash=${log.transactionHash}, data=${log.data}`);
          
          // Извлекаем order ID из конца hex данных
          const orderId = extractOrderIdFromMintEvent(log.data);
          if (orderId) {
            console.log(`Extracted order ID from mint event: ${orderId}`);
            events.push(orderId);
          }
        } else {
          // Обработка ConfirmedPayment событий для других сетей
          const iface = new ethers.Interface([
            'event ConfirmedPayment(address indexed to, uint256 indexed amount, string paymentId)'
          ]);
          const decoded = iface.parseLog(log);
          
          // Извлекаем paymentId из события
          const paymentId = decoded.args.paymentId;
          console.log(`Found ConfirmedPayment event: to=${decoded.args.to}, amount=${decoded.args.amount}, paymentId=${paymentId}`);
          
          // Извлекаем order ID из paymentId (формат: "order_123")
          if (paymentId.startsWith('order_')) {
            const orderId = paymentId.replace('order_', '');
            events.push(orderId);
          }
        }
      } catch (decodeError) {
        console.error('Error decoding event:', decodeError);
      }
    }
    
    return events;
  } catch (error) {
    console.error('Error fetching logs from node:', error);
    return [];
  }
}

// Функция для извлечения order ID из mint события
function extractOrderIdFromMintEvent(hexData) {
  try {
    // Убираем префикс 0x
    const cleanHex = hexData.startsWith('0x') ? hexData.slice(2) : hexData;
    
    // Ищем pattern "order_" в конце данных
    // "order_" в hex: 6f726465725f
    const orderPrefix = '6f726465725f';
    const orderIndex = cleanHex.lastIndexOf(orderPrefix);
    
    if (orderIndex === -1) {
      console.log('Order prefix not found in mint event data');
      return null;
    }
    
    // Извлекаем данные после "order_"
    const afterPrefix = cleanHex.slice(orderIndex + orderPrefix.length);
    
    // Убираем trailing zeros и конвертируем в строку
    const cleanAfterPrefix = afterPrefix.replace(/0+$/, '');
    
    // Конвертируем hex в строку
    let orderIdString = '';
    for (let i = 0; i < cleanAfterPrefix.length; i += 2) {
      const hexChar = cleanAfterPrefix.substr(i, 2);
      const charCode = parseInt(hexChar, 16);
      if (charCode > 0) {
        orderIdString += String.fromCharCode(charCode);
      }
    }
    
    console.log(`🔍 Mint event parsing:`)
    console.log(`- Original hex: ${hexData}`)
    console.log(`- Order prefix found at index: ${orderIndex}`)
    console.log(`- After prefix: ${afterPrefix}`)
    console.log(`- Clean after prefix: ${cleanAfterPrefix}`)
    console.log(`- Order ID: ${orderIdString}`)
    
    return orderIdString;
  } catch (error) {
    console.error('Error extracting order ID from mint event:', error);
    return null;
  }
}

// Обновление заказов через ноду для конкретной сети (on-the-fly режим)
async function updateOrdersFromNodeOnTheFly(provider, contractAddress, eventTopic, networkName, lastSyncedBlock, eventType = 'payment') {
  try {
    if (lastSyncedBlock === null) {
      console.log(`No last synced block found for ${networkName}, skipping...`);
      return lastSyncedBlock;
    }
    const latestBlock = Number(await provider.getBlockNumber());
    if (latestBlock <= lastSyncedBlock) {
      console.log(`No new blocks on ${networkName}. Last synced: ${lastSyncedBlock}, Latest: ${latestBlock} (0 blocks)`);
      return lastSyncedBlock;
    }
    
    // On-the-fly режим: сканируем только самые новые блоки (максимум последние 10 блоков)
    const maxBlocksToScan = 10;
    const fromBlock = Math.max(lastSyncedBlock + 1, latestBlock - maxBlocksToScan + 1);
    const toBlock = latestBlock;
    
    if (fromBlock <= toBlock) {
      const blocksProcessed = toBlock - fromBlock + 1;
      console.log(`Scanning recent blocks on ${networkName}: ${fromBlock} to ${toBlock} (${blocksProcessed} blocks, on-the-fly mode)`);
      const paidOrderIds = await getEventsFromNode(provider, contractAddress, eventTopic, fromBlock, toBlock, eventType);
      if (paidOrderIds.length > 0) {
        console.log(`Found ${paidOrderIds.length} new paid orders on ${networkName}:`, paidOrderIds);
        const ordersData = fs.readFileSync(ORDERS_PATH, 'utf8');
        const orders = JSON.parse(ordersData);
        let updated = false;
        for (const order of orders) {
          if (paidOrderIds.includes(order.id.toString()) && order.status !== 'paid') {
            order.status = 'paid';
            order.paidAt = new Date().toISOString();
            order.paidNetwork = networkName;
            updated = true;
            console.log(`Order ${order.id} marked as paid (from ${networkName} on-the-fly)`);
          }
        }
        if (updated) {
          fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2));
          console.log(`orders.json updated from ${networkName} (on-the-fly mode)`);
        }
      }
    }
    
    console.log(`Updated last synced block for ${networkName} to: ${latestBlock} (on-the-fly mode)`);
    return latestBlock;
  } catch (error) {
    console.error(`Error in updateOrdersFromNodeOnTheFly for ${networkName}:`, error);
    return lastSyncedBlock;
  }
}

// Обновление заказов через ноду для конкретной сети (старая функция, оставлена для совместимости)
async function updateOrdersFromNode(provider, contractAddress, eventTopic, networkName, lastSyncedBlock, eventType = 'payment') {
  try {
    if (lastSyncedBlock === null) {
      console.log(`No last synced block found for ${networkName}, skipping...`);
      return lastSyncedBlock;
    }
    const latestBlock = Number(await provider.getBlockNumber());
    if (latestBlock <= lastSyncedBlock) {
      console.log(`No new blocks on ${networkName}. Last synced: ${lastSyncedBlock}, Latest: ${latestBlock} (0 blocks)`);
      return lastSyncedBlock;
    }
    const blocksProcessed = latestBlock - lastSyncedBlock;
    console.log(`Fetching events from ${networkName} block ${lastSyncedBlock + 1} to ${latestBlock} (${blocksProcessed} blocks)`);
    const paidOrderIds = await getEventsFromNode(provider, contractAddress, eventTopic, lastSyncedBlock + 1, latestBlock, eventType);
    if (paidOrderIds.length > 0) {
      console.log(`Found ${paidOrderIds.length} new paid orders on ${networkName}:`, paidOrderIds);
      const ordersData = fs.readFileSync(ORDERS_PATH, 'utf8');
      const orders = JSON.parse(ordersData);
      let updated = false;
      for (const order of orders) {
        if (paidOrderIds.includes(order.id.toString()) && order.status !== 'paid') {
          order.status = 'paid';
          order.paidAt = new Date().toISOString();
          order.paidNetwork = networkName;
          updated = true;
          console.log(`Order ${order.id} marked as paid (from ${networkName} node)`);
        }
      }
      if (updated) {
        fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2));
        console.log(`orders.json updated from ${networkName} node`);
      }
    }
    console.log(`Updated last synced block for ${networkName} to: ${latestBlock}`);
    return latestBlock;
  } catch (error) {
    console.error(`Error in updateOrdersFromNode for ${networkName}:`, error);
    return lastSyncedBlock;
  }
}

// Основная функция для обновления заказов
async function updateOrders() {
  const enabledChains = CHAINS.filter(c => c.enabled);
  const lastSyncedBlocks = getLastSyncedBlockFromFile(enabledChains);

  // Первый запуск - инициализация с текущих блоков (но не сканируем старые блоки)
  let needInit = false;
  for (const chain of enabledChains) {
    if (lastSyncedBlocks[chain.name] === null) needInit = true;
  }
  if (needInit) {
    console.log('First run - initializing enabled networks from current blocks (on-the-fly mode)...');
    const newBlocks = {};
    for (const chain of enabledChains) {
      const provider = new ethers.JsonRpcProvider(chain.rpc);
      const latestBlock = Number(await provider.getBlockNumber());
      newBlocks[chain.name] = latestBlock;
      console.log(`Initialized ${chain.name} starting block: ${latestBlock} (on-the-fly mode)`);
    }
    saveLastSyncedBlock(newBlocks);
    return;
  }

  // Последующие запуски - сканируем только новые блоки (on-the-fly режим)
  console.log('Updating orders from enabled networks (on-the-fly mode)...');
  const newBlocks = {};
  for (const chain of enabledChains) {
    const provider = new ethers.JsonRpcProvider(chain.rpc);
    const eventType = chain.eventType || 'payment';
    console.log(`🔍 Scanning ${chain.name} network: contract=${chain.contract}, eventType=${eventType}, topic=${chain.eventTopic}`);
    
    const newBlock = await updateOrdersFromNodeOnTheFly(
      provider,
      chain.contract,
      chain.eventTopic,
      chain.name,
      lastSyncedBlocks[chain.name],
      eventType
    );
    newBlocks[chain.name] = newBlock;
  }
  saveLastSyncedBlock(newBlocks);
}

if (require.main === module) {
  setInterval(updateOrders, 5000);
  updateOrders(); // первый запуск сразу
}

module.exports = { updateOrders }; 