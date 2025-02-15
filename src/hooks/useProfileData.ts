import { useEffect, useState } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import { UserStats, MarketActivity } from '@/types/profile';
import { useContract } from './useContract';
import { formatEther } from '@/lib/utils';

export function useProfileData(address: string | undefined) {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [activity, setActivity] = useState<MarketActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getContract } = useContract();

  useEffect(() => {
    if (!address) {
      setUserStats(null);
      setActivity([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Fetch user stats from Firebase
    const userRef = ref(database, `leaderboard/${address.toLowerCase()}`);
    const activityRef = ref(database, `activity/${address.toLowerCase()}`);

    const unsubscribeStats = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setUserStats(null);
        setLoading(false);
        return;
      }

      // Transform the data into our UserStats format
      setUserStats({
        marketsParticipated: Number(data.marketsParticipated) || 0,
        wins: Number(data.wins) || 0,
        losses: Number(data.losses) || 0,
        totalAVAXWon: formatEther(data.totalETHWon || '0'),
        lifetimeAVAXStaked: formatEther(data.lifetimeETHStaked || '0'),
        activeAVAXStaked: formatEther(data.activeETHStaked || '0'),
        lastActiveTimestamp: data.lastActiveTimestamp || 0,
        currentStreak: Number(data.currentStreak) || 0,
        bestStreak: Number(data.bestStreak) || 0,
        largestWin: formatEther(data.largestWin || '0'),
        largestLoss: formatEther(data.largestLoss || '0'),
        totalROI: Number(data.totalROI) || 0,
        monthlyStats: {
          wins: data.monthlyWins || {},
          losses: data.monthlyLosses || {},
          avaxWon: Object.entries(data.monthlyETHWon || {}).reduce((acc, [key, value]) => ({
            ...acc,
            [key]: formatEther(value as string)
          }), {}),
          avaxStaked: Object.entries(data.monthlyETHStaked || {}).reduce((acc, [key, value]) => ({
            ...acc,
            [key]: formatEther(value as string)
          }), {}),
          optionACount: data.monthlyOptionACount || {},
          optionBCount: data.monthlyOptionBCount || {}
        }
      });
      setLoading(false);
    }, (error) => {
      console.error('Error loading user stats:', error);
      setError('Failed to load user stats');
      setLoading(false);
    });

    const unsubscribeActivity = onValue(activityRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setActivity([]);
        return;
      }

      const activities = Object.values(data)
        .map((item: any) => ({
          marketId: item.marketId,
          type: item.type,
          timestamp: item.timestamp,
          amount: formatEther(item.amount || '0'),
          txHash: item.txHash,
          isOptionA: item.isOptionA
        }))
        .sort((a: any, b: any) => b.timestamp - a.timestamp) as MarketActivity[];

      setActivity(activities);
    }, (error) => {
      console.error('Error loading activity:', error);
    });

    return () => {
      off(userRef);
      off(activityRef);
      unsubscribeStats();
      unsubscribeActivity();
    };
  }, [address, getContract]);

  return {
    userStats,
    activity,
    loading,
    error
  };
} 