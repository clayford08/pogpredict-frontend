'use client';

import { UserStats } from '@/hooks/useUserProfile';
import { formatEther } from '@/lib/utils';

interface OverallStatsProps {
  stats: UserStats;
}

export default function OverallStats({ stats }: OverallStatsProps) {
  const winRate = stats.totalBets > 0
    ? (stats.wins / stats.totalBets * 100).toFixed(1)
    : '0.0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="cyber-card hover:scale-[1.02] transition-all duration-300">
        <div className="text-sm text-gray-400">Total Won</div>
        <div className="text-2xl font-bold text-pog-orange glow-text">
          {formatEther(stats.totalWinnings)} AVAX
        </div>
        <div className="text-sm text-gray-400 mt-2">
          Largest Win: {formatEther(stats.largestWin)} AVAX
        </div>
      </div>

      <div className="cyber-card hover:scale-[1.02] transition-all duration-300">
        <div className="text-sm text-gray-400">Total Staked</div>
        <div className="text-2xl font-bold text-pog-orange glow-text">
          {formatEther(stats.totalStaked)} AVAX
        </div>
        <div className="text-sm text-gray-400 mt-2">
          ROI: {stats.totalROI.toFixed(2)}%
        </div>
      </div>

      <div className="cyber-card hover:scale-[1.02] transition-all duration-300">
        <div className="text-sm text-gray-400">Win Rate</div>
        <div className="text-2xl font-bold text-pog-orange glow-text">
          {winRate}%
        </div>
        <div className="text-sm text-gray-400 mt-2">
          {stats.wins}W - {stats.losses}L
        </div>
      </div>
    </div>
  );
} 