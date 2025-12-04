# DePoker 区块链系统迁移完成指南

## ✅ 迁移完成内容

### 1. 区块链模块结构
已创建完整的 `blockchain/` 目录结构，包含：

```
blockchain/
├── contracts/          # Solidity 智能合约
│   └── DePoker2.sol   # 德州扑克积分计算合约
├── abi/               # 合约 ABI (应用二进制接口)
│   ├── DePoker.json   # DePoker 合约 ABI
│   └── DePoker2.json  # DePoker2 合约 ABI
├── config/            # 配置文件
│   └── contract.ts    # 合约地址和网络配置
├── utils/             # 工具函数
│   ├── ethers.ts      # Ethers.js 封装
│   └── contract.ts    # 合约交互函数
├── hooks/             # React Hooks
│   └── useDePoker2.ts # DePoker2 合约交互 Hook
├── index.ts           # 统一导出
└── README.md          # 区块链模块文档
```

### 2. 核心功能

#### DePoker2 智能合约功能
- ✅ 房间创建与管理
- ✅ 玩家加入（支付买入金额）
- ✅ 游戏开始
- ✅ 投票系统（选择赢家）
- ✅ 结算系统（自动分配奖金）
- ✅ 声望系统（奖励正确投票，惩罚错误投票）
- ✅ 自动禁入机制（低声望玩家无法加入）

#### React Native 集成
- ✅ `useDePoker2` Hook - 便捷的合约交互接口
- ✅ `BlockchainGamePlay` 组件 - 集成区块链的游戏界面
- ✅ 工具函数 - 完整的合约调用封装

### 3. 声望系统规则

```
正确投票: +1 声望
错误投票: -1 声望
连续2次错误投票: -10 声望（重置连续计数）
最低加入门槛: -3 声望
```

## 🚀 使用步骤

### 第一步：安装依赖

```bash
npm install
# 或
npm install ethers
```

### 第二步：启动本地区块链节点

在 `DePoker` 目录下：

```bash
cd DePoker
npm install
npx hardhat node
```

保持此终端运行，它会显示本地账户地址和私钥。

### 第三步：部署智能合约

打开新的终端，在 `DePoker` 目录：

```bash
npx hardhat run scripts/deploy_depoker2.js --network localhost
```

记录输出的合约地址，例如：
```
DePoker2 deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 第四步：更新合约地址

编辑 `blockchain/config/contract.ts`，更新合约地址：

```typescript
export const DEPOKER2_CONTRACT = {
  address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // 替换为你的地址
  abi: DePoker2ABI.abi,
};
```

### 第五步：在应用中使用

#### 方式1：使用 Hook (推荐)

```typescript
import { useDePoker2 } from '@/blockchain';

function MyComponent() {
  const { 
    loading, 
    error, 
    createRoom, 
    joinRoom, 
    startRoom,
    voteWinner,
    finalizeRoom,
    getRoomInfo 
  } = useDePoker2();

  const handleCreateRoom = async () => {
    const roomId = await createRoom('0.01'); // 0.01 ETH 买入
    if (roomId !== null) {
      console.log('房间创建成功，ID:', roomId);
    }
  };

  // ...
}
```

#### 方式2：使用区块链游戏组件

```typescript
import BlockchainGamePlay from '@/components/poker/BlockchainGamePlay';

<BlockchainGamePlay
  room={room}
  players={players}
  currentRound={currentRound}
  blockchainRoomId={blockchainRoomId} // 可选：启用区块链功能
  playerAddress={playerAddress}        // 可选：当前玩家地址
  onBack={handleBack}
  onPlayerAction={handlePlayerAction}
  onEndRound={handleEndRound}
/>
```

## 📝 完整游戏流程示例

```typescript
import { useDePoker2 } from '@/blockchain';

// 1. 创建房间
const roomId = await createRoom('0.01'); // 买入 0.01 ETH

// 2. 其他玩家加入
await joinRoom(roomId, '0.01', playerPrivateKey);

// 3. 房主开始游戏
await startRoom(roomId);

// 4. 玩家进行游戏（链下）...

// 5. 游戏结束，玩家投票
await voteWinner(roomId, winnerAddress, voterPrivateKey);

// 6. 房主确认赢家并结算
await finalizeRoom(roomId, winnerAddress, creatorPrivateKey);

// 7. 查询房间信息
const roomInfo = await getRoomInfo(roomId);
console.log('奖池:', roomInfo.totalPool, 'ETH');
console.log('赢家:', roomInfo.winner);
```

## 🔧 配置说明

### 网络配置

默认连接到本地 Hardhat 网络：
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`

如需连接其他网络，修改 `blockchain/config/contract.ts`：

```typescript
export const HARDHAT_NETWORK = {
  chainId: 1337, // 你的链 ID
  name: 'My Network',
  rpcUrl: 'http://your-rpc-url',
};
```

### 私钥管理

**⚠️ 重要安全提示**

- 不要在代码中硬编码私钥
- 不要将私钥提交到 Git
- 在生产环境使用安全的密钥管理方案

开发环境示例（使用 Hardhat 默认账户）：

```typescript
// Hardhat 本地节点提供的测试私钥
const PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

// 使用
await createRoom('0.01', PRIVATE_KEY);
```

## 🎯 主要 API

### 合约交互函数

| 函数 | 说明 | 参数 |
|------|------|------|
| `createRoom(buyIn, privateKey?)` | 创建房间 | buyIn: 以太币字符串 |
| `joinRoom(roomId, buyIn, privateKey?)` | 加入房间 | roomId, buyIn, 私钥 |
| `startRoom(roomId, privateKey?)` | 开始游戏 | roomId, 私钥 |
| `voteWinner(roomId, candidate, privateKey?)` | 投票 | roomId, 候选人地址, 私钥 |
| `finalizeRoom(roomId, winner, privateKey?)` | 结算 | roomId, 赢家地址, 私钥 |
| `getRoomInfo(roomId)` | 查询房间 | roomId |
| `getPlayerReputation(address)` | 查询声望 | 玩家地址 |

### Hook 方法

`useDePoker2()` 返回的方法与上述合约函数一致，额外提供：
- `loading: boolean` - 交易处理中
- `error: string | null` - 错误信息

## 🧪 测试

### 单元测试

```bash
cd DePoker
npx hardhat test test/depoker2.js
```

### 集成测试

参考 `DePoker/scripts/demo_depoker2_round_v3.js` 查看完整的游戏流程演示。

## 📚 相关文档

- [blockchain/README.md](./blockchain/README.md) - 区块链模块详细文档
- [DePoker/README.md](./DePoker/README.md) - 原始合约项目文档
- [DePoker/docs/](./DePoker/docs/) - 测试和演示文档

## ⚠️ 注意事项

1. **Gas 费用**: 所有写操作（创建、加入、投票、结算）都需要 ETH 支付 Gas
2. **交易确认**: 每个操作都需要等待区块链确认（本地网络很快）
3. **声望检查**: 加入房间前会检查玩家声望是否 >= -3
4. **投票要求**: 需要严格多数（>50%）才能结算
5. **一次性投票**: 每个玩家每局只能投票一次

## 🎉 下一步

1. **UI 集成**: 将 `BlockchainGamePlay` 集成到主应用流程
2. **钱包连接**: 集成 WalletConnect 或 MetaMask
3. **多链支持**: 添加测试网或主网配置
4. **离线模式**: 保留非区块链模式作为备选
5. **声望展示**: 在 UI 中显示玩家声望值

## 💡 示例场景

### 本地测试完整流程

```typescript
// 使用 Hardhat 默认账户
const accounts = [
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', // Account #0
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d', // Account #1
  '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a', // Account #2
];

// 1. 账户0创建房间
const roomId = await createRoom('0.01', accounts[0]);

// 2. 账户1、2加入
await joinRoom(roomId, '0.01', accounts[1]);
await joinRoom(roomId, '0.01', accounts[2]);

// 3. 账户0开始游戏
await startRoom(roomId, accounts[0]);

// 4. 假设账户1赢了，所有人投票
const winner = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'; // 账户1的地址
await voteWinner(roomId, winner, accounts[0]);
await voteWinner(roomId, winner, accounts[1]);
await voteWinner(roomId, winner, accounts[2]);

// 5. 结算
await finalizeRoom(roomId, winner, accounts[0]);

// 6. 检查结果
const roomInfo = await getRoomInfo(roomId);
console.log('游戏已结算，赢家:', roomInfo.winner);
console.log('奖金:', roomInfo.totalPool, 'ETH');
```

---

**迁移完成！** 🎊

现在你可以在 React Native 应用中使用完整的区块链德州扑克积分系统了。
