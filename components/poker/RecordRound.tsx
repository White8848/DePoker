import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppColors } from '@/constants/colors';
import { Player } from '@/types/game';
import { Ionicons } from '@expo/vector-icons';
// @ts-ignore - Slider 类型定义可能不完整
import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  players: Player[];
  onBack: () => void;
  onSaveRound: (changes: { playerId: string; amount: number }[]) => void;
};

export default function RecordRound({ players, onBack, onSaveRound }: Props) {
  // 初始化每个玩家的盈亏为0
  const [changes, setChanges] = useState<{ [playerId: string]: number }>(
    players.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {})
  );

  // 计算总盈亏
  const totalChange = Object.values(changes).reduce((sum, val) => sum + val, 0);
  const isBalanced = Math.abs(totalChange) < 0.01; // 允许小数点误差

  // 更新某个玩家的盈亏
  const handleChangeAmount = (playerId: string, amount: number) => {
    setChanges({ ...changes, [playerId]: Math.round(amount) });
  };

  // 重置所有盈亏
  const handleReset = () => {
    setChanges(players.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {}));
  };

  // 保存本轮记录
  const handleSave = () => {
    if (!isBalanced) {
      Alert.alert('错误', `总盈亏必须为0！\n当前总和：${totalChange > 0 ? '+' : ''}${totalChange.toFixed(0)}`);
      return;
    }

    const roundChanges = players.map(p => ({
      playerId: p.id,
      amount: changes[p.id] || 0,
    }));

    Alert.alert('确认', '确定要保存本轮记录并上链验证吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        onPress: () => {
          onSaveRound(roundChanges);
          Alert.alert('成功', '本轮记录已上链验证', [
            { text: '确定', onPress: onBack }
          ]);
        }
      }
    ]);
  };

  // 计算滑动条的最大值（基于其他玩家的筹码总和）
  const getMaxChange = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return 1000;
    
    // 最大可赢：其他玩家的筹码总和
    const othersChips = players
      .filter(p => p.id !== playerId)
      .reduce((sum, p) => sum + p.currentChips, 0);
    
    // 最大可输：自己的筹码
    return Math.max(player.currentChips, othersChips);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: AppColors.background }} edges={['top', 'bottom']}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText type="title">记录本轮盈亏</ThemedText>
        </View>

        {/* 平衡状态指示器 */}
        <View style={[styles.balanceCard, isBalanced ? styles.balanceCardSuccess : styles.balanceCardWarning]}>
          <Ionicons 
            name={isBalanced ? "checkmark-circle" : "alert-circle"} 
            size={24} 
            color={isBalanced ? AppColors.success : AppColors.warning} 
          />
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>总盈亏平衡</Text>
            <Text style={[styles.balanceValue, isBalanced ? styles.balanceValueSuccess : styles.balanceValueWarning]}>
              {totalChange > 0 ? '+' : ''}{totalChange.toFixed(0)}
            </Text>
          </View>
          {isBalanced && (
            <Ionicons name="shield-checkmark" size={20} color={AppColors.success} />
          )}
        </View>

        <View style={styles.hintCard}>
          <Ionicons name="information-circle" size={16} color={AppColors.primary} />
          <Text style={styles.hintText}>向右滑动表示盈利，向左滑动表示亏损</Text>
        </View>

        {/* 玩家盈亏调整列表 */}
        <ScrollView style={styles.playersList}>
          {players.map((player) => {
            const change = changes[player.id] || 0;
            const maxChange = getMaxChange(player.id);

            return (
              <View key={player.id} style={styles.playerCard}>
                <View style={styles.playerHeader}>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <Text style={styles.playerChips}>当前筹码: ¥{player.currentChips}</Text>
                  </View>
                  <View style={styles.changeDisplay}>
                    <Text style={[styles.changeAmount, change >= 0 ? styles.changePositive : styles.changeNegative]}>
                      {change >= 0 ? '+' : ''}{change}
                    </Text>
                  </View>
                </View>

                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderLabel}>-{maxChange}</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={-maxChange}
                    maximumValue={maxChange}
                    value={change}
                    onValueChange={(value: number) => handleChangeAmount(player.id, value)}
                    minimumTrackTintColor={change >= 0 ? AppColors.profit : AppColors.loss}
                    maximumTrackTintColor={AppColors.borderGray}
                    thumbTintColor={change >= 0 ? AppColors.profit : AppColors.loss}
                    step={10}
                  />
                  <Text style={styles.sliderLabel}>+{maxChange}</Text>
                </View>

                {/* 快捷按钮 */}
                <View style={styles.quickButtons}>
                  <TouchableOpacity 
                    style={styles.quickButton}
                    onPress={() => handleChangeAmount(player.id, change - 100)}
                  >
                    <Text style={styles.quickButtonText}>-100</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.quickButton}
                    onPress={() => handleChangeAmount(player.id, change - 50)}
                  >
                    <Text style={styles.quickButtonText}>-50</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.quickButton, styles.quickButtonReset]}
                    onPress={() => handleChangeAmount(player.id, 0)}
                  >
                    <Text style={styles.quickButtonTextReset}>0</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.quickButton}
                    onPress={() => handleChangeAmount(player.id, change + 50)}
                  >
                    <Text style={styles.quickButtonText}>+50</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.quickButton}
                    onPress={() => handleChangeAmount(player.id, change + 100)}
                  >
                    <Text style={styles.quickButtonText}>+100</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* 底部操作按钮 */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
          >
            <Ionicons name="refresh" size={20} color={AppColors.warning} />
            <Text style={styles.resetButtonText}>重置</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, !isBalanced && styles.saveButtonDisabled]}
            disabled={!isBalanced}
            onPress={handleSave}
          >
            <Ionicons name="save" size={20} color={AppColors.white} />
            <Text style={styles.saveButtonText}>保存并上链</Text>
          </TouchableOpacity>
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
    marginBottom: 16,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
    borderWidth: 2,
  },
  balanceCardSuccess: {
    backgroundColor: AppColors.surfaceBackground,
    borderColor: AppColors.success,
  },
  balanceCardWarning: {
    backgroundColor: AppColors.surfaceBackground,
    borderColor: AppColors.warning,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: AppColors.gray,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  balanceValueSuccess: {
    color: AppColors.success,
  },
  balanceValueWarning: {
    color: AppColors.warning,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: AppColors.primaryLight,
    borderRadius: 8,
    marginBottom: 16,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: AppColors.primary,
  },
  playersList: {
    flex: 1,
    marginBottom: 16,
  },
  playerCard: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: AppColors.borderGray,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.white,
    marginBottom: 4,
  },
  playerChips: {
    fontSize: 13,
    color: AppColors.lightGray,
  },
  changeDisplay: {
    backgroundColor: AppColors.surfaceBackground,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  changeAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  changePositive: {
    color: AppColors.profit,
  },
  changeNegative: {
    color: AppColors.loss,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderLabel: {
    fontSize: 12,
    color: AppColors.gray,
    width: 60,
    textAlign: 'center',
  },
  quickButtons: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  quickButton: {
    backgroundColor: AppColors.surfaceBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: AppColors.borderGray,
    minWidth: 50,
    alignItems: 'center',
  },
  quickButtonReset: {
    borderColor: AppColors.warning,
  },
  quickButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.white,
  },
  quickButtonTextReset: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.warning,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    backgroundColor: AppColors.surfaceBackground,
    borderWidth: 2,
    borderColor: AppColors.warning,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  resetButtonText: {
    color: AppColors.warning,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    backgroundColor: AppColors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
