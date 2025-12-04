# DePoker2 区块链集成

本项目集成了基于以太坊智能合约的德州扑克积分计算系统。

## 目录结构

```
blockchain/
├── contracts/          # Solidity 智能合约
│   └── DePoker2.sol   # DePoker2 主合约
├── abi/               # 合约 ABI 文件
│   └── DePoker2.json  # DePoker2 合约 ABI
├── config/            # 配置文件
│   └── contract.ts    # 合约地址和网络配置
├── utils/             # 工具函数
│   ├── ethers.ts      # Ethers.js 封装
│   └── contract.ts    # 合约交互函数
├── hooks/             # React Hooks
│   └── useDePoker2.ts # DePoker2 合约 Hook
└── index.ts           # 统一导出
```

## 主要功能

### 1. 房间管理
- **创建房间**: `createRoom(buyIn)` - 创建新的游戏房间
- **加入房间**: `joinRoom(roomId, buyIn)` - 玩家加入房间并支付买入金额
- **开始游戏**: `startRoom(roomId)` - 房主开始游戏

### 2. 投票与结算
- **投票**: `voteWinner(roomId, candidateAddress)` - 玩家投票选择赢家
- **结算**: `finalizeRoom(roomId, winnerAddress)` - 房主确认赢家并分配奖金

### 3. 声望系统
- 正确投票: +1 声望
- 错误投票: -1 声望
- 连续2次错误投票: -10 声望 (惩罚)
- 最低声望要求: -3 (低于此值无法加入房间)

### 4. 查询功能
- `getRoomInfo(roomId)` - 获取房间详细信息
- `getPlayerReputation(address)` - 获取玩家声望
- `getNextRoomId()` - 获取下一个房间ID

## 使用示例

### 在 React Native 组件中使用

```typescript
import { useDePoker2 } from '@/blockchain';

function MyComponent() {
  const { 
    loading, 
    error, 
    createRoom, 
    joinRoom, 
    getRoomInfo 
  } = useDePoker2();

  const handleCreateRoom = async () => {
    const roomId = await createRoom('0.01'); // 0.01 ETH 买入
    if (roomId !== null) {
      console.log('Room created:', roomId);
    }
  };

  // ... 其他逻辑
}
```

### 直接调用合约函数

```typescript
import { createRoom, joinRoom, getRoomInfo } from '@/blockchain';

// 创建房间
const roomId = await createRoom('0.01');

// 加入房间
await joinRoom(roomId, '0.01');

// 获取房间信息
const roomData = await getRoomInfo(roomId);
console.log('Room info:', roomData);
```

## 配置

### 更新合约地址

部署合约后，需要更新 `blockchain/config/contract.ts` 中的合约地址:

```typescript
export const DEPOKER2_CONTRACT = {
  address: '0x你的合约地址',
  abi: DePoker2ABI.abi,
};
```

### 网络配置

默认连接到本地 Hardhat 网络 (http://127.0.0.1:8545)。如需更改:

```typescript
export const HARDHAT_NETWORK = {
  chainId: 31337,
  name: 'Hardhat Local',
  rpcUrl: 'http://你的RPC地址',
};
```

## 依赖安装

```bash
npm install ethers
```

## 本地测试

1. 启动 Hardhat 本地节点:
```bash
cd DePoker
npx hardhat node
```

2. 部署合约:
```bash
npx hardhat run scripts/deploy_depoker2.js --network localhost
```

3. 更新合约地址到 `blockchain/config/contract.ts`

4. 在 React Native 应用中测试功能

## 注意事项

1. **私钥管理**: 在生产环境中，不要在代码中硬编码私钥
2. **Gas 费用**: 所有写操作都需要支付 Gas 费用
3. **交易确认**: 等待交易确认后再执行下一步操作
4. **错误处理**: 始终处理可能的错误情况
5. **声望检查**: 加入房间前检查玩家声望是否满足要求

## 事件监听

合约会发出以下事件:
- `RoomCreated`: 房间创建
- `PlayerJoined`: 玩家加入
- `RoomStarted`: 游戏开始
- `VoteCast`: 投票
- `RoomFinalized`: 游戏结算

可以通过 ethers.js 监听这些事件来更新 UI。
