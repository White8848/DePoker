// blockchain/hooks/useDePoker2.ts
import { useCallback, useState } from 'react';
import {
    createRoom,
    finalizeRoom,
    getNextRoomId,
    getPlayerReputation,
    getRoomInfo,
    joinRoom,
    RoomData,
    startRoom,
    voteWinner,
} from '../utils/contract';

export interface UseDePoker2Result {
  loading: boolean;
  error: string | null;
  createRoom: (buyIn: string, privateKey?: string) => Promise<number | null>;
  joinRoom: (roomId: number, buyIn: string, privateKey?: string) => Promise<boolean>;
  startRoom: (roomId: number, privateKey?: string) => Promise<boolean>;
  voteWinner: (roomId: number, candidateAddress: string, privateKey?: string) => Promise<boolean>;
  finalizeRoom: (roomId: number, winnerAddress: string, privateKey?: string) => Promise<boolean>;
  getRoomInfo: (roomId: number) => Promise<RoomData | null>;
  getPlayerReputation: (playerAddress: string) => Promise<number | null>;
  getNextRoomId: () => Promise<number | null>;
}

/**
 * DePoker2 合约交互 Hook
 */
export function useDePoker2(): UseDePoker2Result {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateRoom = useCallback(async (buyIn: string, privateKey?: string): Promise<number | null> => {
    setLoading(true);
    setError(null);
    try {
      const roomId = await createRoom(buyIn, privateKey);
      return roomId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create room';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleJoinRoom = useCallback(async (
    roomId: number,
    buyIn: string,
    privateKey?: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await joinRoom(roomId, buyIn, privateKey);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join room';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStartRoom = useCallback(async (roomId: number, privateKey?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await startRoom(roomId, privateKey);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start room';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleVoteWinner = useCallback(async (
    roomId: number,
    candidateAddress: string,
    privateKey?: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await voteWinner(roomId, candidateAddress, privateKey);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to vote';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFinalizeRoom = useCallback(async (
    roomId: number,
    winnerAddress: string,
    privateKey?: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await finalizeRoom(roomId, winnerAddress, privateKey);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to finalize room';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGetRoomInfo = useCallback(async (roomId: number): Promise<RoomData | null> => {
    setLoading(true);
    setError(null);
    try {
      const roomData = await getRoomInfo(roomId);
      return roomData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get room info';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGetPlayerReputation = useCallback(async (playerAddress: string): Promise<number | null> => {
    setLoading(true);
    setError(null);
    try {
      const reputation = await getPlayerReputation(playerAddress);
      return reputation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get reputation';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGetNextRoomId = useCallback(async (): Promise<number | null> => {
    setLoading(true);
    setError(null);
    try {
      const nextRoomId = await getNextRoomId();
      return nextRoomId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get next room ID';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createRoom: handleCreateRoom,
    joinRoom: handleJoinRoom,
    startRoom: handleStartRoom,
    voteWinner: handleVoteWinner,
    finalizeRoom: handleFinalizeRoom,
    getRoomInfo: handleGetRoomInfo,
    getPlayerReputation: handleGetPlayerReputation,
    getNextRoomId: handleGetNextRoomId,
  };
}
