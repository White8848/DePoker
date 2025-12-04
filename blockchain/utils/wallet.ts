// blockchain/utils/wallet.ts
import { ethers } from 'ethers';

/**
 * 从私钥获取钱包地址
 * @param privateKey 私钥
 */
export function getAddressFromPrivateKey(privateKey: string): string {
  const wallet = new ethers.Wallet(privateKey);
  return wallet.address;
}

/**
 * 验证以太坊地址格式
 * @param address 地址字符串
 */
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

/**
 * 生成新的随机钱包
 */
export function generateRandomWallet(): { address: string; privateKey: string; mnemonic: string } {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic?.phrase || '',
  };
}

/**
 * Hardhat 本地测试账户
 * 这些是 Hardhat 默认提供的测试账户，仅用于本地开发
 */
export const HARDHAT_TEST_ACCOUNTS = [
  {
    index: 0,
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  },
  {
    index: 1,
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  },
  {
    index: 2,
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    privateKey: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
  },
  {
    index: 3,
    address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    privateKey: '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
  },
  {
    index: 4,
    address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    privateKey: '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
  },
  {
    index: 5,
    address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
    privateKey: '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
  },
];

/**
 * 获取 Hardhat 测试账户
 * @param index 账户索引 (0-5)
 */
export function getHardhatTestAccount(index: number = 0) {
  if (index < 0 || index >= HARDHAT_TEST_ACCOUNTS.length) {
    throw new Error(`Invalid account index. Must be between 0 and ${HARDHAT_TEST_ACCOUNTS.length - 1}`);
  }
  return HARDHAT_TEST_ACCOUNTS[index];
}

/**
 * 签名消息
 * @param message 要签名的消息
 * @param privateKey 私钥
 */
export async function signMessage(message: string, privateKey: string): Promise<string> {
  const wallet = new ethers.Wallet(privateKey);
  return await wallet.signMessage(message);
}

/**
 * 验证签名
 * @param message 原始消息
 * @param signature 签名
 */
export function verifySignature(message: string, signature: string): string {
  return ethers.verifyMessage(message, signature);
}

/**
 * 格式化地址显示（缩短显示）
 * @param address 完整地址
 * @param prefixLength 前缀长度（默认6）
 * @param suffixLength 后缀长度（默认4）
 */
export function formatAddress(
  address: string,
  prefixLength: number = 6,
  suffixLength: number = 4
): string {
  if (!isValidAddress(address)) {
    return address;
  }
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}
