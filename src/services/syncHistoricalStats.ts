import { ethers } from 'ethers';
import { config } from '@/config';
import { database } from '@/lib/firebase';
import { ref, set, get } from 'firebase/database';

interface UserStats {
  totalBets: number;
  wins: number;
  losses: number;
  totalWinnings: string;
  totalLost: string;
  totalStaked: string;
  lastActiveTimestamp: string;
}

export async function syncHistoricalStats(startBlock: number = 0) {
  console.log('Starting historical events sync...');
  
  // Connect to provider
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_AVALANCHE_RPC);
  
  // Create contract instance
  const contract = new ethers.Contract(
    config.contracts.PogPredict.address,
    config.contracts.PogPredict.abi,
    provider
  );

  // Get latest block
  const latestBlock = await provider.getBlockNumber();
  console.log(`Scanning from block ${startBlock} to ${latestBlock}`);

  // Event filters
  const optionBoughtFilter = contract.filters.OptionBought();
  const userWonFilter = contract.filters.UserWon();
  const userLostFilter = contract.filters.UserLost();
  const winningsClaimedFilter = contract.filters.WinningsClaimed();

  // Track stats for each user
  const userStats: { [address: string]: UserStats } = {};

  // Fetch events in chunks to avoid RPC limitations
  const CHUNK_SIZE = 2000;
  const chunks = [];
  for (let i = startBlock; i < latestBlock; i += CHUNK_SIZE) {
    chunks.push({
      fromBlock: i,
      toBlock: Math.min(i + CHUNK_SIZE - 1, latestBlock)
    });
  }

  // Process each chunk
  for (const chunk of chunks) {
    console.log(`Processing blocks ${chunk.fromBlock} to ${chunk.toBlock}...`);

    // Fetch all events in parallel
    const [optionBoughtEvents, userWonEvents, userLostEvents, winningsClaimedEvents] = await Promise.all([
      contract.queryFilter(optionBoughtFilter, chunk.fromBlock, chunk.toBlock),
      contract.queryFilter(userWonFilter, chunk.fromBlock, chunk.toBlock),
      contract.queryFilter(userLostFilter, chunk.fromBlock, chunk.toBlock),
      contract.queryFilter(winningsClaimedFilter, chunk.fromBlock, chunk.toBlock)
    ]);

    // Process OptionBought events
    for (const event of optionBoughtEvents) {
      const [user, marketId, isOptionA, amount, timestamp] = event.args || [];
      const address = user.toLowerCase();
      
      if (!userStats[address]) {
        userStats[address] = {
          totalBets: 0,
          wins: 0,
          losses: 0,
          totalWinnings: '0',
          totalLost: '0',
          totalStaked: '0',
          lastActiveTimestamp: '0'
        };
      }

      userStats[address].totalBets++;
      userStats[address].totalStaked = (BigInt(userStats[address].totalStaked) + BigInt(amount)).toString();
      userStats[address].lastActiveTimestamp = Math.max(
        Number(userStats[address].lastActiveTimestamp),
        Number(timestamp)
      ).toString();

      // Store raw event for activity feed
      const eventRef = ref(database, `events/${address}/bets/${event.transactionHash}`);
      await set(eventRef, {
        type: 'bet',
        marketId: marketId.toString(),
        isOptionA,
        amount: amount.toString(),
        timestamp: timestamp.toString(),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash
      });
    }

    // Process UserWon events
    for (const event of userWonEvents) {
      const [user, marketId, amount] = event.args || [];
      const address = user.toLowerCase();

      if (!userStats[address]) continue;

      userStats[address].wins++;
      userStats[address].totalWinnings = (BigInt(userStats[address].totalWinnings) + BigInt(amount)).toString();
    }

    // Process UserLost events
    for (const event of userLostEvents) {
      const [user, marketId, amount] = event.args || [];
      const address = user.toLowerCase();

      if (!userStats[address]) continue;

      userStats[address].losses++;
      userStats[address].totalLost = (BigInt(userStats[address].totalLost) + BigInt(amount)).toString();
    }

    // Process WinningsClaimed events
    for (const event of winningsClaimedEvents) {
      const [user, marketId, payout, timestamp] = event.args || [];
      const address = user.toLowerCase();

      if (!userStats[address]) continue;

      userStats[address].lastActiveTimestamp = Math.max(
        Number(userStats[address].lastActiveTimestamp),
        Number(timestamp)
      ).toString();

      // Store raw event for activity feed
      const eventRef = ref(database, `events/${address}/claims/${event.transactionHash}`);
      await set(eventRef, {
        type: 'claim',
        marketId: marketId.toString(),
        amount: payout.toString(),
        timestamp: timestamp.toString(),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash
      });
    }
  }

  // Update aggregated stats
  console.log('Updating aggregated stats...');
  for (const [address, stats] of Object.entries(userStats)) {
    const statsRef = ref(database, `stats/${address}`);
    await set(statsRef, stats);
  }

  console.log('Historical sync completed!');
  return {
    processedBlocks: latestBlock - startBlock,
    processedUsers: Object.keys(userStats).length
  };
} 