'use client';

import { useState } from 'react';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { TimeFrame } from '@/hooks/useLeaderboard';

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<TimeFrame>('all');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="cyber-title text-center mb-8">Leaderboard</h1>
      <div className="cyber-card">
        <LeaderboardTable timeframe={timeframe} />
      </div>
    </div>
  );
}
