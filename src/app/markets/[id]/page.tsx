'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useContract } from '@/hooks/useContract';
import { formatEther, parseEther } from '@/lib/utils';
import MarketChart from '@/components/MarketChart';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useReferral as useReferralContext } from '@/components/ReferralProvider';
import { useReferral } from '@/hooks/useReferral';
import { ethers } from 'ethers';

interface MarketData {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  category: string;
  logoUrlA: string;
  logoUrlB: string;
  endTime: string;
  outcome: string;
  status: string;
  resolved: boolean;
  totalOptionA: string;
  totalOptionB: string;
}

interface MarketPageProps {
  params: { id: string };
}

export default function MarketPage({ params }: MarketPageProps) {
  const marketId = parseInt(params.id);
  const { address } = useAccount();
  const router = useRouter();
  const { getMarket, getUserBalances, buyOption, sellOption } = useContract();
  const { referralCode, setReferralCode } = useReferralContext();
  const { setReferrer, hasReferrerSet } = useReferral();
  
  // State
  const [market, setMarket] = useState<MarketData | null>(null);
  const [userBalances, setUserBalances] = useState<{ optionA: bigint; optionB: bigint } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [predictionAmount, setPredictionAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tempReferralCode, setTempReferralCode] = useState(referralCode || '');
  const [selectedTab, setSelectedTab] = useState<'buy' | 'sell'>('buy');
  const [hasReferrer, setHasReferrer] = useState(false);

  // Refs for cleanup and preventing race conditions
  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);
  const updateInterval = useRef<NodeJS.Timeout | null>(null);

  // Fetch market data
  const fetchMarketData = useCallback(async () => {
    if (fetchingRef.current || !mountedRef.current) return;
    
    try {
      fetchingRef.current = true;
      const marketData = await getMarket(marketId);
      
      if (!mountedRef.current) return;
      
      if (!marketData) {
        setError('Market not found');
        setLoading(false);
        return;
      }

      // Format the question to match the market cards
      const formattedQuestion = `${marketData.optionA} vs ${marketData.optionB}`;
      
      setMarket({
        id: marketId,
        ...marketData,
        question: formattedQuestion
      });
      setError(null);

      // Fetch user balances if connected
      if (address) {
        try {
          const balances = await getUserBalances(marketId, address);
          if (mountedRef.current && balances) {
            setUserBalances(balances);
          }
        } catch (balanceError) {
          console.error('Error fetching user balances:', balanceError);
          // Don't set an error for the whole page if just balances fail
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        console.error('Error fetching market data:', err);
        setError('Failed to load market data');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        fetchingRef.current = false;
      }
    }
  }, [marketId, getMarket, getUserBalances, address]);

  // Initial load and cleanup
  useEffect(() => {
    mountedRef.current = true;
    fetchMarketData();

    // Set up periodic updates
    updateInterval.current = setInterval(fetchMarketData, 30000);

    return () => {
      mountedRef.current = false;
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
        updateInterval.current = null;
      }
    };
  }, [fetchMarketData]);

  // Check if user has referrer
  useEffect(() => {
    const checkReferrer = async () => {
      if (address) {
        try {
          const hasRef = await hasReferrerSet(address);
          setHasReferrer(hasRef);
        } catch (error) {
          console.error('Error checking referrer:', error);
          // Don't set an error for the whole page if just referrer check fails
        }
      }
    };
    checkReferrer();
  }, [address, hasReferrerSet]);

  // Handle setting referrer
  const handleSetReferrer = async (code: string): Promise<boolean> => {
    try {
      setError('Setting referral code...');
      console.log('Starting referral code setting process...');
      
      // Set referrer using Referral contract
      const receipt = await setReferrer(code);
      console.log('Referral transaction completed:', receipt);
      
      // Wait for the referrer to be set
      setError('Waiting for referral transaction to be confirmed...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verify referrer was set
      const hasRef = await hasReferrerSet(address!);
      console.log('Referrer check result:', hasRef);
      
      if (!hasRef) {
        setError('Failed to set referral code. Please try again.');
        return false;
      }
      
      setHasReferrer(true);
      setReferralCode(code);
      setError('Referral code set successfully.');
      
      // Wait a moment for UI to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error: any) {
      console.error('Error setting referral code:', error);
      setError(error.message || 'Failed to set referral code');
      return false;
    }
  };

  // Handle placing prediction
  const handlePlacePrediction = async (isOptionA: boolean) => {
    try {
      const parsedAmount = parseFloat(predictionAmount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error('Invalid amount');
      }

      setError(selectedTab === 'buy' ? 'Placing prediction...' : 'Selling position...');
      console.log(`${selectedTab === 'buy' ? 'Placing prediction' : 'Selling position'} with PogPredict contract:`, { isOptionA, amount: predictionAmount });
      
      const amountWei = parseEther(predictionAmount);
      let tx;
      
      if (selectedTab === 'buy') {
        tx = await buyOption(marketId, isOptionA, { value: amountWei });
      } else {
        // Verify user has enough balance to sell
        const balances = await getUserBalances(marketId, address!);
        const balance = isOptionA ? balances?.optionA : balances?.optionB;
        if (!balance || balance < amountWei) {
          throw new Error(`Insufficient balance to sell ${isOptionA ? market?.optionA : market?.optionB}`);
        }
        tx = await sellOption(marketId, isOptionA, amountWei);
      }

      console.log(`${selectedTab === 'buy' ? 'Prediction' : 'Sell'} transaction sent:`, tx.hash);
      
      setError(`Waiting for ${selectedTab === 'buy' ? 'prediction' : 'sell'} transaction to be confirmed...`);
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.waitForTransaction(tx.hash);
      console.log(`${selectedTab === 'buy' ? 'Prediction' : 'Sell'} transaction completed`);
      
      // Refetch data after successful transaction
      await fetchMarketData();
      setPredictionAmount('');
      setSellAmount('');
      setError(null);
      return true;
    } catch (error: any) {
      console.error(`Error ${selectedTab === 'buy' ? 'placing prediction' : 'selling position'}:`, error);
      setError(error.message || `Failed to ${selectedTab === 'buy' ? 'place prediction' : 'sell position'}`);
      return false;
    }
  };

  // Main handler for prediction submission
  const handlePrediction = async (isOptionA: boolean) => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setSubmitting(true);

      // Handle the prediction or sell
      const success = await handlePlacePrediction(isOptionA);
      if (!success) {
        console.log(`Failed to ${selectedTab === 'buy' ? 'place prediction' : 'sell position'}`);
      }
    } catch (err) {
      console.error('Error with transaction:', err);
      setError(`Failed to ${selectedTab} position`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pog-dark">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-48 bg-gray-800/50 rounded-lg border border-pog-orange/20" />
            <div className="h-96 bg-gray-800/50 rounded-lg border border-pog-orange/20" />
            <div className="h-64 bg-gray-800/50 rounded-lg border border-pog-orange/20" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="min-h-screen bg-pog-dark">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-gray-800/50 rounded-lg p-8 text-center border border-red-500/20">
            <h1 className="text-2xl text-red-400 mb-4">{error || 'Market not found'}</h1>
            <button
              onClick={() => router.push('/markets')}
              className="px-6 py-2 bg-pog-orange text-white rounded-lg hover:bg-pog-orange/80 transition-colors duration-200"
            >
              Back to Markets
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isEnded = new Date(parseInt(market.endTime) * 1000) < new Date();
  const totalPool = BigInt(market.totalOptionA) + BigInt(market.totalOptionB);
  const poolA = formatEther(market.totalOptionA);
  const poolB = formatEther(market.totalOptionB);
  const priceA = totalPool === 0n ? 50 : (Number(poolA) / (Number(poolA) + Number(poolB))) * 100;
  const priceB = totalPool === 0n ? 50 : (Number(poolB) / (Number(poolA) + Number(poolB))) * 100;

  return (
    <div className="min-h-screen bg-pog-dark">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Market Header */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-pog-orange/20">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pog-orange to-pog-accent bg-clip-text text-transparent">
              {market.question}
            </h1>
            <div className="text-sm text-gray-400">
              Category: {market.category}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-700/30 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 flex-shrink-0 relative bg-black/20 rounded-xl flex items-center justify-center p-2">
                  <img 
                    src={market.logoUrlA} 
                    alt={market.optionA} 
                    className="w-full h-full"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div className="ml-4 text-left">
                  <h2 className="text-xl font-semibold text-white">{market.optionA}</h2>
                  <p className="text-pog-orange text-2xl font-bold">{priceA.toFixed(1)}%</p>
                </div>
              </div>
              <div className="text-gray-400">
                Pool: <span className="font-mono">{Number(poolA).toFixed(4)} ETH</span>
              </div>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 flex-shrink-0 relative bg-black/20 rounded-xl flex items-center justify-center p-2">
                  <img 
                    src={market.logoUrlB} 
                    alt={market.optionB} 
                    className="w-full h-full"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div className="ml-4 text-left">
                  <h2 className="text-xl font-semibold text-white">{market.optionB}</h2>
                  <p className="text-blue-400 text-2xl font-bold">{priceB.toFixed(1)}%</p>
                </div>
              </div>
              <div className="text-gray-400">
                Pool: <span className="font-mono">{Number(poolB).toFixed(4)} ETH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Price Chart */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-pog-orange/20">
          <h2 className="text-xl font-semibold text-white mb-4">Price History</h2>
          <MarketChart
            marketId={marketId}
            optionA={market.optionA}
            optionB={market.optionB}
          />
        </div>

        {/* Trading Interface */}
        {!isEnded && !market.resolved && (
          <div className="bg-gray-800/50 rounded-lg p-6 border border-pog-orange/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Trading Interface</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedTab('buy')}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    selectedTab === 'buy'
                      ? 'bg-pog-orange text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setSelectedTab('sell')}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    selectedTab === 'sell'
                      ? 'bg-pog-orange text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Sell
                </button>
              </div>
            </div>

            {address ? (
              <div className="space-y-6">
                {/* Amount Input */}
                <div>
                  <label className="block text-gray-300 mb-2">
                    Amount (ETH)
                  </label>
                  <input
                    type="number"
                    value={predictionAmount}
                    onChange={(e) => setPredictionAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-pog-orange transition-colors duration-200"
                    placeholder="0.0"
                    disabled={submitting}
                  />
                </div>

                {/* Referral Code */}
                {selectedTab === 'buy' && !hasReferrer && (
                  <div>
                    <label className="block text-gray-300 mb-2">
                      Referral Code (Optional)
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={tempReferralCode}
                        onChange={(e) => {
                          setTempReferralCode(e.target.value);
                        }}
                        className="flex-1 px-4 py-3 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-pog-orange transition-colors duration-200"
                        placeholder="Enter referral code"
                        disabled={submitting}
                      />
                      <button
                        onClick={async () => {
                          if (!tempReferralCode) return;
                          setSubmitting(true);
                          try {
                            const success = await handleSetReferrer(tempReferralCode);
                            if (success) {
                              setError('Referral code set successfully!');
                            }
                          } finally {
                            setSubmitting(false);
                          }
                        }}
                        disabled={submitting || !tempReferralCode}
                        className="px-4 py-2 bg-pog-orange text-white rounded-lg hover:bg-pog-orange/80 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Set
                      </button>
                    </div>
                  </div>
                )}
                {selectedTab === 'buy' && hasReferrer && (
                  <div className="text-sm text-gray-400">
                    You already have a referrer set
                  </div>
                )}

                {/* Trading Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handlePrediction(true)}
                    disabled={submitting || !predictionAmount}
                    className="w-full px-6 py-3 bg-pog-orange text-white rounded-lg hover:bg-pog-orange/80 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedTab === 'buy' ? 'Buy' : 'Sell'} {market.optionA}
                  </button>
                  <button
                    onClick={() => handlePrediction(false)}
                    disabled={submitting || !predictionAmount}
                    className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedTab === 'buy' ? 'Buy' : 'Sell'} {market.optionB}
                  </button>
                </div>

                {/* User Positions */}
                {userBalances && (
                  <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
                    <h3 className="text-white font-semibold mb-3">Your Positions</h3>
                    <div className="space-y-2 text-gray-300">
                      <div className="flex justify-between">
                        <span>{market.optionA}:</span>
                        <span className="font-mono text-pog-orange">
                          {formatEther(userBalances.optionA)} ETH
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{market.optionB}:</span>
                        <span className="font-mono text-blue-400">
                          {formatEther(userBalances.optionB)} ETH
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-700/30 rounded-lg">
                <p className="text-gray-300 mb-4">Connect your wallet to trade</p>
                <button
                  onClick={() => {}} // This should trigger wallet connect
                  className="px-6 py-2 bg-pog-orange text-white rounded-lg hover:bg-pog-orange/80 transition-colors duration-200"
                >
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
        )}

        {/* Market Status */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-pog-orange/20">
          <h2 className="text-xl font-semibold text-white mb-4">Market Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                <span className="text-gray-400">Status</span>
                <span className="text-white">
                  {market.status === '0' ? 'Active' : market.status === '1' ? 'Ended' : 'Refunded'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                <span className="text-gray-400">End Time</span>
                <span className="text-white">
                  {new Date(parseInt(market.endTime) * 1000).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                <span className="text-gray-400">Total Liquidity</span>
                <span className="text-white font-mono">
                  {formatEther(totalPool.toString())} ETH
                </span>
              </div>
              {market.resolved && (
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-400">Winner</span>
                  <span className="text-white">
                    {market.outcome === '1' ? market.optionA : market.optionB}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
