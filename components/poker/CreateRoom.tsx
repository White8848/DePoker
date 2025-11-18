import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppColors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
type Props = {
  onBack: () => void;
  onCreateRoom: (name: string, initialChips: string) => void;
};

export default function CreateRoom({ onBack, onCreateRoom }: Props) {
  const [roomName, setRoomName] = React.useState('');
  const [initialChips, setInitialChips] = React.useState('1000');

  const handleCreate = () => {
    onCreateRoom(roomName, initialChips);
    setRoomName('');
    setInitialChips('1000');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: AppColors.background }} edges={['top', 'bottom']}>
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText type="title">创建新房间</ThemedText>
      </View>

      <ScrollView style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>房间名称</Text>
          <TextInput
            style={styles.input}
            placeholder="例如：周五夜局"
            placeholderTextColor={AppColors.gray}
            value={roomName}
            onChangeText={setRoomName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>一手筹码数（最低购入单位）</Text>
          <TextInput
            style={styles.input}
            placeholder="例如：1000"
            placeholderTextColor={AppColors.gray}
            value={initialChips}
            onChangeText={setInitialChips}
            keyboardType="numeric"
          />
          <Text style={styles.hint}>玩家只能购买一手整倍数的筹码，默认买入1手</Text>
        </View>

        <View style={styles.blockchainInfo}>
          <Ionicons name="information-circle" size={20} color={AppColors.primary} />
          <Text style={styles.blockchainInfoText}>
            房间创建后将在区块链上注册，确保所有交易记录不可篡改
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, !roomName && styles.disabledButton]}
          disabled={!roomName}
          onPress={handleCreate}
        >
          <Ionicons name="create" size={20} color={AppColors.white} />
          <Text style={styles.primaryButtonText}>创建房间</Text>
        </TouchableOpacity>
      </ScrollView>
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
  form: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: AppColors.white,
  },
  input: {
    backgroundColor: AppColors.surfaceBackground,
    borderWidth: 1,
    borderColor: AppColors.borderGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: AppColors.white,
  },
  hint: {
    fontSize: 12,
    color: AppColors.lightGray,
    marginTop: 4,
  },
  blockchainInfo: {
    flexDirection: 'row',
    backgroundColor: AppColors.primaryLight,
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 24,
  },
  blockchainInfoText: {
    flex: 1,
    fontSize: 14,
    color: AppColors.primary,
  },
  primaryButton: {
    backgroundColor: AppColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  primaryButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
