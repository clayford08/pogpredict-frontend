'use client';

import { UserStats } from '@/hooks/useUserProfile';
import { formatEther } from '@/lib/utils';

export interface MonthlyStatsProps {
  stats: UserStats;
}

export default function MonthlyStats({ stats }: MonthlyStatsProps) {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="cyber-card">
        <div className="text-sm text-gray-400">Monthly Wins/Losses</div>
        <div className="text-xl font-bold">
          {stats.monthlyStats.wins[currentMonth] || 0}W - {stats.monthlyStats.losses[currentMonth] || 0}L
        </div>
      </div>

      <div className="cyber-card">
        <div className="text-sm text-gray-400">Monthly Winnings</div>
        <div className="text-xl font-bold text-pog-orange">
          {formatEther(stats.monthlyStats.winnings[currentMonth] || '0')} AVAX
        </div>
      </div>

      <div className="cyber-card">
        <div className="text-sm text-gray-400">Monthly Staked</div>
        <div className="text-xl font-bold">
          {formatEther(stats.monthlyStats.staked[currentMonth] || '0')} AVAX
        </div>
      </div>
    </div>
  );
} 