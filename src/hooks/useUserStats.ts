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
    const userRef = ref(database, `leaderboard/${address.toLowerCase()}`);

    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setStats(null);
        setLoading(false);
        return;
      }

      setStats({
        marketsParticipated: Number(data.marketsParticipated) || 0,
        wins: Number(data.wins) || 0,
        losses: Number(data.losses) || 0,
        totalETHWon: ethers.formatEther(data.totalETHWon || '0'),
        lifetimeETHStaked: ethers.formatEther(data.lifetimeETHStaked || '0'),
        activeETHStaked: ethers.formatEther(data.activeETHStaked || '0'),
        lastActiveTimestamp: Number(data.lastActiveTimestamp) || 0,
        currentStreak: Number(data.currentStreak) || 0,
        bestStreak: Number(data.bestStreak) || 0,
        largestWin: ethers.formatEther(data.largestWin || '0'),
        largestLoss: ethers.formatEther(data.largestLoss || '0'),
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