const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { updateOrders } = require('./networkScanner');
const { sendTransactionViaEIP7702 } = require('./eip7702');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Настройка хранения файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  }
});
const upload = multer({ storage });

// Эндпоинт для загрузки файла
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Эндпоинт для добавления товара
app.post('/products', (req, res) => {
  const product = req.body;
  const filePath = path.join(__dirname, '../public/products.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read products.json' });
    let products = [];
    try {
      products = JSON.parse(data);
    } catch (e) {}
    product.id = Date.now();
    products.push(product);
    fs.writeFile(filePath, JSON.stringify(products, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Failed to write products.json' });
      res.json({ success: true, product });
    });
  });
});

// Эндпоинт для добавления заказа
app.post('/orders', (req, res) => {
  const order = req.body;
  console.log('New order received:', order);
  
  // Читаем продукты для получения цены
  const productsPath = path.join(__dirname, '../public/products.json');
  const ordersPath = path.join(__dirname, '../public/orders.json');
  
  fs.readFile(productsPath, 'utf8', (err, productsData) => {
    if (err) {
      console.error('Failed to read products.json:', err);
      return res.status(500).json({ error: 'Failed to read products.json' });
    }
    
    let products = [];
    try { products = JSON.parse(productsData); } catch (e) { console.error('Products JSON parse error:', e); }
    
    // Устанавливаем фиксированную сумму 1 USDC
    order.amount = 1;
    
    // Читаем существующие заказы
    fs.readFile(ordersPath, 'utf8', (err, data) => {
      let orders = [];
      if (!err && data) {
        try { orders = JSON.parse(data); } catch (e) { console.error('Orders JSON parse error:', e); }
      }
      order.id = Date.now();
      order.status = 'unpaid';
      order.createdAt = new Date().toISOString();
      orders.push(order);
      fs.writeFile(ordersPath, JSON.stringify(orders, null, 2), (err) => {
        if (err) {
          console.error('Failed to write orders.json:', err);
          return res.status(500).json({ error: 'Failed to write orders.json' });
        }
        console.log('Order saved:', order);
        res.json({ success: true, order });
      });
    });
  });
});

// Ручное обновление статуса заказа (для тестирования)
app.post('/orders/:orderId/status', (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  
  try {
    const filePath = path.join(__dirname, '../public/orders.json');
    const ordersData = fs.readFileSync(filePath, 'utf8');
    const orders = JSON.parse(ordersData);

    const orderIndex = orders.findIndex(order => String(order.id) === String(orderId));
    
    if (orderIndex !== -1) {
      orders[orderIndex].status = status;
      if (status === 'paid') {
        orders[orderIndex].paidAt = new Date().toISOString();
      }
      
      fs.writeFileSync(filePath, JSON.stringify(orders, null, 2));
      res.json({ success: true, message: `Order ${orderId} status updated to ${status}` });
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (error) {
    console.error('Failed to update order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Удаление заказа
app.post('/orders/:orderId/delete', (req, res) => {
  const { orderId } = req.params;
  try {
    const filePath = path.join(__dirname, '../public/orders.json');
    const ordersData = fs.readFileSync(filePath, 'utf8');
    let orders = JSON.parse(ordersData);
    const initialLength = orders.length;
    orders = orders.filter(order => String(order.id) !== String(orderId));
    if (orders.length === initialLength) {
      return res.status(404).json({ error: 'Order not found' });
    }
    fs.writeFileSync(filePath, JSON.stringify(orders, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Получение информации о сети для EIP-7702
app.get('/eip7702/network/:networkName', (req, res) => {
  try {
    const { networkName } = req.params;
    const { getNetworkInfo } = require('./eip7702');
    const networkInfo = getNetworkInfo(networkName);
    res.json({ success: true, networkInfo });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// EIP-7702 транзакции
app.post('/eip7702/transaction', async (req, res) => {
  try {
    const { network, orderId, signedData } = req.body;
    
    if (!network || !orderId || !signedData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: network, orderId, signedData' 
      });
    }

    console.log(`Processing EIP-7702 transaction for order ${orderId} on ${network}`);
    
    const result = await sendTransactionViaEIP7702(network, signedData, orderId);
    
    res.json(result);
  } catch (error) {
    console.error('EIP-7702 transaction error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to process EIP-7702 transaction' 
    });
  }
});

// Эндпоинты для seller.json
const sellerPath = path.join(__dirname, '../public/seller.json');

app.get('/api/seller', (req, res) => {
  fs.readFile(sellerPath, 'utf8', (err, data) => {
    if (err) {
      // Если файла нет, создаём с пустым адресом
      const defaultSeller = { walletAddress: '', chain_id: '0' };
      fs.writeFileSync(sellerPath, JSON.stringify(defaultSeller, null, 2));
      return res.json(defaultSeller);
    }
    try {
      const seller = JSON.parse(data);
      // Убеждаемся, что chain_id есть
      if (!seller.chain_id) {
        seller.chain_id = '0';
      }
      res.json(seller);
    } catch (e) {
      res.status(500).json({ error: 'Failed to parse seller.json' });
    }
  });
});

app.post('/api/seller', (req, res) => {
  const { walletAddress, chain_id } = req.body;
  if (!walletAddress) {
    return res.status(400).json({ error: 'walletAddress is required' });
  }
  const seller = { 
    walletAddress,
    chain_id: chain_id || '0' // По умолчанию Ethereum (Domain 0)
  };
  fs.writeFile(sellerPath, JSON.stringify(seller, null, 2), (err) => {
    if (err) return res.status(500).json({ error: 'Failed to write seller.json' });
    res.json({ success: true, seller });
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  // Запускаем синхронизацию заказов раз в 5 секунд
  setInterval(updateOrders, 5000);
  updateOrders(); // первый запуск сразу
}); 