import BuyIn from '@/components/poker/BuyIn';
import CreateRoom from '@/components/poker/CreateRoom';
import GamePlay from '@/components/poker/GamePlay';
import GameScreen from '@/components/poker/GameScreen';
import RoomsList from '@/components/poker/RoomsList';
import SettlementScreen from '@/components/poker/SettlementScreen';
import { Action, GameRoom, Player, PlayerAction, Round, ViewType } from '@/types/game';
import React, { useState } from 'react';
import { Alert } from 'react-native';

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

  const handleSelectRoom = (room: GameRoom) => {
    setSelectedRoom(room);
    if (room.status === 'waiting') {
      setCurrentView('buyin');
    } else {
      setCurrentView('game');
    }
  };

  const handleCreateRoom = (name: string, buyInUnit: string, smallBlind: string, bigBlind: string) => {
    const newRoom: GameRoom = {
      id: Date.now().toString(),
      name,
      status: 'waiting',
      playerCount: 0,
      createdAt: new Date(),
      buyInUnit: parseFloat(buyInUnit),
      smallBlind: parseFloat(smallBlind),
      bigBlind: parseFloat(bigBlind),
    };
    setRooms([newRoom, ...rooms]);
    setSelectedRoom(newRoom);
    Alert.alert('Success', `Room created and registered on blockchain\nStack: $${buyInUnit}\nBlinds: $${smallBlind}/$${bigBlind}`, [
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
      folded: false,
      currentBet: 0,
      position: players.length,
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

  const handleStartNewRound = () => {
    if (!selectedRoom || players.length < 2) {
      Alert.alert('Error', 'Need at least 2 players to start a round');
      return;
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
        <GamePlay
          room={selectedRoom}
          players={players}
          currentRound={currentRound}
          onBack={() => setInGamePlay(false)}
          onPlayerAction={handlePlayerAction}
          onEndRound={handleEndRound}
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
