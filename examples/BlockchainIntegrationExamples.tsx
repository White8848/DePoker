// Example: 如何在应用中集成区块链功能
// 此文件展示了完整的集成示例，可以作为参考

import { useDePoker2 } from '@/blockchain';
import BlockchainGamePlay from '@/components/poker/BlockchainGamePlay';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * 示例1: 创建区块链房间
 */
export function CreateBlockchainRoomExample() {
  const { loading, error, createRoom, getRoomInfo } = useDePoker2();
  const [roomId, setRoomId] = useState<number | null>(null);

  const handleCreateRoom = async () => {
    // 创建买入金额为 0.01 ETH 的房间
    const newRoomId = await createRoom('0.01');
    
    if (newRoomId !== null) {
      setRoomId(newRoomId);
      Alert.alert('成功', `房间创建成功！房间ID: ${newRoomId}`);
      
      // 获取房间信息
      const roomInfo = await getRoomInfo(newRoomId);
      console.log('房间信息:', roomInfo);
    } else if (error) {
      Alert.alert('错误', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button}
        onPress={handleCreateRoom}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? '创建中...' : '创建区块链房间'}
        </Text>
      </TouchableOpacity>
      
      {roomId && (
        <Text style={styles.info}>房间ID: {roomId}</Text>
      )}
    </View>
  );
}

/**
 * 示例2: 加入区块链房间
 */
export function JoinBlockchainRoomExample() {
  const { loading, error, joinRoom, getPlayerReputation } = useDePoker2();
  const [reputation, setReputation] = useState<number | null>(null);

  const handleJoinRoom = async (roomId: number, buyIn: string, privateKey?: string) => {
    // 先检查玩家声望
    if (privateKey) {
      // 这里需要从私钥获取地址，实际使用中需要实现
      // const address = getAddressFromPrivateKey(privateKey);
      // const rep = await getPlayerReputation(address);
      // setReputation(rep);
      
      // if (rep !== null && rep < -3) {
      //   Alert.alert('错误', '您的声望太低，无法加入房间');
      //   return;
      // }
    }

    const success = await joinRoom(roomId, buyIn, privateKey);
    
    if (success) {
      Alert.alert('成功', '加入房间成功！');
    } else if (error) {
      Alert.alert('错误', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => handleJoinRoom(1, '0.01')}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? '加入中...' : '加入房间'}
        </Text>
      </TouchableOpacity>
      
      {reputation !== null && (
        <Text style={styles.info}>您的声望: {reputation}</Text>
      )}
    </View>
  );
}

/**
 * 示例3: 完整游戏流程
 */
export function CompleteBlockchainGameExample() {
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'ended'>('lobby');
  const [blockchainRoomId, setBlockchainRoomId] = useState<number | undefined>();
  
  const { 
    loading,
    createRoom, 
    startRoom, 
    voteWinner, 
    finalizeRoom 
  } = useDePoker2();

  // 模拟游戏数据
  const [room, setRoom] = useState({
    id: '1',
    name: 'Test Room',
    buyIn: 100,
    smallBlind: 5,
    bigBlind: 10,
    maxPlayers: 6,
    creatorId: 'player1',
    status: 'waiting' as const,
  });

  const [players, setPlayers] = useState([
    { id: 'player1', name: 'Alice', buyIn: 100, currentChips: 100, currentBet: 0, folded: false },
    { id: 'player2', name: 'Bob', buyIn: 100, currentChips: 100, currentBet: 0, folded: false },
  ]);

  const [currentRound, setCurrentRound] = useState({
    roundNumber: 1,
    pot: 0,
    currentBet: 0,
    currentPlayerIndex: 0,
    dealerPosition: 0,
  });

  // 1. 创建区块链房间
  const handleCreateBlockchainRoom = async () => {
    const roomId = await createRoom('0.01');
    if (roomId !== null) {
      setBlockchainRoomId(roomId);
      Alert.alert('成功', `区块链房间创建成功！ID: ${roomId}`);
    }
  };

  // 2. 开始游戏
  const handleStartGame = async () => {
    if (blockchainRoomId !== undefined) {
      const success = await startRoom(blockchainRoomId);
      if (success) {
        setGameState('playing');
        Alert.alert('成功', '游戏已在区块链上开始！');
      }
    } else {
      setGameState('playing');
    }
  };

  // 3. 投票
  const handleVote = async (candidateAddress: string) => {
    if (blockchainRoomId !== undefined) {
      const success = await voteWinner(blockchainRoomId, candidateAddress);
      if (success) {
        Alert.alert('成功', '投票已记录在区块链上！');
      }
    }
  };

  // 4. 结算
  const handleFinalize = async (winnerAddress: string) => {
    if (blockchainRoomId !== undefined) {
      const success = await finalizeRoom(blockchainRoomId, winnerAddress);
      if (success) {
        setGameState('ended');
        Alert.alert('成功', '游戏已在区块链上结算！');
      }
    }
  };

  if (gameState === 'lobby') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>游戏大厅</Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleCreateBlockchainRoom}
          disabled={loading}
        >
          <Text style={styles.buttonText}>创建区块链房间</Text>
        </TouchableOpacity>

        {blockchainRoomId && (
          <>
            <Text style={styles.info}>区块链房间ID: {blockchainRoomId}</Text>
            <TouchableOpacity 
              style={styles.button}
              onPress={handleStartGame}
              disabled={loading}
            >
              <Text style={styles.buttonText}>开始游戏</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  if (gameState === 'playing') {
    return (
      <BlockchainGamePlay
        room={room}
        players={players}
        currentRound={currentRound}
        blockchainRoomId={blockchainRoomId}
        playerAddress="0x..." // 实际地址
        onBack={() => setGameState('lobby')}
        onPlayerAction={(playerId, action, amount) => {
          console.log('玩家操作:', playerId, action, amount);
          // 处理玩家操作...
        }}
        onEndRound={(winners) => {
          console.log('回合结束:', winners);
          // 处理回合结束...
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>游戏结束</Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => setGameState('lobby')}
      >
        <Text style={styles.buttonText}>返回大厅</Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * 示例4: 查询玩家信息
 */
export function PlayerInfoExample() {
  const { getPlayerReputation } = useDePoker2();
  const [reputation, setReputation] = useState<number | null>(null);

  const checkReputation = async (playerAddress: string) => {
    const rep = await getPlayerReputation(playerAddress);
    if (rep !== null) {
      setReputation(rep);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => checkReputation('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')}
      >
        <Text style={styles.buttonText}>查询声望</Text>
      </TouchableOpacity>
      
      {reputation !== null && (
        <View style={styles.reputationContainer}>
          <Text style={styles.info}>玩家声望: {reputation}</Text>
          <Text style={styles.smallText}>
            {reputation >= 0 ? '✅ 良好' : reputation >= -3 ? '⚠️ 警告' : '❌ 禁止加入'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  smallText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.7,
  },
  reputationContainer: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
});

// 导出所有示例组件
export default {
  CreateBlockchainRoomExample,
  JoinBlockchainRoomExample,
  CompleteBlockchainGameExample,
  PlayerInfoExample,
};
