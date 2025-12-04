// blockchain/config/contract.ts
import DePoker2ABI from '../abi/DePoker2.json';

// 本地 Hardhat 网络配置
export const HARDHAT_NETWORK = {
  chainId: 31337,
  name: 'Hardhat Local',
  rpcUrl: 'http://127.0.0.1:8545',
};

// DePoker2 合约配置
export const DEPOKER2_CONTRACT = {
  // 部署后的合约地址 - 需要根据实际部署更新
  address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  abi: DePoker2ABI.abi,
};

// 最小声望要求
export const MIN_REPUTATION_TO_JOIN = -3;

// 合约事件名称
export const CONTRACT_EVENTS = {
  RoomCreated: 'RoomCreated',
  PlayerJoined: 'PlayerJoined',
  RoomStarted: 'RoomStarted',
  VoteCast: 'VoteCast',
  RoomFinalized: 'RoomFinalized',
} as const;

export type ContractEventName = keyof typeof CONTRACT_EVENTS;
