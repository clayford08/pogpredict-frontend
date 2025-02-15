import { useCallback } from 'react';
import { database } from '@/lib/firebase';
import { ref, get, set } from 'firebase/database';
import { useContract } from './useContract';
import { useAccount } from 'wagmi';

interface PlaceBetParams {
  marketId: string;
  amount: string;
  isOptionA: boolean;
}

export function usePlaceBet() {
  const { address } = useAccount();
  const { getContract } = useContract();

  const placeBet = useCallback(async ({ marketId, amount, isOptionA }: PlaceBetParams) => {
    if (!address) return;

    // Update stats before transaction
    const statsRef = ref(database, `stats/${address.toLowerCase()}`);
    const snapshot = await get(statsRef);
    const currentStats = snapshot.val() || {
      totalBets: 0,
      wins: 0,
      losses: 0,
      totalWinnings: '0',
      totalLost: '0',
      totalStaked: '0',
      lastActiveTimestamp: '0'
    };

    // Update stats
    const newStats = {
      ...currentStats,
      totalBets: currentStats.totalBets + 1,
      totalStaked: (BigInt(currentStats.totalStaked) + BigInt(amount)).toString(),
      lastActiveTimestamp: Math.floor(Date.now() / 1000).toString()
    };

    // Save active bet
    const betRef = ref(database, `activeBets/${address.toLowerCase()}/${marketId}`);
    const bet = {
      amount,
      isOptionA,
      timestamp: Math.floor(Date.now() / 1000)
    };

    // Log activity
    const activityRef = ref(database, `activity/${address.toLowerCase()}/${Date.now()}`);
    const activity = {
      type: 'bet',
      marketId,
      amount,
      isOptionA,
      timestamp: Math.floor(Date.now() / 1000)
    };

    try {
      // Update Firebase
      await Promise.all([
        set(statsRef, newStats),
        set(betRef, bet),
        set(activityRef, activity)
      ]);

      // Execute contract transaction
      const contract = await getContract();
      if (!contract) throw new Error('Contract not initialized');

      const tx = await contract.buyOption(marketId, isOptionA ? 1 : 2, { value: amount });
      await tx.wait();

      return tx;
    } catch (error) {
      console.error('Error placing bet:', error);
      // Revert Firebase changes on error
      await Promise.all([
        set(statsRef, currentStats),
        set(betRef, null),
        set(activityRef, null)
      ]);
      throw error;
    }
  }, [address, getContract]);

  return { placeBet };
} 