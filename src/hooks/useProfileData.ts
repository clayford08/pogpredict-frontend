import { useEffect, useState } from 'react';
import { UserStats, MarketActivity } from '@/types/profile';
import { useContract } from './useContract';
import { formatEther } from '@/lib/utils';
import { gql, useQuery } from '@apollo/client';

import { GET_USER_PROFILE } from '@/graphql/queries';

interface SubgraphBet {
  id: string;
  market: {
    id: string;
    question: string;
    optionA: string;
    optionB: string;
    outcome: string | null;
    resolvedBy: string | null;
    resolutionTimestamp: string | null;
  };
  isOptionA: boolean;
  amount: string;
  timestamp: string;
  claimed: boolean;
  winnings: string | null;
  outcome: number; // 0 = unresolved, 1 = won, 2 = lost
}

export function useProfileData(address: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getContract } = useContract();

  const { data, loading: queryLoading, error: queryError } = useQuery(GET_USER_PROFILE, {
    variables: { id: address?.toLowerCase() },
    skip: !address,
  });

  const transformBetsToActivity = (bets: SubgraphBet[]): MarketActivity[] => {
    return bets.map(bet => {
      // Determine activity type based on bet outcome and market resolution
      let type: MarketActivity['type'];
      if (!bet.market.outcome) {
        // Market not resolved yet
        type = 'buy';
      } else if (bet.outcome === 1) {
        // Bet is marked as won
        type = 'win';
      } else if (bet.outcome === 2) {
        // Bet is marked as lost
        type = 'loss';
      } else {
        // Default to 'buy' if outcome is not set
        type = 'buy';
      }

      return {
        marketId: Number(bet.market.id),
        type,
        timestamp: Number(bet.timestamp),
        amount: formatEther(bet.amount),
        txHash: bet.id.split('-')[2], // Assuming bet.id format is "marketId-userAddress-txHash"
        isOptionA: bet.isOptionA,
        selectedOption: bet.isOptionA ? bet.market.optionA : bet.market.optionB
      };
    });
  };

  const user = data?.users?.[0];
  const userStats: UserStats | null = user ? {
    marketsParticipated: Number(user.totalBets),
    wins: Number(user.wins),
    losses: Number(user.losses),
    totalAVAXWon: formatEther(user.totalWinnings),
    lifetimeAVAXStaked: formatEther(user.totalStaked),
    activeAVAXStaked: '0', // This will need to be calculated from active bets if needed
    lastActiveTimestamp: Number(user.lastActiveTimestamp),
    currentStreak: Number(user.currentStreak),
    bestStreak: Number(user.bestStreak),
    largestWin: formatEther(user.largestWin),
    largestLoss: formatEther(user.largestLoss)
  } : null;

  const activity = user ? transformBetsToActivity(user.bets) : [];

  useEffect(() => {
    setLoading(queryLoading);
    if (queryError) {
      setError(queryError.message);
    }
  }, [queryLoading, queryError]);

  return {
    userStats,
    activity,
    loading,
    error
  };
}
