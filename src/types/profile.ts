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
  totalROI: number;
  monthlyStats: {
    wins: { [key: number]: number };
    losses: { [key: number]: number };
    avaxWon: { [key: number]: string };
    avaxStaked: { [key: number]: string };
    optionACount: { [key: number]: number };
    optionBCount: { [key: number]: number };
  };
}

export interface MarketActivity {
  marketId: number;
  type: 'buy' | 'sell' | 'claim' | 'win' | 'refund';
  timestamp: number;
  amount: string;
  txHash: string;
  isOptionA?: boolean;
} 