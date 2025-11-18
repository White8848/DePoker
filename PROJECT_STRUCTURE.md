# DePoker - 德扑记账应用

基于区块链技术的德州扑克记账应用，确保游戏过程的透明性和数据不可篡改性。

## 📁 项目结构

```
DePoker/
├── app/                          # 应用路由和页面
│   ├── (tabs)/                   # Tab导航页面
│   │   ├── _layout.tsx           # Tab布局配置
│   │   └── poker.tsx             # 主入口（状态管理）
│   └── _layout.tsx               # 根布局
│
├── components/                   # React组件
│   ├── poker/                    # 扑克应用相关组件
│   │   ├── RoomsList.tsx         # 房间列表页面
│   │   ├── CreateRoom.tsx        # 创建房间页面
│   │   ├── BuyIn.tsx             # 买入页面
│   │   ├── GameScreen.tsx        # 游戏进行页面
│   │   └── SettlementScreen.tsx  # 结算页面
│   ├── themed-text.tsx           # 主题化文本组件
│   ├── themed-view.tsx           # 主题化视图组件
│   └── ui/                       # UI组件
│
├── constants/                    # 常量定义
│   ├── colors.ts                 # 应用颜色常量
│   └── theme.ts                  # 主题配置
│
├── types/                        # TypeScript类型定义
│   └── game.ts                   # 游戏相关类型
│
├── hooks/                        # 自定义Hooks
├── assets/                       # 静态资源
├── package.json                  # 依赖配置
├── tsconfig.json                 # TypeScript配置
└── UI_DESIGN.md                  # UI设计文档
```

## 🎯 核心文件说明

### 类型定义 (`types/game.ts`)
定义了所有游戏相关的TypeScript类型：
- `GameRoom` - 游戏房间
- `Player` - 玩家信息
- `Round` - 游戏轮次
- `Settlement` - 结算信息
- `ViewType` - 视图类型

### 常量配置 (`constants/colors.ts`)
集中管理应用的所有颜色常量：
- 主色调（蓝色系）
- 状态颜色（成功、警告、危险）
- 游戏状态颜色
- 盈亏颜色等

### 页面组件 (`components/poker/`)

#### 1. RoomsList.tsx - 房间列表
- 显示所有游戏房间
- 创建新房间按钮
- 房间状态展示（等待中/进行中/已结束）
- 区块链验证徽章

#### 2. CreateRoom.tsx - 创建房间
- 输入房间名称
- 设置初始筹码
- 区块链上链提示

#### 3. BuyIn.tsx - 玩家买入
- 玩家昵称输入
- 买入金额设置
- 已加入玩家列表
- 开始游戏按钮

#### 4. GameScreen.tsx - 游戏进行
- 玩家筹码展示
- 盈亏统计
- 记录轮次按钮
- 进入结算按钮

#### 5. SettlementScreen.tsx - 游戏结算
- 最终结算展示
- 盈亏汇总
- 转账指引
- 完成游戏

### 主入口 (`app/(tabs)/poker.tsx`)
- 统一的状态管理
- 视图路由控制
- 业务逻辑处理
- 组件编排

## 🚀 运行应用

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 运行iOS
npm run ios

# 运行Android
npm run android

# 运行Web
npm run web
```

## 🔧 技术栈

- **框架**: React Native (Expo ~54.0.25)
- **语言**: TypeScript
- **路由**: Expo Router
- **图标**: @expo/vector-icons (Ionicons)
- **未来集成**: 区块链SDK (待添加)

## 📝 代码组织原则

### 1. 关注点分离
- 类型定义独立 (`types/`)
- 样式常量集中 (`constants/`)
- 组件按功能分组 (`components/poker/`)
- 状态管理集中在主入口

### 2. 组件设计
- 每个页面为独立组件
- 通过Props传递数据和回调
- 组件内部只关注UI渲染
- 业务逻辑在主入口处理

### 3. 可维护性
- 清晰的文件命名
- 统一的代码风格
- 类型安全保障
- 模块化设计

## 🎨 设计系统

### 颜色规范
详见 `constants/colors.ts`，包括：
- 主色调：`#2196F3` (蓝色)
- 成功色：`#4CAF50` (绿色)
- 警告色：`#FFC107` (黄色)
- 危险色：`#F44336` (红色)

### 布局规范
- 统一的内边距：16px
- 圆角：8-12px
- 卡片阴影：elevation: 3
- 按钮高度：48px

## 📋 待开发功能

- [ ] 记录每轮盈亏的详细界面
- [ ] 多人验证机制
- [ ] 区块链集成
- [ ] 数据持久化
- [ ] 钱包集成
- [ ] 智能合约开发

## 🔒 区块链集成计划

1. **选择区块链平台**
   - Ethereum / Polygon
   - Solana
   - 或其他Layer 2方案

2. **智能合约开发**
   - 房间创建合约
   - 买入记录合约
   - 盈亏验证合约
   - 结算合约

3. **钱包集成**
   - WalletConnect
   - MetaMask
   - 或其他Web3钱包

## 🤝 贡献指南

1. 保持现有的文件结构
2. 遵循TypeScript类型定义
3. 使用统一的颜色常量
4. 组件保持单一职责
5. 添加必要的注释

## 📄 许可证

MIT

---

**最后更新**: 2025年11月18日
