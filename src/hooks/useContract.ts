import { useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { config } from '@/config';
import { database } from '@/lib/firebase';
import { ref, set, get } from 'firebase/database';
import { useWeb3 } from '@/components/Web3Provider';
import { db } from '@/firebase/config';
import { doc, writeBatch, increment } from 'firebase/firestore';

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

async function updateUserStats(
  address: string, 
  updates: {
    wins?: number;
    losses?: number;
    totalETHWon?: string;
    totalLost?: string;
    lifetimeETHStaked?: string;
    activeETHStaked?: string;
    marketsParticipated?: number;
    largestWin?: string;
    largestLoss?: string;
  }
) {
  const userRef = ref(database, `leaderboard/${address.toLowerCase()}`);
  const realtimeSnapshot = await get(userRef);
  const currentStats = realtimeSnapshot.val() || {
    marketsParticipated: '0',
    wins: '0',
    losses: '0',
    totalETHWon: '0',
    lifetimeETHStaked: '0',
    activeETHStaked: '0',
    lastActiveTimestamp: '0',
    currentStreak: '0',
    bestStreak: '0',
    largestWin: '0',
    largestLoss: '0',
    totalROI: '0'
  };

  // Update stats
  const newStats = { ...currentStats };
  if (updates.wins) {
    newStats.wins = (Number(currentStats.wins) + updates.wins).toString();
    // Update streak
    const newCurrentStreak = Number(currentStats.currentStreak) + 1;
    newStats.currentStreak = newCurrentStreak.toString();
    newStats.bestStreak = Math.max(newCurrentStreak, Number(currentStats.bestStreak)).toString();
  }
  if (updates.losses) {
    newStats.losses = (Number(currentStats.losses) + updates.losses).toString();
    newStats.currentStreak = '0'; // Reset streak on loss
  }
  if (updates.totalETHWon) {
    newStats.totalETHWon = (BigInt(currentStats.totalETHWon) + BigInt(updates.totalETHWon)).toString();
    // Update largest win if applicable
    if (BigInt(updates.totalETHWon) > BigInt(currentStats.largestWin || '0')) {
      newStats.largestWin = updates.totalETHWon;
    }
  }
  if (updates.totalLost) {
    newStats.totalLost = (BigInt(currentStats.totalLost || '0') + BigInt(updates.totalLost)).toString();
    // Update largest loss if applicable
    if (BigInt(updates.totalLost) > BigInt(currentStats.largestLoss || '0')) {
      newStats.largestLoss = updates.totalLost;
    }
  }
  if (updates.lifetimeETHStaked) {
    newStats.lifetimeETHStaked = (BigInt(currentStats.lifetimeETHStaked) + BigInt(updates.lifetimeETHStaked)).toString();
  }
  if (updates.activeETHStaked) {
    newStats.activeETHStaked = (BigInt(currentStats.activeETHStaked) + BigInt(updates.activeETHStaked)).toString();
  }
  if (updates.marketsParticipated) {
    newStats.marketsParticipated = (Number(currentStats.marketsParticipated) + updates.marketsParticipated).toString();
  }

  // Calculate ROI
  const totalStaked = BigInt(newStats.lifetimeETHStaked);
  const netProfit = BigInt(newStats.totalETHWon) - BigInt(newStats.totalLost || '0');
  newStats.totalROI = totalStaked > 0n 
    ? (Number((netProfit * 10000n / totalStaked)) / 100).toString()
    : '0';

  // Update last active timestamp
  newStats.lastActiveTimestamp = Math.floor(Date.now() / 1000).toString();

  await set(userRef, newStats);
}

async function processTransactionReceipt(receipt: ethers.ContractTransactionReceipt, address: string) {
  // Process OptionBought events
  const optionBoughtEvents = receipt.logs
    .filter(log => log.topics[0] === ethers.id("OptionBought(address,uint256,bool,uint256,uint256)"))
    .map(log => {
      const [user, marketId, isOptionA, amount, timestamp] = ethers.AbiCoder.defaultAbiCoder().decode(
        ['address', 'uint256', 'bool', 'uint256', 'uint256'],
        ethers.concat([
          ethers.zeroPadValue(log.topics[1] || '0x', 32),
          ethers.zeroPadValue(log.topics[2] || '0x', 32),
          log.data
        ])
      );
      return { user, marketId, isOptionA, amount };
    })
    .filter(event => event.user.toLowerCase() === address.toLowerCase());

  // Process UserWon events
  const userWonEvents = receipt.logs
    .filter(log => log.topics[0] === ethers.id("UserWon(address,uint256,uint256)"))
    .map(log => {
      const [user, marketId, amount] = ethers.AbiCoder.defaultAbiCoder().decode(
        ['address', 'uint256', 'uint256'],
        ethers.concat([
          ethers.zeroPadValue(log.topics[1] || '0x', 32),
          log.data
        ])
      );
      return { user, marketId, amount };
    })
    .filter(event => event.user.toLowerCase() === address.toLowerCase());

  // Process UserLost events
  const userLostEvents = receipt.logs
    .filter(log => log.topics[0] === ethers.id("UserLost(address,uint256,uint256)"))
    .map(log => {
      const [user, marketId, amount] = ethers.AbiCoder.defaultAbiCoder().decode(
        ['address', 'uint256', 'uint256'],
        ethers.concat([
          ethers.zeroPadValue(log.topics[1] || '0x', 32),
          log.data
        ])
      );
      return { user, marketId, amount };
    })
    .filter(event => event.user.toLowerCase() === address.toLowerCase());

  // Process WinningsClaimed events
  const winningsClaimedEvents = receipt.logs
    .filter(log => log.topics[0] === ethers.id("WinningsClaimed(address,uint256,uint256,uint256)"))
    .map(log => {
      const [user, marketId, payout, timestamp] = ethers.AbiCoder.defaultAbiCoder().decode(
        ['address', 'uint256', 'uint256', 'uint256'],
        ethers.concat([
          ethers.zeroPadValue(log.topics[1] || '0x', 32),
          log.data
        ])
      );
      return { user, payout };
    })
    .filter(event => event.user.toLowerCase() === address.toLowerCase());

  // Update stats based on events
  for (const event of optionBoughtEvents) {
    await updateUserStats(address, {
      marketsParticipated: 1,
      lifetimeETHStaked: event.amount.toString(),
      activeETHStaked: event.amount.toString()
    });

    // Add activity
    const activityRef = ref(database, `activity/${address.toLowerCase()}/${Date.now()}`);
    await set(activityRef, {
      type: 'bet',
      marketId: event.marketId,
      amount: event.amount.toString(),
      timestamp: Math.floor(Date.now() / 1000),
      txHash: receipt.hash,
      isOptionA: event.isOptionA
    });
  }

  // If there are won events, update wins
  if (userWonEvents.length > 0) {
    for (const event of userWonEvents) {
      await updateUserStats(address, {
        wins: 1,
        totalETHWon: event.amount.toString(),
        largestWin: event.amount.toString()
      });
    }
  }

  // If there are lost events, update losses
  if (userLostEvents.length > 0) {
    for (const event of userLostEvents) {
      await updateUserStats(address, {
        losses: 1,
        totalLost: event.amount.toString(),
        largestLoss: event.amount.toString()
      });
    }
  }

  // If there are no won events but there are lost events, increment losses
  if (userWonEvents.length === 0 && userLostEvents.length > 0) {
    await updateUserStats(address, {
      losses: 1
    });
  }

  for (const event of winningsClaimedEvents) {
    await updateUserStats(address, {
      totalETHWon: event.payout.toString(),
      largestWin: event.payout.toString()
    });

    // Add activity
    const activityRef = ref(database, `activity/${address.toLowerCase()}/${Date.now()}`);
    await set(activityRef, {
      type: 'claim',
      amount: event.payout.toString(),
      timestamp: Math.floor(Date.now() / 1000),
      txHash: receipt.hash
    });
  }
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
    
    // Update stats before transaction
    const statsRef = ref(database, `stats/${account.toLowerCase()}`);
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

    // Update total staked
    const newStats = {
      ...currentStats,
      totalBets: currentStats.totalBets + 1,
      totalStaked: (BigInt(currentStats.totalStaked) + options.value).toString(),
      lastActiveTimestamp: Math.floor(Date.now() / 1000).toString()
    };
    await set(statsRef, newStats);

    // Add to active bets
    const betRef = ref(database, `activeBets/${account.toLowerCase()}/${marketId}`);
    await set(betRef, {
      isOptionA,
      amount: options.value.toString(),
      timestamp: Math.floor(Date.now() / 1000)
    });

    // Execute transaction
    const tx = await contract.buyOption(marketId, isOptionA, options);
    console.log('Transaction sent:', tx.hash);
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const receipt = await provider.waitForTransaction(tx.hash);
    if (!receipt) throw new Error('Transaction failed');

    // Add to activity feed
    const activityRef = ref(database, `activity/${account.toLowerCase()}/${Date.now()}`);
    await set(activityRef, {
      type: 'bet',
      marketId,
      isOptionA,
      amount: options.value.toString(),
      timestamp: Math.floor(Date.now() / 1000),
      txHash: receipt.hash
    });

    return receipt;
  }, [getContract, account]);

  const claimWinnings = useCallback(async (marketId: number) => {
    const contract = await getContract();
    if (!contract || !account) throw new Error('No contract available');

    const tx = await contract.claimWinnings(marketId);
    
    // In ethers v6, we need to use provider.waitForTransaction instead of tx.wait()
    const provider = new ethers.BrowserProvider(window.ethereum);
    const receipt = await provider.waitForTransaction(tx.hash);
    if (!receipt) throw new Error('Transaction failed');

    // Process events from receipt
    if ('logs' in receipt) {
      await processTransactionReceipt(receipt as ethers.ContractTransactionReceipt, account);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    return receipt;
  }, [getContract, account]);

  const claimRefund = useCallback(async (marketId: number) => {
    const contract = await getContract();
    if (!contract || !account) throw new Error('No contract available');
    
    const tx = await contract.claimRefund(marketId);
    
    // In ethers v6, we need to use provider.waitForTransaction instead of tx.wait()
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

      // Process events from receipt
      if ('logs' in receipt) {
        await processTransactionReceipt(receipt as ethers.ContractTransactionReceipt, account);
      }

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
