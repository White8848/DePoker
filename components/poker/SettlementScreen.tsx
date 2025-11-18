import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppColors } from '@/constants/colors';
import { Player, Settlement } from '@/types/game';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  players: Player[];
  onBack: () => void;
  onFinish: () => void;
};

export default function SettlementScreen({ players, onBack, onFinish }: Props) {
  const settlements: Settlement[] = players.map(player => ({
    ...player,
    finalAmount: player.currentChips,
    needsPay: player.currentChips < player.buyIn,
    amount: Math.abs(player.currentChips - player.buyIn),
  }));

  const winners = settlements.filter(s => !s.needsPay && s.amount > 0);
  const losers = settlements.filter(s => s.needsPay);

  const handleFinish = () => {
    Alert.alert('确认', '确定要结束游戏并返回首页吗？', [
      { text: '取消', style: 'cancel' },
      { text: '确定', onPress: onFinish }
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: AppColors.background }} edges={['top', 'bottom']}>
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText type="title">游戏结算</ThemedText>
      </View>

      <View style={styles.settlementSummary}>
        <Ionicons name="trophy" size={48} color={AppColors.gold} />
        <Text style={styles.settlementTitle}>游戏结束</Text>
        <Text style={styles.settlementSubtitle}>区块链验证完成</Text>
      </View>

      <Text style={styles.sectionTitle}>最终结算</Text>
      <ScrollView style={styles.settlementList}>
        {settlements.map((player) => (
          <View key={player.id} style={styles.settlementCard}>
            <View style={styles.settlementHeader}>
              <Text style={styles.settlementName}>{player.name}</Text>
              <View style={[styles.settlementBadge, player.needsPay ? styles.badgeLose : styles.badgeWin]}>
                <Text style={styles.badgeText}>
                  {player.needsPay ? '需支付' : player.amount > 0 ? '赢家' : '平局'}
                </Text>
              </View>
            </View>
            <View style={styles.settlementDetails}>
              <View style={styles.settlementRow}>
                <Text style={styles.settlementLabel}>买入:</Text>
                <Text style={styles.settlementAmount}>¥{player.buyIn}</Text>
              </View>
              <View style={styles.settlementRow}>
                <Text style={styles.settlementLabel}>最终:</Text>
                <Text style={styles.settlementAmount}>¥{player.finalAmount}</Text>
              </View>
              <View style={styles.settlementRow}>
                <Text style={styles.settlementLabel}>盈亏:</Text>
                <Text style={[styles.settlementProfit, player.needsPay ? styles.profitNegative : styles.profitPositive]}>
                  {player.needsPay ? '-' : '+'}{player.amount}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {losers.length > 0 && winners.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>转账指引</Text>
          <View style={styles.transferGuide}>
            {losers.map((loser) => (
              <View key={loser.id} style={styles.transferCard}>
                <Ionicons name="arrow-forward-circle" size={24} color={AppColors.transferIcon} />
                <View style={styles.transferInfo}>
                  <Text style={styles.transferText}>
                    <Text style={styles.transferBold}>{loser.name}</Text> 需支付
                  </Text>
                  {winners.map((winner) => {
                    const totalWinnings = winners.reduce((sum, w) => sum + w.amount, 0);
                    const shareAmount = (loser.amount * (winner.amount / totalWinnings)).toFixed(2);
                    return (
                      <Text key={winner.id} style={styles.transferDetail}>
                        → 给 <Text style={styles.transferBold}>{winner.name}</Text>: ¥{shareAmount}
                      </Text>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
        <Text style={styles.finishButtonText}>完成结算</Text>
      </TouchableOpacity>
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
  settlementSummary: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: AppColors.cardBackground,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: AppColors.borderGray,
  },
  settlementTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.dark,
    marginTop: 16,
  },
  settlementSubtitle: {
    fontSize: 14,
    color: AppColors.success,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
    color: AppColors.white,
  },
  settlementList: {
    flex: 1,
    marginBottom: 16,
  },
  settlementCard: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: AppColors.borderGray,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  settlementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settlementName: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.white,
  },
  settlementBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeWin: {
    backgroundColor: AppColors.success,
  },
  badgeLose: {
    backgroundColor: AppColors.danger,
  },
  badgeText: {
    color: AppColors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  settlementDetails: {
    gap: 8,
  },
  settlementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  settlementLabel: {
    fontSize: 14,
    color: AppColors.gray,
  },
  settlementAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.white,
  },
  settlementProfit: {
    fontSize: 16,
    fontWeight: '700',
  },
  profitPositive: {
    color: AppColors.profit,
  },
  profitNegative: {
    color: AppColors.loss,
  },
  transferGuide: {
    backgroundColor: AppColors.transferBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  transferCard: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  transferInfo: {
    flex: 1,
  },
  transferText: {
    fontSize: 14,
    color: AppColors.white,
    marginBottom: 4,
  },
  transferBold: {
    fontWeight: '600',
  },
  transferDetail: {
    fontSize: 13,
    color: AppColors.gray,
    marginLeft: 8,
  },
  finishButton: {
    backgroundColor: AppColors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  finishButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
