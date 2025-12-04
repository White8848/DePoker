// blockchain/utils/ethers.ts
import { ethers } from 'ethers';
import { DEPOKER2_CONTRACT, HARDHAT_NETWORK } from '../config/contract';

/**
 * 获取 Provider (只读连接)
 */
export function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(HARDHAT_NETWORK.rpcUrl);
}

/**
 * 获取 Signer (可写连接 - 需要私钥)
 * @param privateKey 私钥 (可选，如果不提供则使用 provider)
 */
export async function getSigner(privateKey?: string): Promise<ethers.Signer> {
  const provider = getProvider();
  
  if (privateKey) {
    return new ethers.Wallet(privateKey, provider);
  }
  
  // 使用 Hardhat 本地账户 #0
  return provider.getSigner(0);
}

/**
 * 获取 DePoker2 合约实例
 * @param signerOrProvider Signer 或 Provider
 */
export function getDePoker2Contract(
  signerOrProvider: ethers.Signer | ethers.Provider
): ethers.Contract {
  return new ethers.Contract(
    DEPOKER2_CONTRACT.address,
    DEPOKER2_CONTRACT.abi,
    signerOrProvider
  );
}

/**
 * 格式化以太币金额
 * @param wei Wei 单位的金额
 * @returns 以太币字符串
 */
export function formatEther(wei: bigint | string): string {
  return ethers.formatEther(wei);
}

/**
 * 解析以太币金额为 Wei
 * @param ether 以太币金额字符串
 * @returns Wei 单位的 bigint
 */
export function parseEther(ether: string): bigint {
  return ethers.parseEther(ether);
}

/**
 * 获取账户余额
 * @param address 账户地址
 */
export async function getBalance(address: string): Promise<string> {
  const provider = getProvider();
  const balance = await provider.getBalance(address);
  return formatEther(balance);
}

/**
 * 等待交易确认
 * @param tx 交易响应
 * @param confirmations 确认数 (默认 1)
 */
export async function waitForTransaction(
  tx: ethers.ContractTransactionResponse,
  confirmations: number = 1
): Promise<ethers.ContractTransactionReceipt | null> {
  return await tx.wait(confirmations);
}
