import { useCallback } from 'react';
import { ethers } from 'ethers';
import { contracts } from '@/config/contracts';

export interface ReferralStats {
  totalEarnings: bigint;
  referralCount: bigint;
  feeShare: bigint | null;
  referralCode: string;
  hasReferrer: boolean;
  referrer: string;
}

export function useReferral() {
  const getContract = useCallback(async () => {
    if (!window.ethereum) return null;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(
      contracts.Referral.address,
      contracts.Referral.abi,
      signer
    );
  }, []);

  const getReferralStats = useCallback(async (address: string): Promise<ReferralStats> => {
    const contract = await getContract();
    if (!contract) throw new Error('No contract available');
    
    try {
      const [
        totalEarnings,
        referralCount,
        feeShare,
        referralCode,
        referrer
      ] = await Promise.all([
        contract.referralEarnings(address),
        contract.referralCount(address),
        contract.getReferralFeeShare(address).catch(() => null),
        contract.addressToReferralCode(address),
        contract.userReferrer(address)
      ]);

      return {
        totalEarnings,
        referralCount,
        feeShare,
        referralCode,
        hasReferrer: referrer !== ethers.ZeroAddress,
        referrer
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      throw error;
    }
  }, [getContract]);

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

  const setBaseReferralFeeShare = useCallback(async (feeShare: string | number) => {
    const contract = await getContract();
    if (!contract) throw new Error('No contract available');
    try {
      const feeShareValue = typeof feeShare === 'string' 
        ? Math.floor(parseFloat(feeShare) * 100)
        : Math.floor(feeShare * 100);
      const tx = await contract.setBaseReferralFeeShare(feeShareValue);
      return tx.wait();
    } catch (error) {
      console.error('Error setting base referral fee share:', error);
      throw error;
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

  const setCustomReferralFeeShare = useCallback(async (userAddress: string, feeShare: string | number) => {
    const contract = await getContract();
    if (!contract) throw new Error('No contract available');
    try {
      const feeShareValue = typeof feeShare === 'string'
        ? Math.floor(parseFloat(feeShare) * 100)
        : Math.floor(feeShare * 100);
      const tx = await contract.setCustomReferralFeeShare(userAddress, feeShareValue);
      return tx.wait();
    } catch (error) {
      console.error('Error setting custom referral fee share:', error);
      throw error;
    }
  }, [getContract]);

  return {
    getContract,
    getReferralStats,
    getReferralCode,
    getReferralEarnings,
    getReferralCount,
    setReferralCode,
    setReferrer,
    isValidReferrer,
    getReferralFeeShare,
    setBaseReferralFeeShare,
    setCustomReferralFeeShare,
    hasReferrerSet
  };
} 