// blockchain/index.ts
// 导出所有配置
export * from './config/contract';

// 导出所有工具函数
export * from './utils/contract';
export * from './utils/ethers';
export * from './utils/wallet';

// 导出所有 Hooks
export * from './hooks/useDePoker2';

// 便捷函数：获取所有 Hardhat 账户地址
export { HARDHAT_TEST_ACCOUNTS } from './utils/wallet';

export function getHardhatAccounts(): string[] {
  const { HARDHAT_TEST_ACCOUNTS } = require('./utils/wallet');
  return HARDHAT_TEST_ACCOUNTS.map((acc: any) => acc.address);
}
