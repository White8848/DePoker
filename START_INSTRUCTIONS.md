# 🚀 DePoker 项目启动指令

## 📋 启动步骤

### 第零步：安装 Hardhat 依赖（首次运行）

```powershell
npm install
```

等待安装完成后，继续下一步。

---

### 第一步：启动 Hardhat 本地区块链节点

打开 **PowerShell 终端 1**，在项目根目录执行：

```powershell
npx hardhat node
```

**保持此终端运行**，你会看到：
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
...
```

---

### 第二步：部署智能合约

打开 **PowerShell 终端 2**（新终端），在项目根目录执行：

```powershell
npx hardhat run scripts/deploy_depoker2.js --network localhost
```

你会看到：
```
DePoker2 deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Saved deployment info to deployments/localhost-DePoker2.json
```

**重要：复制合约地址** `0x5FbDB2315678afecb367f032d93F642f64180aa3`

---

### 第三步：更新合约配置

**注意：部署脚本已自动更新配置文件，通常无需手动操作。**

如果需要手动检查，打开文件 `blockchain/config/contract.ts`，确认合约地址已更新：

```typescript
export const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // ✅ 已自动更新
export const rpcUrl = 'http://127.0.0.1:8545';
export const chainId = 31337;
```

---

### 第四步：启动 React Native 应用

打开 **PowerShell 终端 3**（新终端），在**项目根目录**执行：

```powershell
npx expo start
```

你会看到：
```
Metro waiting on exp://192.168.x.x:8081

› Press w │ open web
› Press a │ open Android  
› Press i │ open iOS simulator
```

选择你的平台：
- 按 `w` - 在浏览器中打开（Web 测试）
- 按 `a` - 在 Android 模拟器/设备中打开
- 按 `i` - 在 iOS 模拟器中打开（仅 Mac）

---

## 📊 终端概览

启动后你应该有 **3 个终端**：

| 终端 | 目录 | 命令 | 状态 |
|------|------|------|------|
| 1️⃣ | 项目根目录 | `npx hardhat node` | 持续运行 |
| 2️⃣ | 项目根目录 | `npx hardhat run scripts/deploy_depoker2.js --network localhost` | 运行完即可关闭 |
| 3️⃣ | 项目根目录 | `npx expo start` | 持续运行 |

---

## 🧪 测试区块链功能

### 1. 创建区块链房间

在应用中：
1. 点击 **"Create New Room"**
2. 填写信息：
   - Room Name: `Test Room`
   - Buy-in Unit: `1000`
   - Blinds: `1/2`
3. **开启 "Enable Blockchain" 开关** ⭐
4. 点击 **"Create Room"**

预期结果：
```
✅ Room created on blockchain!
Room ID: 0
```

### 2. 添加玩家

1. 点击 **"Add Player"**
2. 输入 Name: `Alice`, Amount: `1000`
3. 点击 **"Add Player"**

预期结果：
```
✅ Player added to blockchain!
Address: 0xf39F...2266
Reputation: 0
```

重复添加第二个玩家 Bob。

### 3. 开始游戏

1. 点击 **"Start Game"**
2. 点击 **"Start New Round"**

预期结果：
- 界面显示 BlockchainGamePlay 组件
- 按钮文字：**"End Round & Vote on Chain"**
- 显示 🔗 区块链图标

### 4. 游戏操作

- Fold / Check / Call / Raise / All-In
- 点击 **"End Round & Vote on Chain"**
- 选择赢家
- 自动投票和结算

---

## 🔍 验证

### 检查 Hardhat 节点日志（终端 1）

应该看到交易记录：
```
eth_sendTransaction
  Contract deployment: DePoker2
  
eth_sendTransaction
  Contract call: joinRoom
  From: 0xf39fd6...
  
eth_sendTransaction  
  Contract call: startRoom
```

### 检查应用控制台

应该看到：
```
📝 Loaded 6 test accounts
🔗 Creating room on blockchain...
✅ Blockchain room created: 0
🔗 Adding player Alice to blockchain room 0...
✅ Player joined blockchain room
🔗 Starting blockchain room 0...
✅ Blockchain room started
```

---

## ⚠️ 常见问题

### ❌ "Cannot connect to blockchain"

**解决：** 确保终端 1 的 Hardhat 节点正在运行

### ❌ "Room creation failed"

**解决：** 
1. 检查合约地址是否正确更新到 `blockchain/config/contract.ts`
2. 在 Expo 终端按 `r` 重启应用

### ❌ 节点端口被占用

**解决：**
```powershell
# 杀死占用端口的进程
taskkill /F /IM node.exe

# 等待 2 秒后重新启动节点
```

### ❌ "Player cannot join room"

**解决：** 最多添加 6 个玩家（Hardhat 默认提供 20 个测试账户，应用使用前 6 个）

---

## 🛑 停止项目

按以下顺序关闭：

1. **终端 3（Expo）** - 按 `Ctrl+C` 停止
2. **终端 1（Hardhat）** - 按 `Ctrl+C` 停止
3. 关闭所有终端窗口

---

## 🔄 重新启动

如果需要重新启动（例如合约更新）：

1. 停止所有终端
2. 从**第一步**重新开始
3. **重要：** 每次重启 Hardhat 节点后，合约地址会变化，需要重新部署并更新配置

---

## 📝 快速命令总结

所有命令都在**项目根目录**执行：

```powershell
# 终端 1: Hardhat 节点
npx hardhat node

# 终端 2: 部署合约（等节点启动后）
npx hardhat run scripts/deploy_depoker2.js --network localhost

# 终端 3: 启动应用（更新配置后）
npx expo start
# 按 w 打开浏览器
```

---

**准备好了吗？开始测试吧！** 🎉
