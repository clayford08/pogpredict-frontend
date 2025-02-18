import { useEffect, useState } from 'react';
import { request, gql } from 'graphql-request';

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || '';

interface MonthlyStat {
  yearMonth: string;
  wins: string;
  losses: string;
  winnings: string;
  staked: string;
}

interface UserBet {
  market: {
    id: string;
  };
  isOptionA: boolean;
  amount: string;
  timestamp: string;
  outcome: string | null;
  claimed: boolean;
  winnings: string | null;
}

interface SubgraphUser {
  totalBets: string;
  wins: string;
  losses: string;
  totalWinnings: string;
  totalLost: string;
  totalStaked: string;
  lastActiveTimestamp: string;
  currentStreak: string;
  bestStreak: string;
  largestWin: string;
  largestLoss: string;
  totalROI: string;
  monthlyStats: MonthlyStat[];
  bets: UserBet[];
}

interface SubgraphResponse {
  user: SubgraphUser | null;
}

export interface UserStats {
  totalBets: number;
  wins: number;
  losses: number;
  totalWinnings: string;
  totalLost: string;
  totalStaked: string;
  lastActiveTimestamp: number;
  currentStreak: number;
  bestStreak: number;
  largestWin: string;
  largestLoss: string;
  totalROI: number;
  monthlyStats: {
    wins: { [key: string]: number };
    losses: { [key: string]: number };
    winnings: { [key: string]: string };
    staked: { [key: string]: string };
  };
}

export interface UserActivity {
  marketId: string;
  isOptionA: boolean;
  amount: string;
  timestamp: number;
  outcome?: number;
  claimed: boolean;
  winnings?: string;
}

const USER_PROFILE_QUERY = gql`
  query GetUserProfile($address: ID!) {
    user(id: $address) {
      totalBets
      wins
      losses
      totalWinnings
      totalLost
      totalStaked
      lastActiveTimestamp
      currentStreak
      bestStreak
      largestWin
      largestLoss
      totalROI
      monthlyStats {
        yearMonth
        wins
        losses
        winnings
        staked
      }
      bets(orderBy: timestamp, orderDirection: desc, first: 50) {
        market {
          id
        }
        isOptionA
        amount
        timestamp
        outcome
        claimed
        winnings
      }
    }
  }
`;

export function useUserProfile(address: string | undefined) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activity, setActivity] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!address || !SUBGRAPH_URL) return;

      try {
        const response = await request<SubgraphResponse>(SUBGRAPH_URL, USER_PROFILE_QUERY, {
          address: address.toLowerCase(),
        });

        if (!response.user) {
          setStats({
            totalBets: 0,
            wins: 0,
            losses: 0,
            totalWinnings: '0',
            totalLost: '0',
            totalStaked: '0',
            lastActiveTimestamp: 0,
            currentStreak: 0,
            bestStreak: 0,
            largestWin: '0',
            largestLoss: '0',
            totalROI: 0,
            monthlyStats: {
              wins: {},
              losses: {},
              winnings: {},
              staked: {},
            },
          });
          setActivity([]);
          setLoading(false);
          return;
        }

        // Process monthly stats
        const monthlyStats = {
          wins: {} as { [key: string]: number },
          losses: {} as { [key: string]: number },
          winnings: {} as { [key: string]: string },
          staked: {} as { [key: string]: string },
        };

        response.user.monthlyStats.forEach((stat) => {
          monthlyStats.wins[stat.yearMonth] = Number(stat.wins);
          monthlyStats.losses[stat.yearMonth] = Number(stat.losses);
          monthlyStats.winnings[stat.yearMonth] = stat.winnings;
          monthlyStats.staked[stat.yearMonth] = stat.staked;
        });

        // Set user stats
        setStats({
          totalBets: Number(response.user.totalBets),
          wins: Number(response.user.wins),
          losses: Number(response.user.losses),
          totalWinnings: response.user.totalWinnings,
          totalLost: response.user.totalLost,
          totalStaked: response.user.totalStaked,
          lastActiveTimestamp: Number(response.user.lastActiveTimestamp),
          currentStreak: Number(response.user.currentStreak),
          bestStreak: Number(response.user.bestStreak),
          largestWin: response.user.largestWin,
          largestLoss: response.user.largestLoss,
          totalROI: Number(response.user.totalROI),
          monthlyStats,
        });

        // Set activity
        setActivity(
          response.user.bets.map((bet) => ({
            marketId: bet.market.id,
            isOptionA: bet.isOptionA,
            amount: bet.amount,
            timestamp: Number(bet.timestamp),
            outcome: bet.outcome ? Number(bet.outcome) : undefined,
            claimed: bet.claimed,
            winnings: bet.winnings || undefined,
          }))
        );

        setError(null);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchUserProfile();

    // Poll for updates every 15 seconds
    const interval = setInterval(fetchUserProfile, 15000);

    return () => clearInterval(interval);
  }, [address]);

  return { stats, activity, loading, error };
} 