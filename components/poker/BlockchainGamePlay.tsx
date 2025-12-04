// components/poker/BlockchainGamePlay.tsx
// 集成区块链功能的德州扑克游戏组件
import { useDePoker2 } from '@/blockchain';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppColors } from '@/constants/colors';
import { GameRoom, Player, PlayerAction, Round } from '@/types/game';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  room: GameRoom;
  players: Player[];
  currentRound: Round;
  blockchainRoomId?: number; // 区块链房间ID (可选)
  playerAddress?: string; // 当前玩家地址 (可选)
  playerAddresses?: Map<string, string>; // 所有玩家地址映射 (playerId -> address)
  playerPrivateKeys?: Map<string, string>; // 所有玩家私钥映射 (playerId -> privateKey)
  onBack: () => void;
  onPlayerAction: (playerId: string, action: PlayerAction, amount: number) => void;
  onEndRound: (winners: { playerId: string; amount: number }[]) => void;
};

export default function BlockchainGamePlay({ 
  room, 
  players, 
  currentRound, 
  blockchainRoomId,
  playerAddress,
  playerAddresses,
  playerPrivateKeys,
  onBack, 
  onPlayerAction, 
  onEndRound 
}: Props) {
  const [raiseAmount, setRaiseAmount] = useState('');
  const [blockchainEnabled, setBlockchainEnabled] = useState(false);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  
  const { 
    loading, 
    error, 
    voteWinner, 
    finalizeRoom, 
    getRoomInfo,
    getPlayerReputation 
  } = useDePoker2();
  
  const activePlayers = players.filter(p => !p.folded);
  const currentPlayer = players[currentRound.currentPlayerIndex];

  // 监测 Modal 状态变化
  useEffect(() => {
    console.log('showWinnerModal changed:', showWinnerModal);
  }, [showWinnerModal]);

  // 检查是否启用区块链
  useEffect(() => {
    if (blockchainRoomId !== undefined) {
      setBlockchainEnabled(true);
      loadRoomInfo();
    }
  }, [blockchainRoomId]);

  // 加载区块链房间信息
  const loadRoomInfo = async () => {
    if (blockchainRoomId !== undefined) {
      const info = await getRoomInfo(blockchainRoomId);
      setRoomInfo(info);
    }
  };

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

  // 区块链投票
  const handleBlockchainVote = async (playerAddress: string) => {
    if (!blockchainRoomId || !playerAddress) return;

    const success = await voteWinner(blockchainRoomId, playerAddress);
    if (success) {
      Alert.alert('Success', 'Vote submitted to blockchain!');
      loadRoomInfo();
    } else if (error) {
      Alert.alert('Error', error);
    }
  };

  // 区块链结算
  const handleBlockchainFinalize = async (winnerAddress: string, localWinners: { playerId: string; amount: number }[]) => {
    if (!blockchainRoomId || !winnerAddress || !playerAddresses || !playerPrivateKeys) {
      // 没有区块链，直接使用本地结算
      onEndRound(localWinners);
      return;
    }

    console.log('🔗 Finalizing blockchain room:', blockchainRoomId, 'Winner:', winnerAddress);
    console.log('📊 All players:', players.map(p => p.name));
    
    // 在 Web 平台直接调用区块链结算
    if (Platform.OS === 'web') {
      try {
        // 步骤1: 让所有玩家投票给赢家
        console.log('📝 Step 1: All players voting for winner...');
        for (const player of players) {
          const playerAddr = playerAddresses.get(player.id);
          const playerPrivateKey = playerPrivateKeys.get(player.id);
          
          if (playerAddr && playerPrivateKey) {
            console.log(`  🗳️ ${player.name} (${playerAddr.slice(0, 6)}...) voting for winner...`);
            const voteSuccess = await voteWinner(blockchainRoomId, winnerAddress, playerPrivateKey);
            if (!voteSuccess) {
              console.warn(`  ⚠️ ${player.name} vote failed (may have already voted)`);
            } else {
              console.log(`  ✅ ${player.name} voted successfully`);
            }
          }
        }
        
        // 步骤2: Creator 调用 finalize
        console.log('🏁 Step 2: Finalizing room...');
        const creatorPrivateKey = playerPrivateKeys.get(players[0]?.id); // 假设第一个玩家是 creator
        const finalizeSuccess = await finalizeRoom(blockchainRoomId, winnerAddress, creatorPrivateKey);
        
        if (finalizeSuccess) {
          console.log('✅ Round finalized on blockchain!');
          onEndRound(localWinners);
          loadRoomInfo();
        } else if (error) {
          console.error('❌ Blockchain finalization failed:', error);
        }
      } catch (err) {
        console.error('❌ Error during blockchain finalization:', err);
      }
    } else {
      // 移动平台使用 Alert 确认
      Alert.alert(
        'Blockchain Settlement',
        'Do you want to finalize this round on the blockchain?',
        [
          {
            text: 'Local Only',
            onPress: () => onEndRound(localWinners),
          },
          {
            text: 'Blockchain',
            onPress: async () => {
              try {
                // 所有玩家投票
                for (const player of players) {
                  const playerPrivateKey = playerPrivateKeys.get(player.id);
                  if (playerPrivateKey) {
                    await voteWinner(blockchainRoomId, winnerAddress, playerPrivateKey);
                  }
                }
                
                // Creator finalize
                const creatorPrivateKey = playerPrivateKeys.get(players[0]?.id);
                const success = await finalizeRoom(blockchainRoomId, winnerAddress, creatorPrivateKey);
                
                if (success) {
                  Alert.alert('Success', 'Round finalized on blockchain!');
                  onEndRound(localWinners);
                  loadRoomInfo();
                } else if (error) {
                  Alert.alert('Error', error);
                }
              } catch (err) {
                Alert.alert('Error', String(err));
              }
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const handleEndRound = () => {
    console.log('End Round clicked - Active players:', activePlayers.length);
    
    if (activePlayers.length === 0) {
      if (Platform.OS === 'web') {
        console.error('No active players to award pot');
      } else {
        Alert.alert('Error', 'No active players to award pot');
      }
      return;
    }
    
    // 在 Web 平台使用 Modal，在移动平台使用 Alert
    if (Platform.OS === 'web') {
      console.log('Opening winner selection modal');
      setShowWinnerModal(true);
    } else {
      if (!blockchainEnabled) {
        // 传统方式
        Alert.alert('End Round', 'Who won this round?', [
          { text: 'Cancel', style: 'cancel' },
          ...activePlayers.map(player => ({
            text: player.name,
            onPress: () => {
              console.log('Winner selected:', player.name);
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
      } else {
        // 区块链方式
        Alert.alert('End Round (Blockchain)', 'Who won this round?', [
          { text: 'Cancel', style: 'cancel' },
          ...activePlayers.map(player => ({
            text: player.name,
            onPress: () => {
              const winners = [{ playerId: player.id, amount: currentRound.pot }];
              // 假设 player.id 与区块链地址关联，实际应用中需要映射
              handleBlockchainFinalize(playerAddress || player.id, winners);
            }
          })),
          {
            text: 'Split Pot',
            onPress: () => {
              const splitAmount = currentRound.pot / activePlayers.length;
              const winners = activePlayers.map(p => ({ playerId: p.id, amount: splitAmount }));
              onEndRound(winners);
            }
          }
        ]);
      }
    }
  };

  const handleSelectWinner = (playerId: string) => {
    console.log('Winner selected:', playerId);
    setShowWinnerModal(false);
    
    const winners = [{ playerId, amount: currentRound.pot }];
    
    if (blockchainEnabled && playerAddresses) {
      // 获取赢家的区块链地址
      const winnerAddress = playerAddresses.get(playerId);
      console.log('Winner address from map:', winnerAddress);
      
      if (winnerAddress) {
        handleBlockchainFinalize(winnerAddress, winners);
      } else {
        console.error('❌ Winner address not found for player:', playerId);
        // 降级到本地结算
        onEndRound(winners);
      }
    } else {
      onEndRound(winners);
    }
  };

  const handleSplitPot = () => {
    console.log('Split pot selected');
    setShowWinnerModal(false);
    const splitAmount = currentRound.pot / activePlayers.length;
    onEndRound(activePlayers.map(p => ({ playerId: p.id, amount: splitAmount })));
  };

  const canCheck = currentPlayer && currentPlayer.currentBet === currentRound.currentBet;
  const needToCall = currentPlayer && currentPlayer.currentBet < currentRound.currentBet;
  const isCurrentPlayerFolded = currentPlayer && currentPlayer.folded;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: AppColors.background }} edges={['top', 'bottom']}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText type="title">Round {currentRound.roundNumber}</ThemedText>
          {blockchainEnabled && (
            <View style={styles.blockchainBadge}>
              <Ionicons name="cube" size={16} color={AppColors.white} />
              <Text style={styles.blockchainText}>Blockchain</Text>
            </View>
          )}
        </View>

        {/* 区块链房间信息 */}
        {blockchainEnabled && roomInfo && (
          <View style={styles.blockchainInfo}>
            <Text style={styles.blockchainInfoText}>
              Room #{blockchainRoomId} | Pool: {roomInfo.totalPool} ETH | Votes: {roomInfo.totalVotes}
            </Text>
            {roomInfo.settled && (
              <Text style={styles.settledText}>✓ Settled on Blockchain</Text>
            )}
          </View>
        )}

        {/* 加载指示器 */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={AppColors.primary} />
            <Text style={styles.loadingText}>Processing blockchain transaction...</Text>
          </View>
        )}

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
          {players.map((player, index) => {
            const playerAddr = playerAddresses?.get(player.id);
            return (
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
                  <View style={styles.playerInfo}>
                    <Text style={[styles.playerName, player.folded && styles.foldedText]}>
                      {player.name}
                      {player.folded && ' (Folded)'}
                    </Text>
                    <Text style={styles.playerChips}>
                      ${player.currentChips} | Bet: ${player.currentBet}
                    </Text>
                    {blockchainEnabled && playerAddr && (
                      <Text style={styles.playerAddress}>
                        🔗 {playerAddr.slice(0, 6)}...{playerAddr.slice(-4)}
                      </Text>
                    )}
                  </View>
                </View>
                {index === currentRound.dealerPosition && (
                  <View style={styles.dealerBadge}>
                    <Text style={styles.dealerText}>D</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* Action Buttons */}
        {currentPlayer && (
          <View style={styles.actionSection}>
            {isCurrentPlayerFolded ? (
              <View style={styles.foldedMessage}>
                <Ionicons name="close-circle" size={24} color={AppColors.danger} />
                <Text style={styles.foldedMessageText}>{currentPlayer.name} has folded - Waiting for next player</Text>
              </View>
            ) : (
              <>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.foldButton]}
                onPress={() => handleAction('fold')}
                disabled={loading}
              >
                <Ionicons name="close-circle" size={20} color={AppColors.white} />
                <Text style={styles.actionButtonText}>Fold</Text>
              </TouchableOpacity>

              {canCheck ? (
                <TouchableOpacity
                  style={[styles.actionButton, styles.checkButton]}
                  onPress={() => handleAction('check')}
                  disabled={loading}
                >
                  <Ionicons name="checkmark-circle" size={20} color={AppColors.white} />
                  <Text style={styles.actionButtonText}>Check</Text>
                </TouchableOpacity>
              ) : needToCall ? (
                <TouchableOpacity
                  style={[styles.actionButton, styles.callButton]}
                  onPress={() => handleAction('call')}
                  disabled={loading}
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
                disabled={loading}
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
                editable={!loading}
              />
              <TouchableOpacity
                style={[styles.actionButton, styles.raiseButton]}
                onPress={() => handleAction('raise')}
                disabled={loading}
              >
                <Ionicons name="trending-up" size={20} color={AppColors.white} />
                <Text style={styles.actionButtonText}>Raise</Text>
              </TouchableOpacity>
            </View>
            </>
            )}
          </View>
        )}

        {/* End Round button - always visible */}
        <TouchableOpacity
          style={styles.endRoundButton}
          onPress={handleEndRound}
          disabled={loading}
        >
          <Ionicons name="flag" size={20} color={AppColors.white} />
          <Text style={styles.endRoundButtonText}>
            {blockchainEnabled ? 'End Round & Vote on Chain' : 'End Round & Award Pot'}
          </Text>
        </TouchableOpacity>
      </ThemedView>

      {/* Winner Selection Modal for Web */}
      <Modal
        visible={showWinnerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowWinnerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {blockchainEnabled ? 'Who won this round? (Blockchain)' : 'Who won this round?'}
            </Text>
            <Text style={styles.modalSubtitle}>Pot: ${currentRound.pot}</Text>
            
            <ScrollView style={styles.modalScroll}>
              {activePlayers.map(player => (
                <TouchableOpacity
                  key={player.id}
                  style={styles.modalButton}
                  onPress={() => handleSelectWinner(player.id)}
                >
                  <Text style={styles.modalButtonText}>{player.name}</Text>
                  <Text style={styles.modalButtonChips}>${player.currentChips}</Text>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={[styles.modalButton, styles.splitButton]}
                onPress={handleSplitPot}
              >
                <Text style={styles.modalButtonText}>Split Pot</Text>
                <Text style={styles.modalButtonChips}>
                  ${(currentRound.pot / activePlayers.length).toFixed(2)} each
                </Text>
              </TouchableOpacity>
            </ScrollView>
            
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowWinnerModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  blockchainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  blockchainText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.white,
  },
  blockchainInfo: {
    backgroundColor: AppColors.surfaceBackground,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: AppColors.primary,
  },
  blockchainInfoText: {
    fontSize: 13,
    color: AppColors.lightGray,
    marginBottom: 4,
  },
  settledText: {
    fontSize: 12,
    color: AppColors.success,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: AppColors.white,
    fontWeight: '600',
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
  playerInfo: {
    flex: 1,
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
  playerAddress: {
    fontSize: 10,
    color: AppColors.primary,
    marginTop: 2,
    fontFamily: 'monospace',
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
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  endRoundButtonText: {
    color: AppColors.black,
    fontSize: 15,
    fontWeight: '700',
  },
  foldedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: AppColors.surfaceBackground,
    borderRadius: 8,
    gap: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: AppColors.danger,
  },
  foldedMessageText: {
    fontSize: 14,
    color: AppColors.danger,
    fontWeight: '600',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: AppColors.surfaceBackground,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: AppColors.gold,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: AppColors.cardBackground,
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  splitButton: {
    backgroundColor: AppColors.gold + '30',
    borderWidth: 2,
    borderColor: AppColors.gold,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.white,
  },
  modalButtonChips: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  modalCancelButton: {
    backgroundColor: AppColors.danger,
    padding: 14,
    borderRadius: 8,
    marginTop: 12,
  },
  modalCancelText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
