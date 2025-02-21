'use client';

import { UserStats } from '@/types/profile';
import { formatAVAX } from '@/lib/utils';

interface OverallStatsProps {
  stats: UserStats;
}

export default function OverallStats({ stats }: OverallStatsProps) {
  const winRate = stats.wins + stats.losses > 0
    ? (stats.wins / (stats.wins + stats.losses) * 100).toFixed(1)
    : '0.0';

  // Find the largest prediction amount
  const largestPrediction = Math.max(
    parseFloat(stats.largestWin),
    parseFloat(stats.largestLoss)
  ).toFixed(2);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="cyber-card hover:scale-[1.02] transition-all duration-300">
        <div className="text-sm text-gray-400">Total Won</div>
        <div className="text-2xl font-bold text-pog-orange glow-text">
          {formatAVAX(stats.totalAVAXWon)} AVAX
        </div>
        <div className="text-sm text-gray-400 mt-2">
          Largest Win: {formatAVAX(stats.largestWin)} AVAX
        </div>
      </div>

      <div className="cyber-card hover:scale-[1.02] transition-all duration-300">
        <div className="text-sm text-gray-400">Volume</div>
        <div className="text-2xl font-bold text-pog-orange glow-text">
          {formatAVAX(stats.lifetimeAVAXStaked)} AVAX
        </div>
        <div className="text-sm text-gray-400 mt-2">
          Largest Prediction: {largestPrediction} AVAX
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
        <div className="text-sm text-gray-400 mt-1">
          Best Streak: {stats.bestStreak}
        </div>
      </div>
    </div>
  );
}
