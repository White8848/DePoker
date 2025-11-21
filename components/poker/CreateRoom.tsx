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
        <ThemedText type="title">Create New Room</ThemedText>
      </View>

      <ScrollView style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Room Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Friday Night Game"
            placeholderTextColor={AppColors.gray}
            value={roomName}
            onChangeText={setRoomName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Buy-in Unit (Minimum Stack)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 1000"
            placeholderTextColor={AppColors.gray}
            value={initialChips}
            onChangeText={setInitialChips}
            keyboardType="numeric"
          />
          <Text style={styles.hint}>Players can only buy in multiples of 1 stack, default is 1 stack</Text>
        </View>

        <View style={styles.blockchainInfo}>
          <Ionicons name="information-circle" size={20} color={AppColors.primary} />
          <Text style={styles.blockchainInfoText}>
            Room will be registered on blockchain to ensure all transaction records are immutable
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, !roomName && styles.disabledButton]}
          disabled={!roomName}
          onPress={handleCreate}
        >
          <Ionicons name="create" size={20} color={AppColors.white} />
          <Text style={styles.primaryButtonText}>Create Room</Text>
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
