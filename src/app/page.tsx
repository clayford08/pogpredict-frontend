'use client';

import React from 'react';
import Link from 'next/link';
import MarketCard from '@/components/MarketCard';
import { useContract, ContractMarket } from '@/hooks/useContract';
import { useEffect, useState } from 'react';

const FEATURED_MARKET_COUNT = 3; // Show only 3 featured markets in rotation

export default function Home() {
  const { getMarket, getMarketCount } = useContract();
  type ExtendedMarket = Omit<ContractMarket, 'endTime'> & {
    id: number;
    endTime: number;
    status: string;
    totalPool: bigint;
  };

  const [markets, setMarkets] = useState<ExtendedMarket[]>([]);
  const [currentMarketIndex, setCurrentMarketIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Time threshold for showing resolved markets (7 days in milliseconds)
  const RESOLVED_MARKET_THRESHOLD = 7 * 24 * 60 * 60 * 1000;

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setError(null);
        
        // Get total number of markets
        const totalMarkets = await getMarketCount();
        if (totalMarkets === 0) {
          setMarkets([]);
          return;
        }

        // Get all markets for pool size comparison
        const marketPromises = Array.from({ length: totalMarkets }, (_, i) => 
          getMarket(i)
            .then(market => market ? ({
              ...market,
              id: i,
              question: market.question.replace(/^Match\s*\d*\s*:?\s*/i, ''), // Clean the question
              endTime: Number(market.endTime),
              status: Number(market.endTime) * 1000 > Date.now() ? 'ACTIVE' : 'ENDED',
              totalPool: BigInt(market.totalOptionA) + BigInt(market.totalOptionB) // Calculate total pool
            }) : null)
            .catch(() => null) // Handle individual market fetch failures gracefully
        );

        // Fetch all markets in parallel
        const fetchedMarkets = await Promise.all(marketPromises);
        
        // Filter out null results, resolved old markets, and sort by total pool size
        const currentTime = Date.now();
        const validMarkets = fetchedMarkets
          .filter((market): market is ExtendedMarket => 
            market !== null && 
            // Only show active markets (end time is in the future and not resolved)
            Number(market.endTime) * 1000 > currentTime &&
            !market.resolved
          )
          .sort((a, b) => {
            // Sort by total pool size in descending order
            const poolA = a.totalPool;
            const poolB = b.totalPool;
            return poolB > poolA ? 1 : poolB < poolA ? -1 : 0;
          })
          .slice(0, FEATURED_MARKET_COUNT); // Take only the top 3 markets

        setMarkets(validMarkets);
      } catch (error) {
        console.error('Error fetching markets:', error);
        setError('Failed to load markets. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, [getMarket, getMarketCount]);

  // Auto-rotate markets every 12 seconds instead of 5
  useEffect(() => {
    if (markets.length === 0) return;

    const interval = setInterval(() => {
      setCurrentMarketIndex((prevIndex) => (prevIndex + 1) % markets.length);
    }, 12000);

    return () => clearInterval(interval);
  }, [markets.length]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pog-orange"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="cyber-card text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="cyber-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="text-center py-16 bg-gradient-to-r from-pog-gray to-pog-dark rounded-lg">
        <h1 className="text-4xl font-bold mb-4">
          Predict to <span className="text-pog-orange">Earn</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          The premier prediction market for esports enthusiasts
        </p>
      </section>

      <section>
        <div className="text-center mb-6">
          <h2 className="cyber-title inline-block">Featured Markets</h2>
          <div className="mt-2">
            <Link href="/markets" className="text-pog-orange hover:text-opacity-80 hover:scale-105 transition-all">
              View All →
            </Link>
          </div>
        </div>
        {markets.length > 0 ? (
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-1000 ease-in-out"
              style={{ 
                transform: `translateX(-${currentMarketIndex * (100 / markets.length)}%)`,
                width: '300%',
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'nowrap'
              }}
            >
              {markets.map((market) => (
                <div key={market.id} style={{ width: `${100 / markets.length}%` }} className="flex-shrink-0">
                  <div className="px-4">
                    <div className="w-full max-w-4xl mx-auto">
                      <div className="transform scale-110">
                        <MarketCard market={market} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-8 gap-3">
              {markets.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentMarketIndex ? 'bg-pog-orange w-6' : 'bg-gray-600'
                  }`}
                  onClick={() => setCurrentMarketIndex(index)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="cyber-card text-center py-8">
            <p className="text-gray-400">No active markets available.</p>
          </div>
        )}
      </section>

      <section className="cyber-card mt-12">
        <h2 className="cyber-title mb-4 text-center">Why PogPredict?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-pog-orange text-4xl mb-2 animate-float">🎮</div>
            <h3 className="font-bold mb-2 text-pog-orange">Esports Focused</h3>
            <p className="cyber-text">Dedicated to the games you love and follow</p>
          </div>
          <div className="text-center">
            <div className="text-pog-orange text-4xl mb-2 animate-float">💰</div>
            <h3 className="font-bold mb-2 text-pog-orange">Fair Markets</h3>
            <p className="cyber-text">Powered by AMM for accurate pricing</p>
          </div>
          <div className="text-center">
            <div className="text-pog-orange text-4xl mb-2 animate-float">🤝</div>
            <h3 className="font-bold mb-2 text-pog-orange">Community Driven</h3>
            <p className="cyber-text">Earn rewards through our referral system</p>
          </div>
        </div>
      </section>
    </div>
  );
}
