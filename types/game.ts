// 游戏相关类型定义

export type GameStatus = 'waiting' | 'playing' | 'finished';

export type GameRoom = {
  id: string;
  name: string;
  status: GameStatus;
  playerCount: number;
  createdAt: Date;
};

export type Player = {
  id: string;
  name: string;
  buyIn: number;
  currentChips: number;
  profit: number;
};

export type Round = {
  id: string;
  timestamp: Date;
  changes: { playerId: string; amount: number }[];
  verified: boolean;
};

export type Settlement = Player & {
  finalAmount: number;
  needsPay: boolean;
  amount: number;
};

export type ViewType = 'rooms' | 'create' | 'buyin' | 'game' | 'settlement';
