import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppColors } from '@/constants/colors';
import { GameRoom, Player, PlayerAction, Round } from '@/types/game';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  room: GameRoom;
  players: Player[];
  currentRound: Round;
  onBack: () => void;
  onPlayerAction: (playerId: string, action: PlayerAction, amount: number) => void;
  onEndRound: (winners: { playerId: string; amount: number }[]) => void;
};

export default function GamePlay({ room, players, currentRound, onBack, onPlayerAction, onEndRound }: Props) {
  const [raiseAmount, setRaiseAmount] = useState('');
  
  const activePlayers = players.filter(p => !p.folded);
  const currentPlayer = players[currentRound.currentPlayerIndex];
  
  const handleAction = (action: PlayerAction) => {
    if (!currentPlayer) return;

    let amount = 0;
    
    switch (action) {
      case 'fold':
        amount = 0;
        break;
      case 'check':
        amount = 0;
        break;
      case 'call':
        amount = currentRound.currentBet - currentPlayer.currentBet;
        if (amount > currentPlayer.currentChips) {
          Alert.alert('Error', 'Not enough chips to call');
          return;
        }
        break;
      case 'raise':
        const raise = parseFloat(raiseAmount);
        if (isNaN(raise) || raise <= 0) {
          Alert.alert('Error', 'Please enter a valid raise amount');
          return;
        }
        amount = currentRound.currentBet - currentPlayer.currentBet + raise;
        if (amount > currentPlayer.currentChips) {
          Alert.alert('Error', 'Not enough chips to raise');
          return;
        }
        break;
      case 'allin':
        amount = currentPlayer.currentChips;
        break;
    }

    onPlayerAction(currentPlayer.id, action, amount);
    setRaiseAmount('');
  };

  const handleEndRound = () => {
    Alert.alert('End Round', 'Who won this round?', [
      { text: 'Cancel', style: 'cancel' },
      ...activePlayers.map(player => ({
        text: player.name,
        onPress: () => {
          onEndRound([{ playerId: player.id, amount: currentRound.pot }]);
        }
      })),
      {
        text: 'Split Pot',
        onPress: () => {
          const splitAmount = currentRound.pot / activePlayers.length;
          onEndRound(activePlayers.map(p => ({ playerId: p.id, amount: splitAmount })));
        }
      }
    ]);
  };

  const canCheck = currentPlayer && currentPlayer.currentBet === currentRound.currentBet;
  const needToCall = currentPlayer && currentPlayer.currentBet < currentRound.currentBet;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: AppColors.background }} edges={['top', 'bottom']}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText type="title">Round {currentRound.roundNumber}</ThemedText>
        </View>

        {/* Pot Info */}
        <View style={styles.potCard}>
          <Ionicons name="trophy" size={32} color={AppColors.gold} />
          <View style={styles.potInfo}>
            <Text style={styles.potLabel}>Current Pot</Text>
            <Text style={styles.potValue}>${currentRound.pot}</Text>
          </View>
          <View style={styles.betInfo}>
            <Text style={styles.betLabel}>Current Bet</Text>
            <Text style={styles.betValue}>${currentRound.currentBet}</Text>
          </View>
        </View>

        {/* Blinds Info */}
        <View style={styles.blindsInfo}>
          <View style={styles.blindItem}>
            <Ionicons name="remove-circle" size={16} color={AppColors.warning} />
            <Text style={styles.blindText}>SB: ${room.smallBlind}</Text>
          </View>
          <View style={styles.blindItem}>
            <Ionicons name="add-circle" size={16} color={AppColors.danger} />
            <Text style={styles.blindText}>BB: ${room.bigBlind}</Text>
          </View>
          <View style={styles.blindItem}>
            <Ionicons name="people" size={16} color={AppColors.primary} />
            <Text style={styles.blindText}>{activePlayers.length} Active</Text>
          </View>
        </View>

        {/* Current Player */}
        {currentPlayer && (
          <View style={styles.currentPlayerCard}>
            <Ionicons name="hand-right" size={24} color={AppColors.primary} />
            <View style={styles.currentPlayerInfo}>
              <Text style={styles.currentPlayerName}>{currentPlayer.name}'s Turn</Text>
              <Text style={styles.currentPlayerChips}>Chips: ${currentPlayer.currentChips} | Bet: ${currentPlayer.currentBet}</Text>
            </View>
          </View>
        )}

        {/* Players List */}
        <ScrollView style={styles.playersList}>
          {players.map((player, index) => (
            <View 
              key={player.id} 
              style={[
                styles.playerCard,
                player.id === currentPlayer?.id && styles.activePlayerCard,
                player.folded && styles.foldedPlayerCard
              ]}
            >
              <View style={styles.playerLeft}>
                <View style={[styles.playerRank, player.folded && styles.foldedRank]}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View>
                  <Text style={[styles.playerName, player.folded && styles.foldedText]}>
                    {player.name}
                    {player.folded && ' (Folded)'}
                  </Text>
                  <Text style={styles.playerChips}>
                    ${player.currentChips} | Bet: ${player.currentBet}
                  </Text>
                </View>
              </View>
              {index === currentRound.dealerPosition && (
                <View style={styles.dealerBadge}>
                  <Text style={styles.dealerText}>D</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Action Buttons */}
        {currentPlayer && (
          <View style={styles.actionSection}>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.foldButton]}
                onPress={() => handleAction('fold')}
              >
                <Ionicons name="close-circle" size={20} color={AppColors.white} />
                <Text style={styles.actionButtonText}>Fold</Text>
              </TouchableOpacity>

              {canCheck ? (
                <TouchableOpacity
                  style={[styles.actionButton, styles.checkButton]}
                  onPress={() => handleAction('check')}
                >
                  <Ionicons name="checkmark-circle" size={20} color={AppColors.white} />
                  <Text style={styles.actionButtonText}>Check</Text>
                </TouchableOpacity>
              ) : needToCall ? (
                <TouchableOpacity
                  style={[styles.actionButton, styles.callButton]}
                  onPress={() => handleAction('call')}
                >
                  <Ionicons name="arrow-up-circle" size={20} color={AppColors.white} />
                  <Text style={styles.actionButtonText}>
                    Call ${currentRound.currentBet - currentPlayer.currentBet}
                  </Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={[styles.actionButton, styles.allinButton]}
                onPress={() => handleAction('allin')}
              >
                <Ionicons name="flash" size={20} color={AppColors.white} />
                <Text style={styles.actionButtonText}>All-In</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.raiseSection}>
              <TextInput
                style={styles.raiseInput}
                placeholder="Raise amount"
                placeholderTextColor={AppColors.gray}
                value={raiseAmount}
                onChangeText={setRaiseAmount}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={[styles.actionButton, styles.raiseButton]}
                onPress={() => handleAction('raise')}
              >
                <Ionicons name="trending-up" size={20} color={AppColors.white} />
                <Text style={styles.actionButtonText}>Raise</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.endRoundButton}
              onPress={handleEndRound}
            >
              <Ionicons name="flag" size={20} color={AppColors.white} />
              <Text style={styles.endRoundButtonText}>End Round & Award Pot</Text>
            </TouchableOpacity>
          </View>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  potCard: {
    backgroundColor: AppColors.cardBackground,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: AppColors.gold,
  },
  potInfo: {
    flex: 1,
  },
  potLabel: {
    fontSize: 14,
    color: AppColors.gray,
    marginBottom: 4,
  },
  potValue: {
    fontSize: 28,
    fontWeight: '700',
    color: AppColors.gold,
  },
  betInfo: {
    alignItems: 'flex-end',
  },
  betLabel: {
    fontSize: 12,
    color: AppColors.gray,
    marginBottom: 4,
  },
  betValue: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.primary,
  },
  blindsInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: AppColors.surfaceBackground,
    borderRadius: 8,
  },
  blindItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  blindText: {
    fontSize: 13,
    color: AppColors.white,
    fontWeight: '600',
  },
  currentPlayerCard: {
    backgroundColor: AppColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 12,
  },
  currentPlayerInfo: {
    flex: 1,
  },
  currentPlayerName: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.white,
    marginBottom: 4,
  },
  currentPlayerChips: {
    fontSize: 13,
    color: AppColors.white,
    opacity: 0.9,
  },
  playersList: {
    flex: 1,
    marginBottom: 12,
  },
  playerCard: {
    backgroundColor: AppColors.cardBackground,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: AppColors.borderGray,
  },
  activePlayerCard: {
    borderColor: AppColors.primary,
    borderWidth: 2,
  },
  foldedPlayerCard: {
    opacity: 0.5,
  },
  playerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playerRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foldedRank: {
    backgroundColor: AppColors.gray,
  },
  rankText: {
    color: AppColors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  playerName: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.white,
    marginBottom: 2,
  },
  foldedText: {
    textDecorationLine: 'line-through',
  },
  playerChips: {
    fontSize: 12,
    color: AppColors.lightGray,
  },
  dealerBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealerText: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.black,
  },
  actionSection: {
    gap: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  foldButton: {
    backgroundColor: AppColors.danger,
  },
  checkButton: {
    backgroundColor: AppColors.success,
  },
  callButton: {
    backgroundColor: AppColors.warning,
  },
  allinButton: {
    backgroundColor: AppColors.loss,
  },
  actionButtonText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  raiseSection: {
    flexDirection: 'row',
    gap: 8,
  },
  raiseInput: {
    flex: 1,
    backgroundColor: AppColors.surfaceBackground,
    borderWidth: 1,
    borderColor: AppColors.borderGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: AppColors.white,
  },
  raiseButton: {
    flex: 1,
    backgroundColor: AppColors.profit,
  },
  endRoundButton: {
    backgroundColor: AppColors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  endRoundButtonText: {
    color: AppColors.black,
    fontSize: 15,
    fontWeight: '700',
  },
});
