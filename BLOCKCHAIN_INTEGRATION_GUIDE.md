# 🎮 DePoker 区块链集成使用指南

## 📋 已实现功能

### ✅ 阶段 1: 基础配置
- [x] 区块链状态管理（blockchainEnabled, blockchainRoomId）
- [x] 测试账户自动分配（6个 Hardhat 测试账户）
- [x] 玩家地址映射管理

### ✅ 阶段 2: 房间创建上链
- [x] CreateRoom 组件添加"启用区块链"开关
- [x] 房间创建时同步到区块链
- [x] 显示区块链房间 ID
- [x] 错误处理和降级机制

### ✅ 阶段 3: 玩家 Buy-in 上链
- [x] 玩家加入时调用 joinRoom
- [x] 自动分配钱包地址（Hardhat 测试账户）
- [x] 检查玩家声誉
- [x] 显示玩家地址和声誉

### ✅ 阶段 4: 游戏启动
- [x] 启动游戏时调用 startRoom
- [x] 根据 blockchainEnabled 切换组件
- [x] BlockchainGamePlay 集成

### ⏳ 阶段 5: 投票与结算（已有组件，待测试）
- [x] BlockchainGamePlay 组件已实现投票功能
- [x] 声誉更新逻辑已实现
- [ ] 需要实际测试验证

---

## 🚀 快速启动

### 方法 1: 使用 PowerShell 脚本（推荐）

```powershell
.\start-blockchain.ps1
```

**功能：**
1. 自动启动 Hardhat 节点
2. 部署 DePoker2 合约
3. 更新合约地址到配置文件
4. 启动 Expo 开发服务器

### 方法 2: 使用 Batch 脚本（简化版）

```cmd
start-dev.bat
```

### 方法 3: 手动启动（调试用）

**终端 1 - Hardhat 节点：**
```bash
cd DePoker
npx hardhat node
```

**终端 2 - 部署合约：**
```bash
cd DePoker
npx hardhat run scripts/deploy_depoker2.js --network localhost
```

复制输出的合约地址，更新 `blockchain/config/contract.ts`：
```typescript
export const contractAddress = '0x...'; // 替换为实际地址
```

**终端 3 - 启动应用：**
```bash
npx expo start
```

---

## 🎯 使用流程

### 1. 创建启用区块链的房间

1. 打开应用
2. 点击 "Create New Room"
3. 填写房间信息：
   - Room Name: "Test Blockchain Game"
   - Buy-in Unit: 1000
   - Blinds: 1/2
4. **开启"Enable Blockchain"开关** ⭐
5. 点击 "Create Room"

**预期结果：**
```
✅ Room created on blockchain!
Room ID: 0
Stack: $1000
Blinds: $1/2
Min Reputation: -3
```

### 2. 添加玩家

1. 点击 "Add Player"
2. 输入玩家名字和筹码数量
3. 点击 "Add Player"

**预期结果（启用区块链）：**
```
✅ Player added to blockchain!
Address: 0xf39F...2266
Reputation: 0
```

**测试账户分配：**
- Player 1 → 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
- Player 2 → 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
- Player 3 → 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
- ... (最多6个)

### 3. 开始游戏

1. 添加至少 2 个玩家
2. 点击 "Start Game"
3. 点击 "Start New Round"

**预期结果（启用区块链）：**
```
🔗 Starting blockchain room 0...
✅ Blockchain room started
```

### 4. 游戏流程（区块链模式）

**界面显示：**
- 🔗 图标显示区块链已启用
- "End Round & Vote on Chain" 按钮
- 显示玩家地址（缩短格式）

**操作：**
1. 玩家轮流 Fold/Check/Call/Raise
2. 点击 "End Round & Vote on Chain"
3. 选择赢家
4. 等待区块链确认

**投票与结算：**
- 所有玩家自动投票
- 多数票决定赢家
- 声誉更新：
  - 正确投票 +1
  - 错误投票 -1
  - 连续2次错误 -10

---

## 🔍 调试与验证

### 查看控制台日志

启用区块链后，控制台会显示：

```
📝 Loaded 6 test accounts
🔗 Creating room on blockchain...
✅ Blockchain room created: 0
🔗 Adding player Alice to blockchain room 0...
   Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
   Reputation: 0
✅ Player joined blockchain room
🔗 Starting blockchain room 0...
✅ Blockchain room started
```

### 验证区块链状态

**方法 1: 使用 Hardhat Console**
```bash
cd DePoker
npx hardhat console --network localhost
```

```javascript
const DePoker2 = await ethers.getContractFactory("DePoker2");
const depoker = await DePoker2.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");

// 查看房间信息
const room = await depoker.getRoom(0);
console.log("Room:", room);

// 查看玩家声誉
const rep = await depoker.getReputation("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
console.log("Reputation:", rep.toString());
```

**方法 2: 运行测试脚本**
```bash
cd DePoker
npx hardhat run scripts/test_integration.js --network localhost
```

---

## ⚙️ 配置文件

### blockchain/config/contract.ts

```typescript
export const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
export const rpcUrl = 'http://127.0.0.1:8545';
export const chainId = 31337;
```

**注意：** 每次重启 Hardhat 节点后，需要重新部署合约并更新地址！

---

## 🐛 常见问题

### 1. "Cannot connect to blockchain"

**原因：** Hardhat 节点未启动或地址错误

**解决：**
1. 确认 Hardhat 节点正在运行（终端1）
2. 确认合约地址正确
3. 重新启动应用

### 2. "Player cannot join room"

**原因：** 玩家声誉不足（< -3）

**解决：**
- 使用新的测试账户
- 或修改合约中的最低声誉要求

### 3. "Room creation failed"

**原因：** 
- 网络连接问题
- Gas 不足
- 合约未部署

**解决：**
1. 检查 Hardhat 节点日志
2. 确认合约已部署
3. 查看控制台错误信息

### 4. "Web 浏览器中按钮无响应"

**已修复：** 使用 Modal 替代 Alert.alert（Web不支持）

---

## 📊 区块链数据流

```
创建房间
  ↓
[App] handleCreateRoom
  ↓
[Hook] createRoom(buyIn, sb, bb, minRep)
  ↓
[Contract] DePoker2.createRoom()
  ↓
[Blockchain] 保存房间数据
  ↓
返回 roomId → 保存到 state

添加玩家
  ↓
[App] handleAddPlayer
  ↓
分配测试账户地址
  ↓
[Hook] joinRoom(roomId, playerAddress)
  ↓
[Contract] DePoker2.joinRoom()
  ↓
检查声誉 → 添加到房间

开始游戏
  ↓
[App] handleStartNewRound
  ↓
[Hook] startRoom(roomId)
  ↓
[Contract] DePoker2.startRoom()
  ↓
房间状态: started

结束回合
  ↓
[BlockchainGamePlay] handleBlockchainFinalize
  ↓
[Hook] voteWinner(roomId, winnerAddress)
  ↓
[Contract] 所有玩家投票
  ↓
[Hook] finalizeRoom(roomId, winnerAddress)
  ↓
[Contract] 结算 + 更新声誉
```

---

## 🎨 UI 区别

### 本地模式
- ❌ 无区块链图标
- 按钮文字: "End Round & Award Pot"
- 简单选择赢家弹窗

### 区块链模式
- ✅ 🔗 区块链图标
- 按钮文字: "End Round & Vote on Chain"
- 显示玩家地址
- 投票确认流程
- 声誉分数显示

---

## 📝 下一步计划

### 增强功能
- [ ] 添加加载动画（区块链交易确认中）
- [ ] 显示交易哈希
- [ ] 房间历史记录查询
- [ ] 多房间管理
- [ ] 实时声誉排行榜

### 生产部署
- [ ] 集成 MetaMask 或 WalletConnect
- [ ] 部署到测试网（Sepolia/Goerli）
- [ ] 部署到主网（需审计）
- [ ] 添加真实支付功能

---

## 📚 相关文档

- [BLOCKCHAIN_MIGRATION.md](./BLOCKCHAIN_MIGRATION.md) - 迁移总结
- [QUICK_START.md](./QUICK_START.md) - 快速开始
- [blockchain/README.md](./blockchain/README.md) - 区块链模块说明
- [DePoker/README.md](./DePoker/README.md) - 智能合约文档

---

**祝游戏愉快！ 🎉**
