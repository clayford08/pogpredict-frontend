import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useContract } from './useContract';
import { database } from '@/lib/firebase';
import { ref, onValue, off } from 'firebase/database';

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

export function useUserStats(address: string | undefined) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setStats(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const userRef = ref(database, `stats/${address.toLowerCase()}`);

    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setStats(null);
        setLoading(false);
        return;
      }

      setStats({
        marketsParticipated: Number(data.totalBets) || 0,
        wins: Number(data.wins) || 0,
        losses: Number(data.losses) || 0,
        totalETHWon: data.totalWinnings || '0',
        lifetimeETHStaked: data.totalStaked || '0',
        activeETHStaked: data.activeStaked || '0',
        lastActiveTimestamp: Number(data.lastActiveTimestamp) || 0,
        currentStreak: Number(data.currentStreak) || 0,
        bestStreak: Number(data.bestStreak) || 0,
        largestWin: data.largestWin || '0',
        largestLoss: data.largestLoss || '0',
        totalROI: Number(data.totalROI) || 0
      });
      setLoading(false);
    }, (error) => {
      console.error('Error loading user stats:', error);
      setError('Failed to load user stats');
      setLoading(false);
    });

    return () => {
      off(userRef);
    };
  }, [address]);

  return { stats, loading, error };
} 