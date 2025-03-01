import { useQuery } from '@apollo/client';
import { GET_LEADERBOARD } from '@/graphql/queries';
import { formatETH } from '@/lib/utils';

export type TimeFrame = 'all' | 'monthly' | 'weekly';
export type SortBy = 'winnings' | 'streak';

export interface LeaderboardEntry {
  id: string;
  totalBets: string;
  wins: string;
  losses: string;
  totalWinnings: string;
  totalStaked: string;
  currentStreak: string;
  bestStreak: string;
  largestWin: string;
  largestLoss: string;
}

interface SubgraphUser {
  id: string;
  totalBets: string;
  wins: string;
  losses: string;
  totalWinnings: string;
  totalStaked: string;
  currentStreak: string;
  bestStreak: string;
  largestWin: string;
  largestLoss: string;
}

interface LeaderboardData {
  users: SubgraphUser[];
}

export function useLeaderboard(timeframe: TimeFrame = 'all', sortBy: SortBy = 'winnings') {
  const orderByMap: Record<SortBy, string> = {
    winnings: 'totalWinnings',
    streak: 'currentStreak'
  };

  const { data, loading, error } = useQuery<LeaderboardData>(GET_LEADERBOARD, {
    variables: {
      first: 100,
      skip: 0,
      orderBy: orderByMap[sortBy]
    },
    pollInterval: 30000 // Poll every 30 seconds
  });

  // Transform BigInt values to appropriate formats
  const transformedEntries = data?.users?.map((user: SubgraphUser) => ({
    id: user.id,
    totalBets: user.totalBets.toString(),
    wins: user.wins.toString(),
    losses: user.losses.toString(),
    totalWinnings: formatETH(user.totalWinnings),
    totalStaked: formatETH(user.totalStaked),
    currentStreak: user.currentStreak.toString(),
    bestStreak: user.bestStreak.toString(),
    largestWin: formatETH(user.largestWin),
    largestLoss: formatETH(user.largestLoss)
  })) || [];

  return {
    entries: transformedEntries,
    loading,
    error: error?.message
  };
}
