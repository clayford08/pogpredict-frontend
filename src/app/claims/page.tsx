'use client';

import React, { useEffect, useState } from 'react';
import { useWeb3 } from '@/components/Web3Provider';
import { useContract } from '@/hooks/useContract';
import { formatEther } from '@/lib/utils';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_CLAIMABLE_MARKETS } from '@/graphql/queries';

interface ClaimableMarket {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  amount: bigint;
  winnings: bigint | null;
  type: 'win' | 'refund' | 'loss';
  resolutionTimestamp: number;
}

interface SuccessMessage {
  marketId: number;
  amount: string;
  timestamp: number;
  type: 'win' | 'refund';
}

interface SubgraphBet {
  id: string;
  market: {
    id: string;
    question: string;
    optionA: string;
    optionB: string;
    outcome: string;
    resolutionDetails: string;
    resolutionTimestamp: string;
    totalPoolA: string;
    totalPoolB: string;
  };
  isOptionA: boolean;
  amount: string;
  winnings: string | null;
  claimed: boolean;
  outcome: string | null; // 0 = unresolved, 1 = won, 2 = lost, 3 = refundable
}

interface SubgraphResponse {
  bets: SubgraphBet[];
}

export default function ClaimsPage() {
  const { account, connect } = useWeb3();
  const { getContract, claimWinnings, claimRefund } = useContract();
  const [claiming, setClaiming] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<SuccessMessage | null>(null);

  // Query claimable markets from the subgraph
  const { data, loading, error: queryError, refetch } = useQuery<SubgraphResponse>(GET_CLAIMABLE_MARKETS, {
    variables: { userAddress: account?.toLowerCase() },
    skip: !account,
    pollInterval: 10000 // Poll every 10 seconds to keep the list updated
  });

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Transform subgraph data into ClaimableMarket format
  const claimableMarkets = React.useMemo(() => {
    if (!data?.bets) return [];
    
    return data.bets
      .filter((bet: SubgraphBet) => {
        if (bet.claimed) return false;
        
        const marketOutcome = Number(bet.market.outcome || 0);
        const isRefunded = bet.market.resolutionDetails?.toLowerCase().includes('refund');
        const userWon = !isRefunded && marketOutcome > 0 && ((bet.isOptionA && marketOutcome === 1) || (!bet.isOptionA && marketOutcome === 2));
        const hasResolutionTimestamp = Number(bet.market.resolutionTimestamp || 0) > 0;
        const betOutcome = Number(bet.outcome || 0);
        
        // Show markets that are either refundable (outcome = 3) or won (outcome = 1)
        return hasResolutionTimestamp && !bet.claimed && (betOutcome === 3 || (betOutcome === 1 && userWon));
      })
      .map((bet: SubgraphBet) => {
        const betOutcome = Number(bet.outcome || 0);
        const isRefundable = betOutcome === 3;
        const betAmount = BigInt(bet.amount);
        
        // For refunds, winnings is the original bet amount
        // For wins, winnings is the total payout minus the original bet amount
        let winnings: bigint | null = null;
        if (isRefundable) {
          winnings = betAmount;
        } else if (bet.market.totalPoolA && bet.market.totalPoolB) {
          const totalPool = BigInt(bet.market.totalPoolA) + BigInt(bet.market.totalPoolB);
          const winningPool = bet.isOptionA ? BigInt(bet.market.totalPoolA) : BigInt(bet.market.totalPoolB);
          if (totalPool > 0n && winningPool > 0n) {
            // Calculate total payout
            const totalPayout = (betAmount * totalPool) / winningPool;
            // Net winnings is total payout minus original bet
            winnings = totalPayout - betAmount;
          }
        }

        return {
          id: Number(bet.market.id),
          question: bet.market.question,
          optionA: bet.market.optionA,
          optionB: bet.market.optionB,
          amount: betAmount,
          winnings,
          type: isRefundable ? 'refund' as const : 'win' as const,
          resolutionTimestamp: Number(bet.market.resolutionTimestamp || 0)
        };
      })
      .sort((a, b) => b.resolutionTimestamp - a.resolutionTimestamp);
  }, [data]);

  const handleClaim = async (marketId: number, type: 'win' | 'refund') => {
    if (!account) return;
    
    setClaiming(marketId);
    setError(null);
    setSuccessMessage(null);

    try {
      const contract = await getContract();
      if (!contract) {
        throw new Error('Failed to get contract instance');
      }

      const market = claimableMarkets.find((m: ClaimableMarket) => m.id === marketId);
      if (!market) {
        throw new Error('Market not found');
      }

      let tx;
      try {
        if (type === 'win') {
          tx = await contract.claimWinnings(marketId);
        } else {
          tx = await contract.claimRefund(marketId);
        }
        await tx.wait();
        
        setSuccessMessage({
          marketId,
          amount: formatEther(market.amount),
          timestamp: Date.now(),
          type
        });

        // Refetch the data to update the list
        refetch();
      } catch (err: any) {
        if (err.reason) {
          setError(`Failed to claim: ${err.reason}`);
        } else if (err.message && err.message.includes('user rejected transaction')) {
          setError('Transaction was rejected');
        } else {
          setError('Failed to claim. Please try again later.');
        }
        console.error('Claim error:', err);
      }
    } catch (err: any) {
      console.error('Contract error:', err);
      setError(err.message || 'Failed to get contract');
    } finally {
      setClaiming(null);
    }
  };

  if (!account) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <div className="cyber-card text-center">
            <h1 className="cyber-title mb-6">Connect Wallet</h1>
            <p className="cyber-text mb-8">
              Connect your wallet to view and claim your winnings
            </p>
            <button onClick={() => connect()} className="cyber-button">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pog-orange"></div>
        </div>
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="cyber-card bg-red-900/20 border-red-500/20">
          <p className="text-red-500">Failed to load claimable markets</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="cyber-title mb-8 text-center">Claimable Markets</h1>
        
        {error && (
          <div className="cyber-card bg-red-900/20 border-red-500/20 mb-6">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="fixed top-4 right-4 cyber-card bg-green-900/20 border-green-500/20 p-4 animate-fade-in-out">
            <div className="flex items-center">
              <div className="mr-3">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-green-500 font-semibold">Claim Successful!</p>
                <p className="text-sm text-green-400">
                  You claimed {successMessage.amount} AVAX 
                  {successMessage.type === 'refund' ? ' (Refund)' : ' (Winnings)'}
                </p>
              </div>
            </div>
          </div>
        )}

        {claimableMarkets.length === 0 ? (
          <div className="cyber-card text-center">
            <p className="text-gray-400">No claimable markets at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {claimableMarkets.map((market: ClaimableMarket) => (
              <div key={market.id} className="cyber-card hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Link 
                      href={`/markets/${market.id}`}
                      className="text-lg font-semibold hover:text-pog-orange transition-colors"
                    >
                      {market.question}
                    </Link>
                    <div className="text-sm text-gray-400 mt-1">
                      {market.optionA} vs {market.optionB}
                    </div>
                    <div className="text-pog-orange mt-2">
                      {market.type === 'refund' ? 'Refund' : 'Winnings'}: {formatEther(market.winnings || 0n)} AVAX
                    </div>
                  </div>
                  <button
                    onClick={() => handleClaim(market.id, market.type === 'win' ? 'win' : 'refund')}
                    disabled={claiming === market.id || market.type === 'loss'}
                    className={`cyber-button ml-4 ${market.type === 'refund' ? 'bg-blue-600' : ''}`}
                  >
                    {claiming === market.id ? 'Claiming...' : `Claim ${market.type === 'refund' ? 'Refund' : 'Winnings'}`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}