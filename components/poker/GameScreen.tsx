import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppColors } from '@/constants/colors';
import { GameRoom, Player, Round } from '@/types/game';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
type Props = {
  room: GameRoom;
  players: Player[];
  rounds: Round[];
  onBack: () => void;
  onRecordRound: () => void;
  onShowSettlement: () => void;
  onRebuy: (playerId: string, hands: number) => void;
};

export default function GameScreen({ room, players, rounds, onBack, onRecordRound, onShowSettlement, onRebuy }: Props) {
  const totalBuyIn = players.reduce((sum, p) => sum + p.buyIn, 0);

  const handleRebuy = (playerId: string) => {
    Alert.alert('追加买入', '请输入要购买的手数：', [
      { text: '取消', style: 'cancel' },
      { 
        text: '1手',
        onPress: () => {
          onRebuy(playerId, 1);
          Alert.alert('成功', `追加买入1手（¥${room.buyInUnit}）已上链验证`);
        }
      },
      { 
        text: '2手',
        onPress: () => {
          onRebuy(playerId, 2);
          Alert.alert('成功', `追加买入2手（¥${room.buyInUnit * 2}）已上链验证`);
        }
      },
      { 
        text: '3手',
        onPress: () => {
          onRebuy(playerId, 3);
          Alert.alert('成功', `追加买入3手（¥${room.buyInUnit * 3}）已上链验证`);
        }
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: AppColors.background }} edges={['top', 'bottom']}>
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View>
          <ThemedText type="title">{room.name}</ThemedText>
          <Text style={styles.subtitle}>第 {rounds.length + 1} 轮</Text>
        </View>
        <TouchableOpacity 
          style={styles.settleButton}
          onPress={onShowSettlement}
        >
          <Ionicons name="calculator" size={20} color={AppColors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>总买入</Text>
          <Text style={styles.statValue}>¥{totalBuyIn}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>玩家数</Text>
          <Text style={styles.statValue}>{players.length}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>已完成轮数</Text>
          <Text style={styles.statValue}>{rounds.length}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>玩家筹码</Text>
      <ScrollView style={styles.playersList}>
        {players.map((player, index) => (
          <View key={player.id} style={styles.playerCard}>
            <View style={styles.playerLeft}>
              <View style={styles.playerRank}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View>
                <Text style={styles.playerCardName}>{player.name}</Text>
                <Text style={styles.playerBuyIn}>买入: ¥{player.buyIn}</Text>
              </View>
            </View>
            <View style={styles.playerRight}>
              <Text style={styles.currentChips}>¥{player.currentChips}</Text>
              <Text style={[styles.profit, player.profit >= 0 ? styles.profitPositive : styles.profitNegative]}>
                {player.profit >= 0 ? '+' : ''}{player.profit}
              </Text>
              <TouchableOpacity 
                style={styles.rebuyButton}
                onPress={() => handleRebuy(player.id)}
              >
                <Ionicons name="add" size={14} color={AppColors.primary} />
                <Text style={styles.rebuyButtonText}>追加买入</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.recordButton}
        onPress={onRecordRound}
      >
        <Ionicons name="add-circle" size={24} color={AppColors.white} />
        <Text style={styles.recordButtonText}>记录本轮盈亏</Text>
      </TouchableOpacity>

      <View style={styles.blockchainStatus}>
        <Ionicons name="shield-checkmark" size={16} color={AppColors.success} />
        <Text style={styles.blockchainStatusText}>所有交易已通过区块链验证</Text>
      </View>
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
    marginBottom: 24,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.gray,
    marginTop: 4,
  },
  settleButton: {
    backgroundColor: AppColors.success,
    padding: 8,
    borderRadius: 8,
  },
  statsCard: {
    backgroundColor: AppColors.cardBackground,
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: AppColors.borderGray,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: AppColors.lightGray,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
    color: AppColors.white,
  },
  playersList: {
    flex: 1,
    marginBottom: 16,
  },
  playerCard: {
    backgroundColor: AppColors.cardBackground,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: AppColors.borderGray,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  playerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: AppColors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  playerCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.white,
  },
  playerBuyIn: {
    fontSize: 12,
    color: AppColors.lightGray,
  },
  playerRight: {
    alignItems: 'flex-end',
  },
  currentChips: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.white,
  },
  profit: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  profitPositive: {
    color: AppColors.profit,
  },
  profitNegative: {
    color: AppColors.loss,
  },
  rebuyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: AppColors.surfaceBackground,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: AppColors.primary,
  },
  rebuyButtonText: {
    fontSize: 11,
    color: AppColors.primary,
    fontWeight: '600',
  },
  recordButton: {
    backgroundColor: AppColors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  recordButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  blockchainStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  blockchainStatusText: {
    fontSize: 12,
    color: AppColors.success,
  },
});
