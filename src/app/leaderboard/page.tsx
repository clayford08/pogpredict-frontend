'use client';

import React, { useEffect, useState } from 'react';
import { useWeb3 } from '@/components/Web3Provider';
import { database } from '@/lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import { ethers } from 'ethers';
import { useUserStats, UserStats } from '@/hooks/useUserStats';

interface LeaderboardEntry {
  address: string;
  stats: UserStats;
}

export default function LeaderboardPage() {
  const { account, connect } = useWeb3();
  const { stats: userStats, loading: userStatsLoading } = useUserStats(account || undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [sortBy, setSortBy] = useState<keyof UserStats>('totalETHWon');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadLeaderboard();
    return () => {
      const leaderboardRef = ref(database, 'leaderboard');
      off(leaderboardRef);
    };
  }, []); // Load on mount

  const loadLeaderboard = () => {
    try {
      setLoading(true);
      const leaderboardRef = ref(database, 'leaderboard');
      
      onValue(leaderboardRef, async (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setLeaderboard([]);
          setLoading(false);
          return;
        }

        // Transform Firebase data into leaderboard entries
        const entries = Object.entries(data).map(([address, stats]: [string, any]) => ({
          address,
          stats: {
            marketsParticipated: Number(stats.marketsParticipated) || 0,
            wins: Number(stats.wins) || 0,
            losses: Number(stats.losses) || 0,
            totalETHWon: ethers.formatEther(stats.totalETHWon || '0'),
            lifetimeETHStaked: ethers.formatEther(stats.lifetimeETHStaked || '0'),
            activeETHStaked: ethers.formatEther(stats.activeETHStaked || '0'),
            lastActiveTimestamp: Number(stats.lastActiveTimestamp) || 0,
            currentStreak: Number(stats.currentStreak) || 0,
            bestStreak: Number(stats.bestStreak) || 0,
            largestWin: ethers.formatEther(stats.largestWin || '0'),
            largestLoss: ethers.formatEther(stats.largestLoss || '0'),
            totalROI: Number(stats.totalROI) || 0
          }
        }));

        // Sort entries
        const sortedEntries = sortLeaderboard(entries, sortBy, sortDirection);
        setLeaderboard(sortedEntries);
        setLoading(false);
      }, (error) => {
        console.error('Error loading leaderboard:', error);
        setError('Failed to load leaderboard');
        setLoading(false);
      });

    } catch (err) {
      console.error('Error setting up leaderboard listener:', err);
      setError('Failed to load leaderboard');
      setLoading(false);
    }
  };

  const sortLeaderboard = (
    entries: LeaderboardEntry[],
    sortKey: keyof UserStats,
    direction: 'asc' | 'desc'
  ) => {
    return [...entries].sort((a, b) => {
      let comparison = 0;
      if (typeof a.stats[sortKey] === 'string') {
        // Handle ETH values
        const aValue = parseFloat(a.stats[sortKey] as string);
        const bValue = parseFloat(b.stats[sortKey] as string);
        comparison = aValue - bValue;
      } else {
        // Handle numeric values
        comparison = (a.stats[sortKey] as number) - (b.stats[sortKey] as number);
      }
      return direction === 'desc' ? -comparison : comparison;
    });
  };

  const handleSort = (key: keyof UserStats) => {
    if (key === sortBy) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDirection('desc');
    }
    setLeaderboard(prev => sortLeaderboard(prev, key, sortDirection));
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!account) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="cyber-card text-center">
          <h1 className="cyber-title mb-6">Connect Wallet</h1>
          <p className="cyber-text mb-8">
            Connect your wallet to view the leaderboard and your stats.
          </p>
          <button onClick={connect} className="cyber-button">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (loading || userStatsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pog-orange"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="cyber-card text-center">
          <h1 className="cyber-title text-red-500">Error</h1>
          <p className="cyber-text mt-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* User Stats */}
      {userStats && (
        <div className="cyber-card mb-8">
          <h2 className="cyber-subtitle mb-4">Your Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-400">Total Won</p>
              <p className="text-xl font-bold">{Number(userStats.totalETHWon).toFixed(4)} AVAX</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Win/Loss</p>
              <p className="text-xl font-bold">{userStats.wins}/{userStats.losses}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Best Streak</p>
              <p className="text-xl font-bold">{userStats.bestStreak}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">ROI</p>
              <p className="text-xl font-bold">{userStats.totalROI.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="cyber-card">
        <div className="text-center mb-6">
          <h1 className="cyber-title">Global Leaderboard</h1>
        </div>
        <div className="overflow-x-auto">
          {leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <p className="cyber-text text-gray-400 mb-2">No participants yet</p>
              <p className="cyber-text text-gray-500">Be the first to participate in a prediction market!</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th className="p-4">#</th>
                  <th className="p-4">Address</th>
                  <th className="p-4">Total Won</th>
                  <th className="p-4">Total Spent</th>
                  <th className="p-4">Wins</th>
                  <th className="p-4">Best Streak</th>
                  <th className="p-4">ROI</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr 
                    key={entry.address}
                    className={`border-t border-gray-700 ${
                      account?.toLowerCase() === entry.address.toLowerCase() ? 'bg-pog-orange bg-opacity-20' : ''
                    }`}
                  >
                    <td className="p-4">{index + 1}</td>
                    <td className="p-4">{formatAddress(entry.address)}</td>
                    <td className="p-4">{Number(entry.stats.totalETHWon).toFixed(4)} AVAX</td>
                    <td className="p-4">{Number(entry.stats.totalSpent || 0).toFixed(4)} AVAX</td>
                    <td className="p-4">{entry.stats.wins}</td>
                    <td className="p-4">{entry.stats.bestStreak}</td>
                    <td className="p-4">{entry.stats.totalROI.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
