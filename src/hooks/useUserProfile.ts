import { useEffect, useState } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

export interface UserActivity {
  type: 'prediction' | 'win' | 'loss' | 'claim' | 'refund';
  marketId: string;
  amount: string;
  isOptionA?: boolean;
  timestamp: number;
  txHash?: string;
}

export interface UserStats {
  totalBets: number;
  wins: number;
  losses: number;
  totalWinnings: string;
  totalLost: string;
  totalStaked: string;
  lastActiveTimestamp: string;
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
    optionACount: { [key: string]: number };
    optionBCount: { [key: string]: number };
  };
}

const defaultStats: UserStats = {
  totalBets: 0,
  wins: 0,
  losses: 0,
  totalWinnings: '0',
  totalLost: '0',
  totalStaked: '0',
  lastActiveTimestamp: '0',
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
    optionACount: {},
    optionBCount: {}
  }
};

export function useUserProfile(address: string | undefined) {
  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [activity, setActivity] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setStats(defaultStats);
      setActivity([]);
      setLoading(false);
      return;
    }

    const lowerAddress = address.toLowerCase();

    // References to different data paths
    const statsRef = ref(database, `stats/${lowerAddress}`);
    const activityRef = ref(database, `activity/${lowerAddress}`);

    // Subscribe to stats changes
    const unsubStats = onValue(statsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (!data) {
          setStats(defaultStats);
          return;
        }

        // Calculate derived stats
        const totalStaked = BigInt(data.totalStaked || '0');
        const totalWinnings = BigInt(data.totalWinnings || '0');
        const totalLost = BigInt(data.totalLost || '0');
        const netProfit = totalWinnings - totalLost;
        const roi = totalStaked > 0n 
          ? Number((netProfit * 10000n / totalStaked)) / 100
          : 0;

        setStats({
          totalBets: data.totalBets || 0,
          wins: data.wins || 0,
          losses: data.losses || 0,
          totalWinnings: data.totalWinnings || '0',
          totalLost: data.totalLost || '0',
          totalStaked: data.totalStaked || '0',
          lastActiveTimestamp: data.lastActiveTimestamp || '0',
          currentStreak: data.currentStreak || 0,
          bestStreak: data.bestStreak || 0,
          largestWin: data.largestWin || '0',
          largestLoss: data.largestLoss || '0',
          totalROI: roi,
          monthlyStats: {
            wins: data.monthlyStats?.wins || {},
            losses: data.monthlyStats?.losses || {},
            winnings: data.monthlyStats?.winnings || {},
            staked: data.monthlyStats?.staked || {},
            optionACount: data.monthlyStats?.optionACount || {},
            optionBCount: data.monthlyStats?.optionBCount || {}
          }
        });
      } catch (err) {
        console.error('Error processing user stats:', err);
        setError('Failed to load user stats');
      }
    });

    // Subscribe to activity changes
    const unsubActivity = onValue(activityRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (!data) {
          setActivity([]);
          return;
        }

        // Convert activity object to sorted array
        const activityArray = Object.entries(data)
          .map(([_, data]) => data as UserActivity)
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 50); // Limit to most recent 50 activities

        setActivity(activityArray);
      } catch (err) {
        console.error('Error processing user activity:', err);
        setError('Failed to load user activity');
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubStats();
      unsubActivity();
    };
  }, [address]);

  return { stats, activity, loading, error };
} 