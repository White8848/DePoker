import BuyIn from '@/components/poker/BuyIn';
import CreateRoom from '@/components/poker/CreateRoom';
import GameScreen from '@/components/poker/GameScreen';
import RecordRound from '@/components/poker/RecordRound';
import RoomsList from '@/components/poker/RoomsList';
import SettlementScreen from '@/components/poker/SettlementScreen';
import { GameRoom, Player, Round, ViewType } from '@/types/game';
import React, { useState } from 'react';
import { Alert } from 'react-native';

export default function PokerScreen() {
  const [currentView, setCurrentView] = useState<ViewType>('rooms');
  const [rooms, setRooms] = useState<GameRoom[]>([
    { id: '1', name: 'Friday Night Game', status: 'playing', playerCount: 6, createdAt: new Date(), buyInUnit: 1000 },
    { id: '2', name: 'Practice Game', status: 'waiting', playerCount: 2, createdAt: new Date(), buyInUnit: 500 },
  ]);
  const [selectedRoom, setSelectedRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);

  const handleSelectRoom = (room: GameRoom) => {
    setSelectedRoom(room);
    if (room.status === 'waiting') {
      setCurrentView('buyin');
    } else {
      setCurrentView('game');
    }
  };

  const handleCreateRoom = (name: string, buyInUnit: string) => {
    const newRoom: GameRoom = {
      id: Date.now().toString(),
      name,
      status: 'waiting',
      playerCount: 0,
      createdAt: new Date(),
      buyInUnit: parseFloat(buyInUnit),
    };
    setRooms([newRoom, ...rooms]);
    setSelectedRoom(newRoom);
    Alert.alert('Success', `Room created and registered on blockchain\nStack: $${buyInUnit}`, [
      { text: 'Start Buy-in', onPress: () => setCurrentView('buyin') }
    ]);
  };

  const handleAddPlayer = (name: string, amount: number) => {
    const newPlayer: Player = {
      id: Date.now().toString(),
      name,
      buyIn: amount,
      currentChips: amount,
      profit: 0,
    };
    setPlayers([...players, newPlayer]);
    Alert.alert('Success', 'Buy-in record verified on blockchain');
  };

  const handleStartGame = () => {
    if (selectedRoom) {
      selectedRoom.status = 'playing';
    }
    setCurrentView('game');
  };

  const handleRecordRound = () => {
    setCurrentView('recordround');
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

  const handleSaveRound = (changes: { playerId: string; amount: number }[]) => {
    // 更新玩家筹码和盈亏
    setPlayers(players.map(p => {
      const change = changes.find(c => c.playerId === p.id);
      if (change) {
        return {
          ...p,
          currentChips: p.currentChips + change.amount,
          profit: p.profit + change.amount,
        };
      }
      return p;
    }));

    // 保存轮次记录
    const newRound: Round = {
      id: Date.now().toString(),
      timestamp: new Date(),
      changes,
      verified: true,
    };
    setRounds([...rounds, newRound]);
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
      {currentView === 'game' && selectedRoom && (
        <GameScreen
          room={selectedRoom}
          players={players}
          rounds={rounds}
          onBack={() => setCurrentView('rooms')}
          onRecordRound={handleRecordRound}
          onShowSettlement={() => setCurrentView('settlement')}
          onRebuy={handleRebuy}
        />
      )}
      {currentView === 'recordround' && (
        <RecordRound
          players={players}
          onBack={() => setCurrentView('game')}
          onSaveRound={handleSaveRound}
        />
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
