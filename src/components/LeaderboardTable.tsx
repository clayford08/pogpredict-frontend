'use client';

import React, { useState } from 'react';
import { useLeaderboard, TimeFrame, SortBy } from '../hooks/useLeaderboard';
import { shortenAddress } from '../utils/address';
import { useWeb3 } from '@/components/Web3Provider';

interface LeaderboardTableProps {
  timeframe: TimeFrame;
}

type SortableColumn = 'totalBets' | 'winRate' | 'totalStaked' | 'totalWinnings' | 'bestStreak';
type SortDirection = 'asc' | 'desc';

function LeaderboardSkeleton() {
  return (
    <div className="animate-pulse">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="p-4">#</th>
            <th className="p-4">Address</th>
            <th className="p-4 text-center">Total Predictions</th>
            <th className="p-4 text-center">Win Rate</th>
            <th className="p-4 text-center">Volume</th>
            <th className="p-4 text-center">Winnings</th>
            <th className="p-4 text-center">Best Streak</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(10)].map((_, i) => (
            <tr key={i} className="border-t border-gray-700">
              <td className="p-4"><div className="h-4 bg-gray-800/50 rounded w-8"></div></td>
              <td className="p-4"><div className="h-4 bg-gray-800/50 rounded w-32"></div></td>
              <td className="p-4 text-center"><div className="h-4 bg-gray-800/50 rounded w-16 mx-auto"></div></td>
              <td className="p-4 text-center"><div className="h-4 bg-gray-800/50 rounded w-16 mx-auto"></div></td>
              <td className="p-4 text-center"><div className="h-4 bg-gray-800/50 rounded w-24 mx-auto"></div></td>
              <td className="p-4 text-center"><div className="h-4 bg-gray-800/50 rounded w-24 mx-auto"></div></td>
              <td className="p-4 text-center"><div className="h-4 bg-gray-800/50 rounded w-16 mx-auto"></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LeaderboardTable({ timeframe }: LeaderboardTableProps) {
  const [sortColumn, setSortColumn] = useState<SortableColumn>('totalWinnings');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const { entries: unsortedEntries, loading, error } = useLeaderboard(timeframe, 'winnings');
  const { account } = useWeb3();

  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      // If clicking the same column, toggle direction
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      // If clicking a new column, set it with desc direction
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (column: SortableColumn) => {
    if (sortColumn !== column) return '↕️';
    return sortDirection === 'desc' ? '↓' : '↑';
  };

  const sortEntries = (entries: typeof unsortedEntries) => {
    return [...entries].sort((a, b) => {
      let aValue: number, bValue: number;

      switch (sortColumn) {
        case 'totalBets':
          aValue = Number(a.totalBets);
          bValue = Number(b.totalBets);
          break;
        case 'winRate':
          const aWins = Number(a.wins), aLosses = Number(a.losses);
          const bWins = Number(b.wins), bLosses = Number(b.losses);
          aValue = aWins + aLosses > 0 ? (aWins / (aWins + aLosses)) : 0;
          bValue = bWins + bLosses > 0 ? (bWins / (bWins + bLosses)) : 0;
          break;
        case 'totalStaked':
          aValue = Number(a.totalStaked);
          bValue = Number(b.totalStaked);
          break;
        case 'totalWinnings':
          aValue = Number(a.totalWinnings);
          bValue = Number(b.totalWinnings);
          break;
        case 'bestStreak':
          aValue = Number(a.bestStreak);
          bValue = Number(b.bestStreak);
          break;
        default:
          return 0;
      }

      return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
    });
  };

  if (loading) return <LeaderboardSkeleton />;
  if (error) return (
    <div className="cyber-card bg-red-900/20 border-red-500/20">
      <p className="text-red-500">Error: {error}</p>
    </div>
  );

  const sortedEntries = sortEntries(unsortedEntries);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="p-4 text-left">#</th>
            <th className="p-4 text-left">Address</th>
            <th 
              className="p-4 text-center cursor-pointer hover:text-pog-orange transition-colors"
              onClick={() => handleSort('totalBets')}
            >
              Total Predictions {getSortIcon('totalBets')}
            </th>
            <th 
              className="p-4 text-center cursor-pointer hover:text-pog-orange transition-colors"
              onClick={() => handleSort('winRate')}
            >
              Win Rate {getSortIcon('winRate')}
            </th>
            <th 
              className="p-4 text-center cursor-pointer hover:text-pog-orange transition-colors"
              onClick={() => handleSort('totalStaked')}
            >
              Volume {getSortIcon('totalStaked')}
            </th>
            <th 
              className="p-4 text-center cursor-pointer hover:text-pog-orange transition-colors"
              onClick={() => handleSort('totalWinnings')}
            >
              Winnings {getSortIcon('totalWinnings')}
            </th>
            <th 
              className="p-4 text-center cursor-pointer hover:text-pog-orange transition-colors"
              onClick={() => handleSort('bestStreak')}
            >
              Best Streak {getSortIcon('bestStreak')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedEntries.map((entry, index) => {
            const wins = Number(entry.wins);
            const losses = Number(entry.losses);
            const winRate = wins + losses > 0 ? ((wins / (wins + losses)) * 100).toFixed(1) : '0.0';
            const isCurrentUser = account?.toLowerCase() === entry.id.toLowerCase();

            return (
              <tr 
                key={entry.id} 
                className={`border-t border-gray-700 transition-colors ${
                  isCurrentUser 
                    ? 'bg-pog-orange/20 hover:bg-pog-orange/30' 
                    : 'hover:bg-gray-800/30'
                }`}
              >
                <td className="p-4">{index + 1}</td>
                <td className={`p-4 font-mono ${isCurrentUser ? 'text-pog-orange' : ''}`}>
                  {shortenAddress(entry.id)}
                  {isCurrentUser && ' (You)'}
                </td>
                <td className="p-4 text-center">{entry.totalBets}</td>
                <td className="p-4 text-center">{winRate}%</td>
                <td className="p-4 text-center">{entry.totalStaked} AVAX</td>
                <td className="p-4 text-center text-pog-orange">
                  +{entry.totalWinnings} AVAX
                </td>
                <td className="p-4 text-center">{entry.bestStreak}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
