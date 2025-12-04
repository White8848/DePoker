# 区块链集成快速开始

## 🎯 已完成的迁移

✅ DePoker2 智能合约已迁移到 `blockchain/contracts/`
✅ 合约 ABI 已配置在 `blockchain/abi/`
✅ Ethers.js 工具函数已创建
✅ React Native Hooks 已实现
✅ 区块链游戏组件已创建
✅ Package.json 已更新（添加 ethers）

## 🚀 快速开始（3步）

### 1. 安装依赖
```bash
npm install
```

### 2. 启动本地区块链
新终端窗口：
```bash
cd DePoker
npx hardhat node
```

### 3. 部署合约
新终端窗口：
```bash
cd DePoker
npx hardhat run scripts/deploy_depoker2.js --network localhost
```

然后更新合约地址到：`blockchain/config/contract.ts`

## 💡 在代码中使用

### 方式1：使用 Hook
```typescript
import { useDePoker2 } from '@/blockchain';

const { createRoom, joinRoom, getRoomInfo } = useDePoker2();

// 创建房间
const roomId = await createRoom('0.01');
```

### 方式2：使用区块链游戏组件
```typescript
import BlockchainGamePlay from '@/components/poker/BlockchainGamePlay';

<BlockchainGamePlay
  room={room}
  players={players}
  currentRound={currentRound}
  blockchainRoomId={123}  // 启用区块链
  playerAddress="0x..."
  onBack={handleBack}
  onPlayerAction={handlePlayerAction}
  onEndRound={handleEndRound}
/>
```

## 📚 完整文档

详细文档请查看：
- [BLOCKCHAIN_MIGRATION.md](./BLOCKCHAIN_MIGRATION.md) - 完整迁移指南
- [blockchain/README.md](./blockchain/README.md) - 区块链模块文档

## 🎮 核心功能

1. **创建房间** - 设置买入金额
2. **玩家加入** - 支付 ETH 买入
3. **开始游戏** - 房主启动
4. **投票赢家** - 所有玩家投票
5. **自动结算** - 智能合约分配奖金
6. **声望系统** - 奖惩投票行为

## ⚠️ 注意

- 默认连接本地 Hardhat 网络 (http://127.0.0.1:8545)
- 所有交易需要 ETH 支付 Gas 费
- 玩家声望 < -3 无法加入房间
- 结算需要严格多数投票（>50%）
