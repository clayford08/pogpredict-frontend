import { useCallback } from 'react';
import { ethers } from 'ethers';
import { config } from '@/config';

export function useMarketCreation() {
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

  const createMarket = useCallback(async (
    question: string,
    optionA: string,
    optionB: string,
    category: string,
    duration: number,
    virtualA: string,
    virtualB: string,
    logoUrlA: string,
    logoUrlB: string,
    oracleMatchId: number,
    value: string
  ) => {
    const contract = await getContract();
    if (!contract) throw new Error('No contract available');

    try {
      const tx = await contract.createMarket(
        question,
        optionA,
        optionB,
        category,
        duration,
        virtualA,
        virtualB,
        logoUrlA,
        logoUrlB,
        oracleMatchId,
        { value }
      );
      return tx.wait();
    } catch (error) {
      console.error('Error creating market:', error);
      throw error;
    }
  }, [getContract]);

  const createManualMarket = useCallback(async (
    question: string,
    optionA: string,
    optionB: string,
    category: string,
    duration: number,
    virtualA: string,
    virtualB: string,
    logoUrlA: string,
    logoUrlB: string,
    value: string
  ) => {
    const contract = await getContract();
    if (!contract) throw new Error('No contract available');

    try {
      const tx = await contract.createManualMarket(
        question,
        optionA,
        optionB,
        category,
        duration,
        virtualA,
        virtualB,
        logoUrlA,
        logoUrlB,
        { value }
      );
      return tx.wait();
    } catch (error) {
      console.error('Error creating manual market:', error);
      throw error;
    }
  }, [getContract]);

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

  return {
    createMarket,
    createManualMarket,
    getMarketCount
  };
} 