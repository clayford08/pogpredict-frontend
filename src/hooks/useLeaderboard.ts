import { useEffect, useState } from 'react';
import { request, gql } from 'graphql-request';

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || '';

interface UserStats {
  address: string;
  totalBets: number;
  wins: number;
  losses: number;
  totalWinnings: string;
  totalLost: string;
  totalStaked: string;
  lastActiveTimestamp: string;
}

interface LeaderboardEntry extends UserStats {
  roi: number;
  winRate: number;
}

const LEADERBOARD_QUERY = gql`
  query GetLeaderboard {
    users(
      first: 100,
      orderBy: totalROI,
      orderDirection: desc,
      where: { totalBets_gt: 0 }
    ) {
      id
      totalBets
      wins
      losses
      totalWinnings
      totalLost
      totalStaked
      lastActiveTimestamp
      totalROI
    }
  }
`;

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!SUBGRAPH_URL) return;

      try {
        const { users } = await request(SUBGRAPH_URL, LEADERBOARD_QUERY);
        
        const entries: LeaderboardEntry[] = users.map((user: any) => {
          const winRate = Number(user.totalBets) > 0
            ? (Number(user.wins) / Number(user.totalBets)) * 100
            : 0;

          return {
            address: user.id,
            totalBets: Number(user.totalBets),
            wins: Number(user.wins),
            losses: Number(user.losses),
            totalWinnings: user.totalWinnings,
            totalLost: user.totalLost,
            totalStaked: user.totalStaked,
            lastActiveTimestamp: user.lastActiveTimestamp,
            roi: Number(user.totalROI),
            winRate
          };
        });

        setLeaderboard(entries);
        setError(null);
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setError('Failed to load leaderboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 15000); // Poll every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return { leaderboard, loading, error };
} 