import { useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { config } from '@/config';
import { useWeb3 } from '@/components/Web3Provider';

export interface ContractMarket {
  question: string;
  optionA: string;
  optionB: string;
  endTime: string;
  totalOptionA: string;
  totalOptionB: string;
  status: string;
  outcome: string;
  resolved: boolean;
  category: string;
  logoUrlA: string;
  logoUrlB: string;
}

export function useContract() {
  const { account } = useWeb3();

  const getContract = useCallback(async () => {
    if (!window.ethereum) return null;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return new ethers.Contract(
        config.contracts.PogPredict.address,
        config.contracts.PogPredict.abi,
        signer
      );
    } catch (error) {
      console.error('Error getting contract:', error);
      return null;
    }
  }, []);

  const getMarketCount = useCallback(async (): Promise<number> => {
    const contract = await getContract();
    if (!contract) return 0;
    try {
      const count = await contract.marketCount();
      return Number(count);
    } catch (error) {
      console.error('Error getting market count:', error);
      return 0;
    }
  }, [getContract]);

  const getMarket = useCallback(async (marketId: number): Promise<ContractMarket | null> => {
    try {
      const contract = await getContract();
      if (!contract) return null;

      const market = await contract.markets(marketId);
      if (!market) return null;

      return {
        question: market.question || '',
        optionA: market.optionA || '',
        optionB: market.optionB || '',
        category: market.category || '',
        logoUrlA: market.logoUrlA || '',
        logoUrlB: market.logoUrlB || '',
        endTime: market.endTime?.toString() || '0',
        outcome: market.outcome?.toString() || '0',
        status: market.status?.toString() || '0',
        resolved: market.resolved || false,
        totalOptionA: market.totalOptionA?.toString() || '0',
        totalOptionB: market.totalOptionB?.toString() || '0'
      };
    } catch (error) {
      console.error('Error fetching market:', error);
      return null;
    }
  }, [getContract]);

  const buyOption = useCallback(async (marketId: number, isOptionA: boolean, options: { value: bigint }) => {
    const contract = await getContract();
    if (!contract || !account) throw new Error('No contract available');
    
    // Execute transaction
    const tx = await contract.buyOption(marketId, isOptionA, options);
    console.log('Transaction sent:', tx.hash);
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const receipt = await provider.waitForTransaction(tx.hash);
    if (!receipt) throw new Error('Transaction failed');

    return receipt;
  }, [getContract, account]);

  const claimWinnings = useCallback(async (marketId: number) => {
    const contract = await getContract();
    if (!contract || !account) throw new Error('No contract available');

    const tx = await contract.claimWinnings(marketId);
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const receipt = await provider.waitForTransaction(tx.hash);
    if (!receipt) throw new Error('Transaction failed');

    await new Promise(resolve => setTimeout(resolve, 2000));
    return receipt;
  }, [getContract, account]);

  const claimRefund = useCallback(async (marketId: number) => {
    const contract = await getContract();
    if (!contract || !account) throw new Error('No contract available');
    
    const tx = await contract.claimRefund(marketId);
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const receipt = await provider.waitForTransaction(tx.hash);
    if (!receipt) throw new Error('Transaction failed');

    await new Promise(resolve => setTimeout(resolve, 2000));
    return receipt;
  }, [getContract, account]);

  const getUserBalances = useCallback(async (marketId: number, address: string) => {
    const contract = await getContract();
    if (!contract) return null;
    try {
      const [optionA, optionB] = await contract.getUserBalances(marketId, address);
      return { optionA, optionB };
    } catch (error) {
      console.error('Error getting user balances:', error);
      return null;
    }
  }, [getContract]);

  const getPriceImpact = useCallback(async (marketId: number, ethIn: string, isOptionA: boolean) => {
    const contract = await getContract();
    if (!contract) return null;
    try {
      return await contract.getPriceImpact(marketId, ethIn, isOptionA);
    } catch (error) {
      console.error('Error getting price impact:', error);
      return null;
    }
  }, [getContract]);

  const getRefundAmount = useCallback(async (marketId: number, address: string) => {
    const contract = await getContract();
    if (!contract) return null;
    try {
      const totalAmount = await contract.getRefundAmount(marketId, address);
      return { totalAmount };
    } catch (error) {
      console.error('Error getting refund amount:', error);
      return null;
    }
  }, [getContract]);

  const sellOption = useCallback(async (marketId: number, isOptionA: boolean, amount: bigint) => {
    const contract = await getContract();
    if (!contract || !account) throw new Error('No contract available');
    
    try {
      const tx = await contract.sellOption(marketId, isOptionA ? 1 : 2, amount);
      console.log('Sell transaction sent:', tx.hash);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const receipt = await provider.waitForTransaction(tx.hash);
      if (!receipt) throw new Error('Transaction failed');

      await new Promise(resolve => setTimeout(resolve, 2000));
      return receipt;
    } catch (error) {
      console.error('Error selling option:', error);
      throw error;
    }
  }, [getContract, account]);

  return useMemo(() => ({
    getContract,
    getMarket,
    buyOption,
    claimWinnings,
    claimRefund,
    getUserBalances,
    getPriceImpact,
    getRefundAmount,
    getMarketCount,
    sellOption
  }), [
    getContract,
    getMarket,
    buyOption,
    claimWinnings,
    claimRefund,
    getUserBalances,
    getPriceImpact,
    getRefundAmount,
    getMarketCount,
    sellOption
  ]);
}
