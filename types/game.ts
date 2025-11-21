// 游戏相关类型定义

export type GameStatus = 'waiting' | 'playing' | 'finished';

export type GameRoom = {
  id: string;
  name: string;
  status: GameStatus;
  playerCount: number;
  createdAt: Date;
  buyInUnit: number; // 一手筹码数（最低购入单位）
  smallBlind: number; // 小盲
  bigBlind: number; // 大盲
};

export type Player = {
  id: string;
  name: string;
  buyIn: number;
  currentChips: number;
  profit: number;
  folded: boolean; // 是否已弃牌
  currentBet: number; // 当前下注额
  position: number; // 位置索引
};

export type PlayerAction = 'fold' | 'call' | 'raise' | 'check' | 'allin';

export type Action = {
  playerId: string;
  action: PlayerAction;
  amount: number;
  timestamp: Date;
};

export type BettingRound = 'preflop' | 'flop' | 'turn' | 'river';

export type Round = {
  id: string;
  roundNumber: number;
  timestamp: Date;
  actions: Action[];
  pot: number; // 底池
  winners: { playerId: string; amount: number }[]; // 赢家和赢得金额
  dealerPosition: number; // 庄家位置
  bettingRound: BettingRound; // 当前下注轮
  currentPlayerIndex: number; // 当前行动玩家索引
  currentBet: number; // 当前最高下注
  isComplete: boolean; // 本轮是否完成
};

export type Settlement = Player & {
  finalAmount: number;
  needsPay: boolean;
  amount: number;
};

export type ViewType = 'rooms' | 'create' | 'buyin' | 'game' | 'settlement';
