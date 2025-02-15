import { useCallback } from 'react';
import { ethers } from 'ethers';
import { config } from '@/config';

export function useReferral() {
  const getContract = useCallback(async () => {
    if (!window.ethereum) return null;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(
      config.contracts.Referral.address,
      config.contracts.Referral.abi,
      signer
    );
  }, []);

  const getReferralCode = useCallback(async (address: string): Promise<string> => {
    const contract = await getContract();
    if (!contract) throw new Error('No contract available');
    try {
      return await contract.addressToReferralCode(address);
    } catch (error) {
      console.error('Error getting referral code:', error);
      return '';
    }
  }, [getContract]);

  const getReferralEarnings = useCallback(async (address: string): Promise<bigint> => {
    const contract = await getContract();
    if (!contract) throw new Error('No contract available');
    try {
      return await contract.referralEarnings(address);
    } catch (error) {
      console.error('Error getting referral earnings:', error);
      return BigInt(0);
    }
  }, [getContract]);

  const getReferralCount = useCallback(async (address: string): Promise<bigint> => {
    const contract = await getContract();
    if (!contract) throw new Error('No contract available');
    try {
      return await contract.referralCount(address);
    } catch (error) {
      console.error('Error getting referral count:', error);
      return BigInt(0);
    }
  }, [getContract]);

  const setReferralCode = useCallback(async (code: string) => {
    const contract = await getContract();
    if (!contract) throw new Error('No contract available');
    try {
      const tx = await contract.setReferralCode(code);
      return tx.wait();
    } catch (error) {
      console.error('Error setting referral code:', error);
      throw error;
    }
  }, [getContract]);

  const setReferrer = useCallback(async (referralCode: string) => {
    const contract = await getContract();
    if (!contract) throw new Error('No contract available');
    try {
      const tx = await contract.setReferrer(referralCode);
      return tx.wait();
    } catch (error) {
      console.error('Error setting referrer:', error);
      throw error;
    }
  }, [getContract]);

  const isValidReferrer = useCallback(async (address: string): Promise<boolean> => {
    const contract = await getContract();
    if (!contract) throw new Error('No contract available');
    try {
      return await contract.isValidReferrer(address);
    } catch (error) {
      console.error('Error checking if valid referrer:', error);
      return false;
    }
  }, [getContract]);

  const getReferralFeeShare = useCallback(async (address: string): Promise<bigint> => {
    const contract = await getContract();
    if (!contract) throw new Error('No contract available');
    try {
      return await contract.getReferralFeeShare(address);
    } catch (error) {
      console.error('Error getting referral fee share:', error);
      return BigInt(0);
    }
  }, [getContract]);

  const hasReferrerSet = useCallback(async (address: string): Promise<boolean> => {
    const contract = await getContract();
    if (!contract) throw new Error('No contract available');
    try {
      const referrer = await contract.userReferrer(address);
      return referrer !== ethers.ZeroAddress;
    } catch (error) {
      console.error('Error checking if referrer is set:', error);
      return false;
    }
  }, [getContract]);

  return {
    getContract,
    getReferralCode,
    getReferralEarnings,
    getReferralCount,
    setReferralCode,
    setReferrer,
    isValidReferrer,
    getReferralFeeShare,
    hasReferrerSet
  };
} 