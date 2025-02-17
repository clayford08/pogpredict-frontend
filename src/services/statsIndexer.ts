import { db } from '../firebase/config';
import { database } from '@/lib/firebase';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '@/config/networks';
import { config } from '@/config';
import { ref, set, get, Database } from 'firebase/database';

enum MarketOutcome {
    UNRESOLVED = 0,
    OPTION_A = 1,
    OPTION_B = 2
}

export class StatsIndexer {
  private contract: ethers.Contract;
  private provider: ethers.JsonRpcProvider;
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 1000; // 1 second
  private readonly database: Database;

  constructor(rpcUrl: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESSES.PogPredict,
      config.contracts.PogPredict.abi,
      this.provider
    );
    this.database = database;
  }

  private async retryOperation(operation: () => Promise<any>) {
    let lastError;
    for (let i = 0; i < this.MAX_RETRY_ATTEMPTS; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
      }
    }
    throw lastError;
  }

  async startListening() {
    // Listen for new bets
    this.contract.on('OptionBought', async (user, marketId, isOptionA, ethAmount, timestamp) => {
      try {
        const userRef = ref(this.database, `stats/${user.toLowerCase()}`);
        const safeEthAmount = ethAmount.toString();

        // Get current stats
        const realtimeSnapshot = await get(userRef);
        const currentStats = realtimeSnapshot.val() || {
          totalBets: 0,
          wins: 0,
          losses: 0,
          totalWinnings: '0',
          totalLost: '0',
          totalStaked: '0',
          lastActiveTimestamp: '0',
          currentStreak: 0,
          bestStreak: 0,
          largestWin: '0',
          largestLoss: '0',
          totalROI: 0
        };

        // Update stats
        await set(userRef, {
          ...currentStats,
          totalBets: currentStats.totalBets + 1,
          totalStaked: (BigInt(currentStats.totalStaked) + BigInt(safeEthAmount)).toString(),
          lastActiveTimestamp: timestamp.toString()
        });

        // Add activity
        const activityRef = ref(this.database, `activity/${user.toLowerCase()}/${Date.now()}`);
        await set(activityRef, {
          type: 'bet',
          marketId: marketId.toString(),
          amount: safeEthAmount,
          timestamp: timestamp.toString(),
          isOptionA
        });
      } catch (error) {
        console.error('Error processing OptionBought event:', error);
      }
    });

    // Listen for user wins
    this.contract.on('UserWon', async (user, marketId, amount) => {
      try {
        const userRef = ref(this.database, `stats/${user.toLowerCase()}`);
        const safeAmount = amount.toString();

        // Get current stats
        const realtimeSnapshot = await get(userRef);
        const currentStats = realtimeSnapshot.val() || {
          totalBets: 0,
          wins: 0,
          losses: 0,
          totalWinnings: '0',
          totalLost: '0',
          totalStaked: '0',
          lastActiveTimestamp: '0',
          currentStreak: 0,
          bestStreak: 0,
          largestWin: '0',
          largestLoss: '0',
          totalROI: 0
        };

        // Update streak
        const newCurrentStreak = currentStats.currentStreak + 1;
        const newBestStreak = Math.max(newCurrentStreak, currentStats.bestStreak);

        // Update largest win if applicable
        const newLargestWin = BigInt(safeAmount) > BigInt(currentStats.largestWin || '0') 
          ? safeAmount 
          : currentStats.largestWin;

        // Calculate new ROI
        const totalStaked = BigInt(currentStats.totalStaked);
        const totalLost = BigInt(currentStats.totalLost || '0');
        const newTotalWon = BigInt(currentStats.totalWinnings) + BigInt(safeAmount);
        const netProfit = newTotalWon - totalLost;
        const newTotalROI = totalStaked > 0n 
          ? (Number((netProfit * 10000n / totalStaked)) / 100)
          : 0;

        await set(userRef, {
          ...currentStats,
          wins: currentStats.wins + 1,
          totalWinnings: newTotalWon.toString(),
          currentStreak: newCurrentStreak,
          bestStreak: newBestStreak,
          largestWin: newLargestWin,
          totalROI: newTotalROI
        });

        // Add activity
        const activityRef = ref(this.database, `activity/${user.toLowerCase()}/${Date.now()}`);
        await set(activityRef, {
          type: 'win',
          marketId: marketId.toString(),
          amount: safeAmount,
          timestamp: Math.floor(Date.now() / 1000).toString()
        });
      } catch (error) {
        console.error('Error processing UserWon event:', error);
      }
    });

    // Listen for user losses
    this.contract.on('UserLost', async (user, marketId, amount) => {
      try {
        const userRef = ref(this.database, `stats/${user.toLowerCase()}`);
        const safeAmount = amount.toString();

        // Get current stats
        const realtimeSnapshot = await get(userRef);
        const currentStats = realtimeSnapshot.val() || {
          totalBets: 0,
          wins: 0,
          losses: 0,
          totalWinnings: '0',
          totalLost: '0',
          totalStaked: '0',
          lastActiveTimestamp: '0',
          currentStreak: 0,
          bestStreak: 0,
          largestWin: '0',
          largestLoss: '0',
          totalROI: 0
        };

        // Update largest loss if applicable
        const newLargestLoss = BigInt(safeAmount) > BigInt(currentStats.largestLoss || '0') 
          ? safeAmount 
          : currentStats.largestLoss;

        // Calculate new ROI
        const totalStaked = BigInt(currentStats.totalStaked);
        const newTotalLost = BigInt(currentStats.totalLost || '0') + BigInt(safeAmount);
        const netProfit = BigInt(currentStats.totalWinnings) - newTotalLost;
        const newTotalROI = totalStaked > 0n 
          ? (Number((netProfit * 10000n / totalStaked)) / 100)
          : 0;

        await set(userRef, {
          ...currentStats,
          losses: currentStats.losses + 1,
          totalLost: newTotalLost.toString(),
          largestLoss: newLargestLoss,
          currentStreak: 0, // Reset streak on loss
          totalROI: newTotalROI
        });

        // Add activity
        const activityRef = ref(this.database, `activity/${user.toLowerCase()}/${Date.now()}`);
        await set(activityRef, {
          type: 'loss',
          marketId: marketId.toString(),
          amount: safeAmount,
          timestamp: Math.floor(Date.now() / 1000).toString()
        });
      } catch (error) {
        console.error('Error processing UserLost event:', error);
      }
    });

    // Listen for winnings claims
    this.contract.on('WinningsClaimed', async (user, marketId, payout, timestamp) => {
      try {
        if (payout === 0n) return; // Skip if no payout
        
        const userRef = ref(this.database, `stats/${user.toLowerCase()}`);
        const safePayout = payout.toString();
        
        // Get current stats
        const realtimeSnapshot = await get(userRef);
        const currentStats = realtimeSnapshot.val() || {
          totalBets: 0,
          wins: 0,
          losses: 0,
          totalWinnings: '0',
          totalLost: '0',
          totalStaked: '0',
          lastActiveTimestamp: '0',
          currentStreak: 0,
          bestStreak: 0,
          largestWin: '0',
          largestLoss: '0',
          totalROI: 0
        };

        // Update total winnings and largest win if applicable
        const newTotalWinnings = (BigInt(currentStats.totalWinnings) + BigInt(safePayout)).toString();
        const newLargestWin = BigInt(safePayout) > BigInt(currentStats.largestWin || '0') 
          ? safePayout 
          : currentStats.largestWin;

        // Calculate new ROI
        const totalStaked = BigInt(currentStats.totalStaked);
        const totalLost = BigInt(currentStats.totalLost || '0');
        const netProfit = BigInt(newTotalWinnings) - totalLost;
        const newTotalROI = totalStaked > 0n 
          ? (Number((netProfit * 10000n / totalStaked)) / 100)
          : 0;

        await set(userRef, {
          ...currentStats,
          totalWinnings: newTotalWinnings,
          largestWin: newLargestWin,
          totalROI: newTotalROI.toString(),
          lastActiveTimestamp: timestamp.toString()
        });

        // Add activity
        const activityRef = ref(this.database, `activity/${user.toLowerCase()}/${Date.now()}`);
        await set(activityRef, {
          type: 'claim',
          marketId: marketId.toString(),
          amount: safePayout,
          timestamp: timestamp.toString()
        });
      } catch (error) {
        console.error('Error processing WinningsClaimed event:', error);
      }
    });
  }
} 