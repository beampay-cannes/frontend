# Simple Event Subgraph

Сабграф для отслеживания событий контракта SimpleEventContract в сети Base.

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Сгенерируйте код:
```bash
npm run codegen
```

3. Соберите сабграф:
```bash
npm run build
```

## Развертывание

### Локальное развертывание (для тестирования)

1. Запустите локальный Graph Node:
```bash
docker-compose up -d
```

2. Создайте сабграф:
```bash
npm run create-local
```

3. Разверните сабграф:
```bash
npm run deploy-local
```

### Развертывание в The Graph Studio

1. Авторизуйтесь в The Graph Studio
2. Создайте новый сабграф
3. Разверните:
```bash
npm run deploy
```

## Запросы

После развертывания вы можете делать GraphQL запросы:

```graphql
{
  dataEvents(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
    id
    data
    orderId
    blockNumber
    blockTimestamp
    transactionHash
    contractAddress
  }
}
```

## Интеграция с вашим приложением

Вместо использования networkScanner.js, вы можете делать запросы к сабграфу для получения информации о событиях:

```javascript
const query = `
  query GetDataEvents($orderId: BigInt!) {
    dataEvents(where: { orderId: $orderId }) {
      id
      blockTimestamp
      transactionHash
    }
  }
`;

// Выполните запрос к вашему сабграфу
```

## Конфигурация

- **Контракт**: 0xf9397f60c1a45c572132e9e0da89f5e7e71da2ef
- **Сеть**: Base
- **Событие**: DataEmitted(bytes32 indexed data) 