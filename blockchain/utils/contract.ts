// blockchain/utils/contract.ts
import { formatEther, getDePoker2Contract, getSigner, parseEther, waitForTransaction } from './ethers';

export interface RoomInfo {
  creator: string;
  buyIn: bigint;
  playerCount: bigint;
  totalPool: bigint;
  totalVotes: bigint;
  started: boolean;
  settled: boolean;
  winner: string;
}

export interface RoomData {
  roomId: number;
  creator: string;
  buyIn: string; // 格式化后的以太币
  playerCount: number;
  totalPool: string;
  totalVotes: number;
  started: boolean;
  settled: boolean;
  winner: string;
}

/**
 * 创建房间
 * @param buyIn 买入金额 (以太币)
 * @param privateKey 私钥 (可选)
 */
export async function createRoom(buyIn: string, privateKey?: string): Promise<number> {
  try {
    const signer = await getSigner(privateKey);
    const contract = getDePoker2Contract(signer);
    
    // 先获取当前的 nextRoomId（创建前）
    const nextRoomIdBefore = await contract.nextRoomId();
    
    const buyInWei = parseEther(buyIn);
    const tx = await contract.createRoom(buyInWei);
    const receipt = await waitForTransaction(tx);
    
    if (!receipt) {
      throw new Error('Transaction failed');
    }
    
    // 创建成功后，新房间的 ID 就是之前的 nextRoomId
    const roomId = Number(nextRoomIdBefore);
    console.log(`✅ Room created with ID: ${roomId}`);
    
    return roomId;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
}

/**
 * 加入房间
 * @param roomId 房间ID
 * @param buyIn 买入金额 (以太币)
 * @param privateKey 私钥 (可选)
 */
export async function joinRoom(
  roomId: number,
  buyIn: string,
  privateKey?: string
): Promise<void> {
  try {
    const signer = await getSigner(privateKey);
    const contract = getDePoker2Contract(signer);
    
    const buyInWei = parseEther(buyIn);
    const tx = await contract.joinRoom(roomId, { value: buyInWei });
    await waitForTransaction(tx);
  } catch (error) {
    console.error('Error joining room:', error);
    throw error;
  }
}

/**
 * 开始游戏
 * @param roomId 房间ID
 * @param privateKey 私钥 (可选)
 */
export async function startRoom(roomId: number, privateKey?: string): Promise<void> {
  try {
    const signer = await getSigner(privateKey);
    const contract = getDePoker2Contract(signer);
    
    const tx = await contract.startRoom(roomId);
    await waitForTransaction(tx);
  } catch (error) {
    console.error('Error starting room:', error);
    throw error;
  }
}

/**
 * 投票选择赢家
 * @param roomId 房间ID
 * @param candidateAddress 候选人地址
 * @param privateKey 私钥 (可选)
 */
export async function voteWinner(
  roomId: number,
  candidateAddress: string,
  privateKey?: string
): Promise<void> {
  try {
    const signer = await getSigner(privateKey);
    const contract = getDePoker2Contract(signer);
    
    const tx = await contract.voteWinner(roomId, candidateAddress);
    await waitForTransaction(tx);
  } catch (error) {
    console.error('Error voting:', error);
    throw error;
  }
}

/**
 * 结算房间
 * @param roomId 房间ID
 * @param winnerAddress 赢家地址
 * @param privateKey 私钥 (可选)
 */
export async function finalizeRoom(
  roomId: number,
  winnerAddress: string,
  privateKey?: string
): Promise<void> {
  try {
    const signer = await getSigner(privateKey);
    const contract = getDePoker2Contract(signer);
    
    const tx = await contract.finalize(roomId, winnerAddress);
    await waitForTransaction(tx);
  } catch (error) {
    console.error('Error finalizing room:', error);
    throw error;
  }
}

/**
 * 获取房间信息
 * @param roomId 房间ID
 */
export async function getRoomInfo(roomId: number): Promise<RoomData> {
  try {
    const signer = await getSigner();
    const contract = getDePoker2Contract(signer);
    
    const roomInfo: RoomInfo = await contract.getRoom(roomId);
    
    return {
      roomId,
      creator: roomInfo.creator,
      buyIn: formatEther(roomInfo.buyIn),
      playerCount: Number(roomInfo.playerCount),
      totalPool: formatEther(roomInfo.totalPool),
      totalVotes: Number(roomInfo.totalVotes),
      started: roomInfo.started,
      settled: roomInfo.settled,
      winner: roomInfo.winner,
    };
  } catch (error) {
    console.error('Error getting room info:', error);
    throw error;
  }
}

/**
 * 获取玩家声望
 * @param playerAddress 玩家地址
 */
export async function getPlayerReputation(playerAddress: string): Promise<number> {
  try {
    const signer = await getSigner();
    const contract = getDePoker2Contract(signer);
    
    const reputation = await contract.getReputation(playerAddress);
    return Number(reputation);
  } catch (error) {
    console.error('Error getting reputation:', error);
    throw error;
  }
}

/**
 * 获取下一个房间ID
 */
export async function getNextRoomId(): Promise<number> {
  try {
    const signer = await getSigner();
    const contract = getDePoker2Contract(signer);
    
    const nextRoomId = await contract.nextRoomId();
    return Number(nextRoomId);
  } catch (error) {
    console.error('Error getting next room ID:', error);
    throw error;
  }
}

/**
 * 获取玩家的连续错误投票次数
 * @param playerAddress 玩家地址
 */
export async function getConsecutiveWrongVotes(playerAddress: string): Promise<number> {
  try {
    const signer = await getSigner();
    const contract = getDePoker2Contract(signer);
    
    const wrongVotes = await contract.consecutiveWrongVotes(playerAddress);
    return Number(wrongVotes);
  } catch (error) {
    console.error('Error getting consecutive wrong votes:', error);
    throw error;
  }
}
