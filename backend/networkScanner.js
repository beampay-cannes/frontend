const fs = require('fs');
const path = require('path');
// const fetch = require('node-fetch'); // The Graph не используется
const { createPublicClient, http } = require('viem');
const CHAINS = require('./chains.config');

// Base Network Configuration (отключено)
// const BASE_CONTRACT_ADDRESS = '...';
// const BASE_ALCHEMY_RPC = '...';

// Ethereum Network Configuration
const ETH_CONTRACT_ADDRESS = '0x50c8d8db0711bd17fc21e1e111327580ae41a8ef';
const ETH_ALCHEMY_RPC = 'https://eth-mainnet.g.alchemy.com/v2/hFeeeDTV-4tpKPrCml4oxMtL4IW6u7a_';

const ORDERS_PATH = path.join(__dirname, '../public/orders.json');
const LAST_SYNCED_BLOCK_PATH = path.join(__dirname, 'last_synced_block.json');
const EVENT_TOPIC = 'bd08606ff9a1cf52e08c39be01403b1ac0f930e1be6edbba825cfa3ffa9f3249';

// Только Ethereum клиент
const ethClient = createPublicClient({
  transport: http(ETH_ALCHEMY_RPC)
});

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
async function getEventsFromNode(client, contractAddress, eventTopic, fromBlock, toBlock) {
  try {
    const logs = await client.getLogs({
      address: contractAddress,
      fromBlock: BigInt(fromBlock),
      toBlock: BigInt(toBlock),
      topics: [eventTopic]
    });
    return logs.map(log => BigInt(log.topics[1]).toString());
  } catch (error) {
    console.error('Error fetching logs from node:', error);
    return [];
  }
}

// Обновление заказов через ноду для конкретной сети
async function updateOrdersFromNode(client, contractAddress, eventTopic, networkName, lastSyncedBlock) {
  try {
    if (lastSyncedBlock === null) {
      console.log(`No last synced block found for ${networkName}, skipping...`);
      return lastSyncedBlock;
    }
    const latestBlock = Number(await client.getBlockNumber());
    if (latestBlock <= lastSyncedBlock) {
      console.log(`No new blocks on ${networkName}. Last synced: ${lastSyncedBlock}, Latest: ${latestBlock} (0 blocks)`);
      return lastSyncedBlock;
    }
    const blocksProcessed = latestBlock - lastSyncedBlock;
    console.log(`Fetching events from ${networkName} block ${lastSyncedBlock + 1} to ${latestBlock} (${blocksProcessed} blocks)`);
    const paidOrderIds = await getEventsFromNode(client, contractAddress, eventTopic, lastSyncedBlock + 1, latestBlock);
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

  // Первый запуск - инициализация с текущих блоков
  let needInit = false;
  for (const chain of enabledChains) {
    if (lastSyncedBlocks[chain.name] === null) needInit = true;
  }
  if (needInit) {
    console.log('First run - initializing enabled networks from current blocks...');
    const newBlocks = {};
    for (const chain of enabledChains) {
      const client = createPublicClient({ transport: http(chain.rpc) });
      const latestBlock = Number(await client.getBlockNumber());
      newBlocks[chain.name] = latestBlock;
      console.log(`Initialized ${chain.name} starting block: ${latestBlock}`);
    }
    saveLastSyncedBlock(newBlocks);
    return;
  }

  // Последующие запуски - сканируем только включённые сети
  console.log('Updating orders from enabled networks...');
  const newBlocks = {};
  for (const chain of enabledChains) {
    const client = createPublicClient({ transport: http(chain.rpc) });
    const newBlock = await updateOrdersFromNode(
      client,
      chain.contract,
      chain.eventTopic,
      chain.name,
      lastSyncedBlocks[chain.name]
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