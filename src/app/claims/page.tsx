'use client';

import React, { useEffect, useState } from 'react';
import { useWeb3 } from '@/components/Web3Provider';
import { useContract } from '@/hooks/useContract';
import { formatEther } from '@/lib/utils';
import Link from 'next/link';

interface ClaimableMarket {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  winningAmount: bigint;
}

interface SuccessMessage {
  marketId: number;
  amount: string;
  timestamp: number;
}

export default function ClaimsPage() {
  const { account, connect } = useWeb3();
  const { getMarket, getUserBalances, claimWinnings, getContract } = useContract();
  const [claimableMarkets, setClaimableMarkets] = useState<ClaimableMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<SuccessMessage | null>(null);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    const fetchClaimableMarkets = async () => {
      if (!account) return;
      
      setLoading(true);
      setError(null);
      const markets: ClaimableMarket[] = [];

      try {
        const contract = await getContract();
        if (!contract) {
          throw new Error('Failed to get contract instance');
        }

        const marketCount = await contract.marketCount();
        
        for (let i = 0; i < Number(marketCount); i++) {
          try {
            const market = await getMarket(i);
            if (!market || !market.resolved) continue;

            const balances = await getUserBalances(i, account);
            if (!balances) continue;

            if (balances.optionA > 0n || balances.optionB > 0n) {
              const winningAmount = market.outcome === '1' ? balances.optionA : balances.optionB;
              
              if (winningAmount > 0n) {
                markets.push({
                  id: i,
                  question: market.question,
                  optionA: market.optionA,
                  optionB: market.optionB,
                  winningAmount
                });
              }
            }
          } catch (err) {
            // Silently continue if a single market fails
            continue;
          }
        }

        setClaimableMarkets(markets);
      } catch (err) {
        console.error('Error fetching claimable markets:', err);
        setError('Failed to load claimable markets');
      } finally {
        setLoading(false);
      }
    };

    fetchClaimableMarkets();
  }, [account, getMarket, getUserBalances, getContract]);

  const handleClaim = async (marketId: number) => {
    if (!account) return;
    
    setClaiming(marketId);
    setError(null);
    setSuccessMessage(null);

    try {
      const contract = await getContract();
      if (!contract) {
        throw new Error('Failed to get contract instance');
      }

      const market = claimableMarkets.find(m => m.id === marketId);
      if (!market) {
        throw new Error('Market not found');
      }

      const tx = await contract.claimWinnings(marketId);
      await tx.wait();
      
      setSuccessMessage({
        marketId,
        amount: formatEther(market.winningAmount),
        timestamp: Date.now()
      });

      setClaimableMarkets(prev => prev.filter(m => m.id !== marketId));
    } catch (err: any) {
      console.error('Error claiming winnings:', err);
      setError(err.message || 'Failed to claim winnings');
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

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="cyber-title mb-8 text-center">Claimable Winnings</h1>
        
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
                </p>
              </div>
            </div>
          </div>
        )}

        {claimableMarkets.length === 0 ? (
          <div className="cyber-card text-center">
            <p className="text-gray-400">No winnings to claim at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {claimableMarkets.map((market) => (
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
                      Winnings: {formatEther(market.winningAmount)} AVAX
                    </div>
                  </div>
                  <button
                    onClick={() => handleClaim(market.id)}
                    disabled={claiming === market.id}
                    className="cyber-button ml-4"
                  >
                    {claiming === market.id ? 'Claiming...' : 'Claim'}
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