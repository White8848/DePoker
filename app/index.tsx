import BuyIn from '@/components/poker/BuyIn';
import CreateRoom from '@/components/poker/CreateRoom';
import GameScreen from '@/components/poker/GameScreen';
import RoomsList from '@/components/poker/RoomsList';
import SettlementScreen from '@/components/poker/SettlementScreen';
import { GameRoom, Player, Round, ViewType } from '@/types/game';
import React, { useState } from 'react';
import { Alert } from 'react-native';

export default function PokerScreen() {
  const [currentView, setCurrentView] = useState<ViewType>('rooms');
  const [rooms, setRooms] = useState<GameRoom[]>([
    { id: '1', name: '周五夜局', status: 'playing', playerCount: 6, createdAt: new Date() },
    { id: '2', name: '练习局', status: 'waiting', playerCount: 2, createdAt: new Date() },
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

  const handleCreateRoom = (name: string, initialChips: string) => {
    const newRoom: GameRoom = {
      id: Date.now().toString(),
      name,
      status: 'waiting',
      playerCount: 0,
      createdAt: new Date(),
    };
    setRooms([newRoom, ...rooms]);
    Alert.alert('成功', '房间已创建并上链', [
      { text: '确定', onPress: () => setCurrentView('rooms') }
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
    Alert.alert('成功', '买入记录已上链验证');
  };

  const handleStartGame = () => {
    if (selectedRoom) {
      selectedRoom.status = 'playing';
    }
    setCurrentView('game');
  };

  const handleRecordRound = () => {
    Alert.alert('记录盈亏', '此功能将打开记录界面，支持多人验证');
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
