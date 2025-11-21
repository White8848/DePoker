import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppColors } from '@/constants/colors';
import { GameRoom, Player } from '@/types/game';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
type Props = {
  room: GameRoom;
  players: Player[];
  onBack: () => void;
  onAddPlayer: (name: string, amount: number) => void;
  onStartGame: () => void;
};

export default function BuyIn({ room, players, onBack, onAddPlayer, onStartGame }: Props) {
  const [playerName, setPlayerName] = React.useState('');
  const [buyInHands, setBuyInHands] = React.useState('1');

  const buyInAmount = parseFloat(buyInHands || '0') * room.buyInUnit;

  const handleBuyIn = () => {
    onAddPlayer(playerName, buyInAmount);
    setPlayerName('');
    setBuyInHands('1');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: AppColors.background }} edges={['top', 'bottom']}>
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText type="title">Player Buy-in</ThemedText>
      </View>

      <View style={styles.roomInfoCard}>
        <Text style={styles.roomInfoTitle}>{room.name}</Text>
        <Text style={styles.roomInfoSubtitle}>Players: {players.length} · Stack: ${room.buyInUnit}</Text>
      </View>

      <ScrollView style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Player Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your nickname"
            placeholderTextColor={AppColors.gray}
            value={playerName}
            onChangeText={setPlayerName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Number of Stacks</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter stacks (default 1)"
            placeholderTextColor={AppColors.gray}
            value={buyInHands}
            onChangeText={setBuyInHands}
            keyboardType="numeric"
          />
          <View style={styles.amountDisplay}>
            <Text style={styles.amountLabel}>Buy-in Amount:</Text>
            <Text style={styles.amountValue}>${buyInAmount}</Text>
            <Text style={styles.amountFormula}>({buyInHands || 0} stacks × ${room.buyInUnit})</Text>
          </View>
          <Text style={styles.hint}>Actual transfer will be guided after game ends</Text>
        </View>

        {players.length > 0 && (
          <View style={styles.playersPreview}>
            <Text style={styles.label}>Joined Players</Text>
            {players.map((player) => (
              <View key={player.id} style={styles.playerItem}>
                <Ionicons name="person-circle" size={24} color={AppColors.success} />
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerChips}>${player.buyIn}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.primaryButton, (!playerName || !buyInHands || parseFloat(buyInHands) < 1) && styles.disabledButton]}
          disabled={!playerName || !buyInHands || parseFloat(buyInHands) < 1}
          onPress={handleBuyIn}
        >
          <Ionicons name="cash" size={20} color={AppColors.white} />
          <Text style={styles.primaryButtonText}>Confirm Buy-in</Text>
        </TouchableOpacity>

        {players.length >= 2 && (
          <TouchableOpacity
            style={[styles.secondaryButton, { marginTop: 12 }]}
            onPress={onStartGame}
          >
            <Ionicons name="play" size={20} color={AppColors.success} />
            <Text style={styles.secondaryButtonText}>Start Game</Text>
          </TouchableOpacity>
        )}
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
  roomInfoCard: {
    backgroundColor: AppColors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: AppColors.borderGray,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  roomInfoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.white,
  },
  roomInfoSubtitle: {
    fontSize: 14,
    color: AppColors.gray,
    marginTop: 4,
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
  amountDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: AppColors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.primary,
  },
  amountLabel: {
    fontSize: 14,
    color: AppColors.gray,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.primary,
    marginLeft: 8,
  },
  amountFormula: {
    fontSize: 12,
    color: AppColors.lightGray,
    marginLeft: 8,
  },
  playersPreview: {
    backgroundColor: AppColors.background,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  playerName: {
    flex: 1,
    fontSize: 16,
    color: AppColors.white,
  },
  playerChips: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.success,
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
  secondaryButton: {
    backgroundColor: AppColors.surfaceBackground,
    borderWidth: 2,
    borderColor: AppColors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  secondaryButtonText: {
    color: AppColors.success,
    fontSize: 16,
    fontWeight: '600',
  },
});
