import { useCallback } from 'react';
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

    try {
      const contract = await getContract();
      if (!contract) throw new Error('Contract not initialized');

      const tx = await contract.buyOption(marketId, isOptionA ? 1 : 2, { value: amount });
      await tx.wait();

      return tx;
    } catch (error) {
      console.error('Error placing bet:', error);
      throw error;
    }
  }, [address, getContract]);

  return { placeBet };
}
