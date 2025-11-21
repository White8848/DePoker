import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppColors } from '@/constants/colors';
import { GameRoom } from '@/types/game';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  rooms: GameRoom[];
  onCreateRoom: () => void;
  onSelectRoom: (room: GameRoom) => void;
};

export default function RoomsList({ rooms, onCreateRoom, onSelectRoom }: Props) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: AppColors.background }} edges={['top', 'bottom']}>
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>Poker Ledger</ThemedText>
        <ThemedText style={styles.subtitle}>Blockchain Verified · Secure & Trusted</ThemedText>
      </View>

      <TouchableOpacity style={styles.createButton} onPress={onCreateRoom}>
        <Ionicons name="add-circle" size={24} color={AppColors.white} />
        <Text style={styles.createButtonText}>Create New Room</Text>
      </TouchableOpacity>

      <ThemedText type="subtitle" style={styles.sectionTitle}>Current Rooms</ThemedText>

      <ScrollView style={styles.roomsList}>
        {rooms.map((room) => (
          <TouchableOpacity
            key={room.id}
            style={styles.roomCard}
            onPress={() => onSelectRoom(room)}
          >
            <View style={styles.roomHeader}>
              <View style={styles.roomTitleRow}>
                <Ionicons 
                  name={room.status === 'playing' ? 'play-circle' : room.status === 'waiting' ? 'time' : 'checkmark-circle'} 
                  size={24} 
                  color={AppColors[room.status]} 
                />
                <Text style={styles.roomName}>{room.name}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: AppColors[room.status] }]}>
                <Text style={styles.statusText}>
                  {room.status === 'playing' ? 'Playing' : room.status === 'waiting' ? 'Waiting' : 'Finished'}
                </Text>
              </View>
            </View>
            <View style={styles.roomInfo}>
              <View style={styles.infoItem}>
                <Ionicons name="people" size={16} color={AppColors.gray} />
                <Text style={styles.infoText}>{room.playerCount} Players</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time" size={16} color={AppColors.gray} />
                <Text style={styles.infoText}>{room.createdAt.toLocaleTimeString()}</Text>
              </View>
            </View>
            <View style={styles.blockchainBadge}>
              <Ionicons name="shield-checkmark" size={14} color={AppColors.primary} />
              <Text style={styles.blockchainText}>Blockchain Verified</Text>
            </View>
          </TouchableOpacity>
        ))}
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
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.gray,
    marginTop: 4,
  },
  createButton: {
    backgroundColor: AppColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  createButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
    color: AppColors.white,
  },
  roomsList: {
    flex: 1,
  },
  roomCard: {
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
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roomName: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.white,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: AppColors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  roomInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: AppColors.gray,
  },
  blockchainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  blockchainText: {
    fontSize: 12,
    color: AppColors.primary,
    fontWeight: '500',
  },
});
