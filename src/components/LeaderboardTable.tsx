'use client';

import React, { useState } from 'react';
import { useLeaderboard, TimeFrame, SortBy } from '../hooks/useLeaderboard';
import { formatEther } from 'ethers';
import { shortenAddress } from '../utils/address';

interface LeaderboardTableProps {
  timeframe: TimeFrame;
}

function LeaderboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-4 flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 w-24 bg-gray-200 rounded"></div>
        ))}
      </div>
      <table className="min-w-full table-auto">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left">Rank</th>
            <th className="px-4 py-2 text-left">Address</th>
            <th className="px-4 py-2 text-right">Total Bets</th>
            <th className="px-4 py-2 text-right">Win Rate</th>
            <th className="px-4 py-2 text-right">Volume</th>
            <th className="px-4 py-2 text-right">Winnings</th>
            <th className="px-4 py-2 text-right">Losses</th>
            <th className="px-4 py-2 text-right">Profit/Loss</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(10)].map((_, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-4 py-2"><div className="h-4 bg-gray-200 rounded w-8"></div></td>
              <td className="px-4 py-2"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
              <td className="px-4 py-2 text-right"><div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div></td>
              <td className="px-4 py-2 text-right"><div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div></td>
              <td className="px-4 py-2 text-right"><div className="h-4 bg-gray-200 rounded w-24 ml-auto"></div></td>
              <td className="px-4 py-2 text-right"><div className="h-4 bg-gray-200 rounded w-24 ml-auto"></div></td>
              <td className="px-4 py-2 text-right"><div className="h-4 bg-gray-200 rounded w-24 ml-auto"></div></td>
              <td className="px-4 py-2 text-right"><div className="h-4 bg-gray-200 rounded w-24 ml-auto"></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LeaderboardTable({ timeframe }: LeaderboardTableProps) {
  const [sortBy, setSortBy] = useState<SortBy>('winnings');
  const { entries, loading, error } = useLeaderboard(timeframe, sortBy);

  if (loading) return <LeaderboardSkeleton />;
  if (error) return (
    <div className="p-4 text-red-500 bg-red-50 rounded">
      Error: {error.message}
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setSortBy('winnings')}
          className={`px-4 py-2 rounded transition-colors ${
            sortBy === 'winnings' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          By Winnings
        </button>
        <button
          onClick={() => setSortBy('profitLoss')}
          className={`px-4 py-2 rounded transition-colors ${
            sortBy === 'profitLoss' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          By Profit/Loss
        </button>
        <button
          onClick={() => setSortBy('volume')}
          className={`px-4 py-2 rounded transition-colors ${
            sortBy === 'volume' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          By Volume
        </button>
        <button
          onClick={() => setSortBy('winRate')}
          className={`px-4 py-2 rounded transition-colors ${
            sortBy === 'winRate' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          By Win Rate
        </button>
      </div>

      <table className="min-w-full table-auto">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left">Rank</th>
            <th className="px-4 py-2 text-left">Address</th>
            <th className="px-4 py-2 text-right">Total Bets</th>
            <th className="px-4 py-2 text-right">Win Rate</th>
            <th className="px-4 py-2 text-right">Volume</th>
            <th className="px-4 py-2 text-right">Winnings</th>
            <th className="px-4 py-2 text-right">Losses</th>
            <th className="px-4 py-2 text-right">Profit/Loss</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr key={entry.address} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-4 py-2">{index + 1}</td>
              <td className="px-4 py-2">{shortenAddress(entry.address)}</td>
              <td className="px-4 py-2 text-right">{entry.totalBets}</td>
              <td className="px-4 py-2 text-right">{entry.winRate.toFixed(1)}%</td>
              <td className="px-4 py-2 text-right">{formatEther(entry.volume)} AVAX</td>
              <td className="px-4 py-2 text-right text-green-600">
                +{formatEther(entry.totalWinnings)} AVAX
              </td>
              <td className="px-4 py-2 text-right text-red-600">
                -{formatEther(entry.totalLost)} AVAX
              </td>
              <td className={`px-4 py-2 text-right ${BigInt(entry.profitLoss) >= 0n ? 'text-green-600' : 'text-red-600'}`}>
                {BigInt(entry.profitLoss) >= 0n ? '+' : ''}{formatEther(entry.profitLoss)} AVAX
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
