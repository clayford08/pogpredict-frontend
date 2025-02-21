export interface UserStats {
  marketsParticipated: number;
  wins: number;
  losses: number;
  totalAVAXWon: string;
  lifetimeAVAXStaked: string;
  activeAVAXStaked: string;
  lastActiveTimestamp: number;
  currentStreak: number;
  bestStreak: number;
  largestWin: string;
  largestLoss: string;
}

export interface MarketActivity {
  marketId: number;
  type: 'buy' | 'sell' | 'claim' | 'win' | 'loss' | 'refund';
  timestamp: number;
  amount: string;
  txHash: string;
  isOptionA?: boolean;
  selectedOption?: string;
}
