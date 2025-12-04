import { getHardhatAccounts, HARDHAT_TEST_ACCOUNTS, useDePoker2 } from '@/blockchain';
import BlockchainGamePlay from '@/components/poker/BlockchainGamePlay';
import BuyIn from '@/components/poker/BuyIn';
import CreateRoom from '@/components/poker/CreateRoom';
import GamePlay from '@/components/poker/GamePlay';
import GameScreen from '@/components/poker/GameScreen';
import RoomsList from '@/components/poker/RoomsList';
import SettlementScreen from '@/components/poker/SettlementScreen';
import { Action, GameRoom, Player, PlayerAction, Round, ViewType } from '@/types/game';
import React, { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

export default function PokerScreen() {
  const [currentView, setCurrentView] = useState<ViewType>('rooms');
  const [rooms, setRooms] = useState<GameRoom[]>([
    { id: '1', name: 'Friday Night Game', status: 'playing', playerCount: 6, createdAt: new Date(), buyInUnit: 1000, smallBlind: 1, bigBlind: 2 },
    { id: '2', name: 'Practice Game', status: 'waiting', playerCount: 2, createdAt: new Date(), buyInUnit: 500, smallBlind: 1, bigBlind: 2 },
  ]);
  const [selectedRoom, setSelectedRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [inGamePlay, setInGamePlay] = useState(false);
  
  // 区块链相关状态
  const [blockchainEnabled, setBlockchainEnabled] = useState(false);
  const [blockchainRoomId, setBlockchainRoomId] = useState<number | undefined>(undefined);
  const [playerAddresses, setPlayerAddresses] = useState<Map<string, string>>(new Map());
  const [playerPrivateKeys, setPlayerPrivateKeys] = useState<Map<string, string>>(new Map());
  const [testAccounts, setTestAccounts] = useState<string[]>([]);
  
  // 区块链 Hook
  const { loading, error, createRoom, joinRoom, startRoom, getPlayerReputation } = useDePoker2();
  
  // 加载测试账户
  useEffect(() => {
    const accounts = getHardhatAccounts();
    setTestAccounts(accounts);
    console.log('📝 Loaded', accounts.length, 'test accounts');
  }, []);

  const handleSelectRoom = (room: GameRoom) => {
    // 切换房间时清空玩家列表和游戏状态
    setPlayers([]);
    setRounds([]);
    setCurrentRound(null);
    setInGamePlay(false);
    setBlockchainEnabled(false);
    setBlockchainRoomId(undefined);
    setPlayerAddresses(new Map());
    setPlayerPrivateKeys(new Map());
    
    setSelectedRoom(room);
    if (room.status === 'waiting') {
      setCurrentView('buyin');
    } else {
      setCurrentView('game');
    }
  };

  const handleCreateRoom = async (name: string, buyInUnit: string, smallBlind: string, bigBlind: string, enableBlockchain: boolean = false) => {
    const buyIn = parseFloat(buyInUnit);
    const sb = parseFloat(smallBlind);
    const bb = parseFloat(bigBlind);
    
    // 清空玩家列表和游戏状态（新房间）
    setPlayers([]);
    setRounds([]);
    setCurrentRound(null);
    setInGamePlay(false);
    setPlayerAddresses(new Map());
    setPlayerPrivateKeys(new Map());
    
    let blockchainId: number | undefined = undefined;
    
    // 如果启用区块链，先创建链上房间
    if (enableBlockchain) {
      console.log('🔗 Creating room on blockchain...');
      const roomId = await createRoom(buyIn.toString()); // 传入买入金额作为字符串
      
      if (roomId !== null) {
        blockchainId = roomId;
        console.log('✅ Blockchain room created:', roomId);
      } else {
        const errorMsg = error || '区块链创建失败';
        if (Platform.OS === 'web') {
          alert(`Warning: ${errorMsg}\n将使用本地模式`);
        } else {
          Alert.alert('Warning', `${errorMsg}\n将使用本地模式`);
        }
      }
    }
    
    const newRoom: GameRoom = {
      id: Date.now().toString(),
      name,
      status: 'waiting',
      playerCount: 0,
      createdAt: new Date(),
      buyInUnit: buyIn,
      smallBlind: sb,
      bigBlind: bb,
    };
    
    setRooms([newRoom, ...rooms]);
    setSelectedRoom(newRoom);
    setBlockchainEnabled(enableBlockchain && blockchainId !== undefined);
    setBlockchainRoomId(blockchainId);
    
    const message = enableBlockchain && blockchainId !== undefined
      ? `Room created on blockchain!\nRoom ID: ${blockchainId}\nStack: $${buyIn}\nBlinds: $${sb}/$${bb}\nMin Reputation: -3`
      : `Room created locally\nStack: $${buyIn}\nBlinds: $${sb}/$${bb}`;
    
    if (Platform.OS === 'web') {
      alert(message);
      setCurrentView('buyin');
    } else {
      Alert.alert('Success', message, [
        { text: 'Start Buy-in', onPress: () => setCurrentView('buyin') }
      ]);
    }
  };

  const handleAddPlayer = async (name: string, amount: number) => {
    // 检查名字是否重复
    const nameExists = players.some(player => player.name.toLowerCase() === name.toLowerCase());
    if (nameExists) {
      const errorMsg = `Player name "${name}" already exists!`;
      if (Platform.OS === 'web') {
        alert(errorMsg);
      } else {
        Alert.alert('Error', errorMsg);
      }
      return;
    }
    
    // 为玩家分配测试账户地址
    const playerIndex = players.length;
    const playerAddress = testAccounts[playerIndex] || testAccounts[0];
    const playerPrivateKey = HARDHAT_TEST_ACCOUNTS[playerIndex]?.privateKey;
    
    let reputation = 0;
    
    // 如果启用区块链，先加入区块链房间
    if (blockchainEnabled && blockchainRoomId !== undefined) {
      console.log(`🔗 Adding player ${name} to blockchain room ${blockchainRoomId}...`);
      console.log(`   Using account #${playerIndex}: ${playerAddress}`);
      
      if (!playerPrivateKey) {
        const errorMsg = `No private key for player index ${playerIndex}`;
        if (Platform.OS === 'web') {
          alert(`Error: ${errorMsg}`);
        } else {
          Alert.alert('Error', errorMsg);
        }
        return;
      }
      
      // 检查声誉
      const rep = await getPlayerReputation(playerAddress);
      reputation = rep !== null ? rep : 0;
      console.log(`   Reputation: ${reputation}`);
      
      // 使用该玩家的私钥加入房间
      const success = await joinRoom(blockchainRoomId, amount.toString(), playerPrivateKey);
      
      if (!success) {
        const errorMsg = error || '无法加入区块链房间';
        if (Platform.OS === 'web') {
          alert(`Error: ${errorMsg}`);
        } else {
          Alert.alert('Error', errorMsg);
        }
        return;
      }
      
      console.log('✅ Player joined blockchain room');
    }
    
    const newPlayer: Player = {
      id: Date.now().toString(),
      name,
      buyIn: amount,
      currentChips: amount,
      profit: 0,
      folded: false,
      currentBet: 0,
      position: players.length,
    };
    
    setPlayers([...players, newPlayer]);
    
    // 保存玩家地址和私钥映射
    const newAddresses = new Map(playerAddresses);
    newAddresses.set(newPlayer.id, playerAddress);
    setPlayerAddresses(newAddresses);
    
    const newPrivateKeys = new Map(playerPrivateKeys);
    newPrivateKeys.set(newPlayer.id, playerPrivateKey);
    setPlayerPrivateKeys(newPrivateKeys);
    
    const message = blockchainEnabled
      ? `Player added to blockchain!\nAddress: ${playerAddress.slice(0, 6)}...${playerAddress.slice(-4)}\nReputation: ${reputation}`
      : 'Player added';
    
    if (Platform.OS === 'web') {
      alert(message);
    } else {
      Alert.alert('Success', message);
    }
  };

  const handleStartGame = () => {
    if (selectedRoom) {
      selectedRoom.status = 'playing';
    }
    setCurrentView('game');
  };

  const handleStartNewRound = async () => {
    if (!selectedRoom || players.length < 2) {
      const msg = 'Need at least 2 players to start a round';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
      return;
    }

    // 如果启用区块链
    if (blockchainEnabled && blockchainRoomId !== undefined) {
      if (rounds.length === 0) {
        // 第一轮：启动区块链房间
        console.log(`🔗 Starting blockchain room ${blockchainRoomId}...`);
        const success = await startRoom(blockchainRoomId);
        
        if (!success) {
          const errorMsg = error || '无法启动区块链房间';
          if (Platform.OS === 'web') {
            alert(`Warning: ${errorMsg}\n将继续使用本地模式`);
          } else {
            Alert.alert('Warning', `${errorMsg}\n将继续使用本地模式`);
          }
        } else {
          console.log('✅ Blockchain room started');
        }
      } else {
        // 第二轮及以后：区块链房间已结算，需要创建新房间
        const msg = '⚠️ Blockchain room has been settled.\n\nTo play another round on-chain, please:\n1. Go back to rooms list\n2. Create a new blockchain room\n3. Add players again\n\nOr continue playing locally (blockchain disabled).';
        
        if (Platform.OS === 'web') {
          const continueLocal = confirm(msg + '\n\nContinue locally?');
          if (continueLocal) {
            // 禁用区块链模式，继续本地游戏
            setBlockchainEnabled(false);
            setBlockchainRoomId(undefined);
          } else {
            return; // 用户选择不继续
          }
        } else {
          Alert.alert(
            'Blockchain Room Settled',
            msg,
            [
              {
                text: 'Continue Locally',
                onPress: () => {
                  setBlockchainEnabled(false);
                  setBlockchainRoomId(undefined);
                }
              },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
          return;
        }
      }
    }

    // Reset player states
    const resetPlayers = players.map(p => ({
      ...p,
      folded: false,
      currentBet: 0,
    }));
    setPlayers(resetPlayers);

    // Determine dealer position
    const dealerPos = rounds.length % players.length;

    // Collect blinds
    const sbPos = (dealerPos + 1) % players.length;
    const bbPos = (dealerPos + 2) % players.length;

    resetPlayers[sbPos].currentChips -= selectedRoom.smallBlind;
    resetPlayers[sbPos].currentBet = selectedRoom.smallBlind;
    resetPlayers[bbPos].currentChips -= selectedRoom.bigBlind;
    resetPlayers[bbPos].currentBet = selectedRoom.bigBlind;

    const newRound: Round = {
      id: Date.now().toString(),
      roundNumber: rounds.length + 1,
      timestamp: new Date(),
      actions: [],
      pot: selectedRoom.smallBlind + selectedRoom.bigBlind,
      winners: [],
      dealerPosition: dealerPos,
      bettingRound: 'preflop',
      currentPlayerIndex: (bbPos + 1) % players.length,
      currentBet: selectedRoom.bigBlind,
      isComplete: false,
    };

    setCurrentRound(newRound);
    setPlayers(resetPlayers);
    setInGamePlay(true);
  };

  const handlePlayerAction = (playerId: string, action: PlayerAction, amount: number) => {
    if (!currentRound) return;

    const playerIndex = players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

    const newPlayers = [...players];
    const player = newPlayers[playerIndex];

    // Execute action
    switch (action) {
      case 'fold':
        player.folded = true;
        break;
      case 'check':
        // No chips change
        break;
      case 'call':
        player.currentChips -= amount;
        player.currentBet += amount;
        break;
      case 'raise':
        player.currentChips -= amount;
        player.currentBet += amount;
        currentRound.currentBet = player.currentBet;
        break;
      case 'allin':
        player.currentBet += amount;
        player.currentChips = 0;
        if (player.currentBet > currentRound.currentBet) {
          currentRound.currentBet = player.currentBet;
        }
        break;
    }

    // Update pot
    currentRound.pot += amount;

    // Record action
    const newAction: Action = {
      playerId,
      action,
      amount,
      timestamp: new Date(),
    };
    currentRound.actions.push(newAction);

    // Move to next player
    let nextPlayerIndex = (currentRound.currentPlayerIndex + 1) % players.length;
    let iterations = 0;
    while (newPlayers[nextPlayerIndex].folded && iterations < players.length) {
      nextPlayerIndex = (nextPlayerIndex + 1) % players.length;
      iterations++;
    }
    currentRound.currentPlayerIndex = nextPlayerIndex;

    setPlayers(newPlayers);
    setCurrentRound({ ...currentRound });
  };

  const handleEndRound = (winners: { playerId: string; amount: number }[]) => {
    if (!currentRound) return;

    // Distribute winnings
    const newPlayers = players.map(p => {
      const win = winners.find(w => w.playerId === p.id);
      if (win) {
        return {
          ...p,
          currentChips: p.currentChips + win.amount,
          profit: p.profit + win.amount - p.currentBet,
          currentBet: 0,
        };
      }
      return {
        ...p,
        profit: p.profit - p.currentBet,
        currentBet: 0,
      };
    });

    currentRound.winners = winners;
    currentRound.isComplete = true;

    setPlayers(newPlayers);
    setRounds([...rounds, currentRound]);
    setCurrentRound(null);
    setInGamePlay(false);

    Alert.alert('Round Complete', 'Round has been saved on blockchain', [
      { text: 'OK', onPress: () => {} }
    ]);
  };

  const handleRebuy = (playerId: string, hands: number) => {
    setPlayers(players.map(p => {
      if (p.id === playerId && selectedRoom) {
        const rebuyAmount = selectedRoom.buyInUnit * hands;
        return {
          ...p,
          buyIn: p.buyIn + rebuyAmount,
          currentChips: p.currentChips + rebuyAmount,
        };
      }
      return p;
    }));
  };

  return (
    <>
      {currentView === 'rooms' && (
        <RoomsList
          rooms={rooms}
          onCreateRoom={() => setCurrentView('create')}
          onSelectRoom={handleSelectRoom}
        />
      )}
      {currentView === 'create' && (
        <CreateRoom
          onBack={() => setCurrentView('rooms')}
          onCreateRoom={handleCreateRoom}
        />
      )}
      {currentView === 'buyin' && selectedRoom && (
        <BuyIn
          room={selectedRoom}
          players={players}
          onBack={() => setCurrentView('rooms')}
          onAddPlayer={handleAddPlayer}
          onStartGame={handleStartGame}
        />
      )}
      {currentView === 'game' && selectedRoom && !inGamePlay && (
        <GameScreen
          room={selectedRoom}
          players={players}
          rounds={rounds}
          onBack={() => setCurrentView('rooms')}
          onStartNewRound={handleStartNewRound}
          onShowSettlement={() => setCurrentView('settlement')}
          onRebuy={handleRebuy}
        />
      )}
      {currentView === 'game' && selectedRoom && inGamePlay && currentRound && (
        blockchainEnabled ? (
          <BlockchainGamePlay
            room={selectedRoom}
            players={players}
            currentRound={currentRound}
            blockchainRoomId={blockchainRoomId}
            playerAddress={playerAddresses.get(players[0]?.id)}
            playerAddresses={playerAddresses}
            playerPrivateKeys={playerPrivateKeys}
            onBack={() => setInGamePlay(false)}
            onPlayerAction={handlePlayerAction}
            onEndRound={handleEndRound}
          />
        ) : (
          <GamePlay
            room={selectedRoom}
            players={players}
            currentRound={currentRound}
            onBack={() => setInGamePlay(false)}
            onPlayerAction={handlePlayerAction}
            onEndRound={handleEndRound}
          />
        )
      )}
      {currentView === 'settlement' && (
        <SettlementScreen
          players={players}
          onBack={() => setCurrentView('game')}
          onFinish={() => setCurrentView('rooms')}
        />
      )}
    </>
  );
}
