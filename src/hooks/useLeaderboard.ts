import { useEffect, useState } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

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

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const statsRef = ref(database, 'stats');

    const unsubscribe = onValue(statsRef, (snapshot) => {
      try {
        const stats = snapshot.val();
        if (!stats) {
          setLeaderboard([]);
          setLoading(false);
          return;
        }

        // Process stats into leaderboard entries
        const entries: LeaderboardEntry[] = Object.entries(stats).map(([address, userStats]: [string, any]) => {
          const totalStaked = BigInt(userStats.totalStaked || '0');
          const totalWinnings = BigInt(userStats.totalWinnings || '0');
          const totalLost = BigInt(userStats.totalLost || '0');
          
          // Calculate ROI
          const roi = totalStaked > 0n 
            ? Number((totalWinnings - totalLost) * 10000n / totalStaked) / 100
            : 0;

          // Calculate win rate
          const winRate = (userStats.totalBets || 0) > 0
            ? (userStats.wins || 0) / (userStats.totalBets || 1) * 100
            : 0;

          return {
            address,
            ...userStats,
            roi,
            winRate
          };
        });

        // Sort by ROI descending
        entries.sort((a, b) => b.roi - a.roi);

        setLeaderboard(entries);
        setError(null);
      } catch (err) {
        console.error('Error processing leaderboard data:', err);
        setError('Failed to load leaderboard data');
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error('Error fetching leaderboard data:', error);
      setError('Failed to fetch leaderboard data');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { leaderboard, loading, error };
} 