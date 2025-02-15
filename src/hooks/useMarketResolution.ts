import { useCallback, useEffect } from 'react';
import { database } from '@/lib/firebase';
import { ref, get, set } from 'firebase/database';
import { useContract } from './useContract';

export function useMarketResolution() {
  const { getContract } = useContract();

  // Listen for market resolutions
  useEffect(() => {
    const listenToMarkets = async () => {
      const contract = await getContract();
      if (!contract) return;

      contract.on('MarketResolved', async (marketId, outcome, source, details, resolvedBy) => {
        console.log(`Market ${marketId} resolved with outcome ${outcome}`);
        
        // Get all active bets for this market
        const activeBetsRef = ref(database, 'activeBets');
        const snapshot = await get(activeBetsRef);
        const allActiveBets = snapshot.val() || {};

        // Process each user's active bets
        for (const [address, userBets] of Object.entries(allActiveBets)) {
          const marketBet = userBets[marketId];
          if (!marketBet) continue;

          // Get user's current stats
          const statsRef = ref(database, `stats/${address}`);
          const statsSnapshot = await get(statsRef);
          const currentStats = statsSnapshot.val() || {
            totalBets: 0,
            wins: 0,
            losses: 0,
            totalWinnings: '0',
            totalLost: '0',
            totalStaked: '0',
            lastActiveTimestamp: '0'
          };

          // Check if user won or lost
          const isWinner = (outcome === 1 && marketBet.isOptionA) || 
                          (outcome === 2 && !marketBet.isOptionA);

          // Update stats
          const newStats = { ...currentStats };
          if (isWinner) {
            newStats.wins++;
            // Calculate winnings based on market outcome
            // This would need market pool info from contract
            // For now, just tracking win/loss count
          } else {
            newStats.losses++;
            newStats.totalLost = (BigInt(currentStats.totalLost) + BigInt(marketBet.amount)).toString();
          }

          // Update user stats
          await set(statsRef, newStats);

          // Add to activity feed
          const activityRef = ref(database, `activity/${address}/${Date.now()}`);
          await set(activityRef, {
            type: isWinner ? 'win' : 'loss',
            marketId: marketId.toString(),
            amount: marketBet.amount,
            timestamp: Math.floor(Date.now() / 1000)
          });

          // Remove from active bets
          const betRef = ref(database, `activeBets/${address}/${marketId}`);
          await set(betRef, null);
        }
      });
    };

    listenToMarkets();
  }, [getContract]);
} 