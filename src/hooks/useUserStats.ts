import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { request, gql } from 'graphql-request';

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || '';

export interface UserStats {
  marketsParticipated: number;
  wins: number;
  losses: number;
  totalETHWon: string;
  lifetimeETHStaked: string;
  activeETHStaked: string;
  lastActiveTimestamp: number;
  currentStreak: number;
  bestStreak: number;
  largestWin: string;
  largestLoss: string;
  totalROI: number;
}

const USER_STATS_QUERY = gql`
  query GetUserStats($id: ID!) {
    user(id: $id) {
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
    }
  }
`;

export function useUserStats(address: string | undefined) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!address || !SUBGRAPH_URL) return null;

    try {
      const { user } = await request(SUBGRAPH_URL, USER_STATS_QUERY, {
        id: address.toLowerCase()
      });

      if (!user) {
        setStats(null);
        return;
      }

      setStats({
        marketsParticipated: Number(user.totalBets),
        wins: Number(user.wins),
        losses: Number(user.losses),
        totalETHWon: user.totalWinnings,
        lifetimeETHStaked: user.totalStaked,
        activeETHStaked: user.activeStaked || '0',
        lastActiveTimestamp: Number(user.lastActiveTimestamp),
        currentStreak: Number(user.currentStreak),
        bestStreak: Number(user.bestStreak),
        largestWin: user.largestWin,
        largestLoss: user.largestLoss,
        totalROI: Number(user.totalROI)
      });
    } catch (err) {
      console.error('Error fetching user stats:', err);
      setError('Failed to load user stats');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (!address) {
      setStats(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchStats();

    // Set up polling for updates
    const interval = setInterval(fetchStats, 15000); // Poll every 15 seconds

    return () => clearInterval(interval);
  }, [address, fetchStats]);

  return { stats, loading, error };
} 