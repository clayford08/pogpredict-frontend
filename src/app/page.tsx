'use client';

import React from 'react';
import Link from 'next/link';
import MarketCard from '@/components/MarketCard';
import { useQuery } from '@apollo/client';
import { GET_MARKETS } from '@/graphql/queries';
import { useState } from 'react';

const FEATURED_MARKET_COUNT = 3; // Show only 3 featured markets in rotation

interface Market {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  category: string;
  logoUrlA: string;
  logoUrlB: string;
  endTime: string;
  totalPoolA: string;
  totalPoolB: string;
  currentPriceA: string;
  currentPriceB: string;
  createdAt: string;
}

export default function Home() {
  const [currentMarketIndex, setCurrentMarketIndex] = useState(0);

  // Fetch markets using GraphQL
  const { data, loading, error } = useQuery(GET_MARKETS, {
    variables: {
      first: 100,
      skip: 0,
      orderBy: 'totalPoolA',
      orderDirection: 'desc'
    },
    pollInterval: 30000 // Poll every 30 seconds
  });

  // Filter and process markets
  const featuredMarkets = React.useMemo(() => {
    if (!data?.markets) return [];
    
    const currentTime = Date.now();
    return data.markets
      .filter((market: Market) => {
        const endTimeMs = Number(market.endTime) * 1000;
        return endTimeMs > currentTime; // Only show active markets
      })
      .sort((a: Market, b: Market) => {
        // Sort by total pool size
        const poolA = Number(a.totalPoolA) + Number(a.totalPoolB);
        const poolB = Number(b.totalPoolA) + Number(b.totalPoolB);
        return poolB - poolA;
      })
      .slice(0, FEATURED_MARKET_COUNT); // Take only the top 3 markets
  }, [data?.markets]);

  // Auto-rotate markets every 12 seconds
  React.useEffect(() => {
    if (featuredMarkets.length === 0) return;

    const interval = setInterval(() => {
      setCurrentMarketIndex((prevIndex) => (prevIndex + 1) % featuredMarkets.length);
    }, 12000);

    return () => clearInterval(interval);
  }, [featuredMarkets.length]);

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
          <div className="text-red-500 mb-4">{error.message}</div>
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
        {featuredMarkets.length > 0 ? (
          <div className="relative overflow-hidden max-w-4xl mx-auto">
            <div className="relative" style={{ height: '400px' }}>
              {featuredMarkets.map((market: Market, index: number) => (
                <div 
                  key={market.id} 
                  className="absolute top-0 left-0 w-full transition-transform duration-1000 ease-in-out"
                  style={{ 
                    transform: `translateX(${(index - currentMarketIndex) * 100}%)`,
                    padding: '0 1rem'
                  }}
                >
                  <div className="w-full mx-auto">
                    <MarketCard 
                      market={{
                        id: Number(market.id),
                        question: market.question,
                        optionA: market.optionA,
                        optionB: market.optionB,
                        category: market.category,
                        logoUrlA: market.logoUrlA,
                        logoUrlB: market.logoUrlB,
                        endTime: Number(market.endTime),
                        status: Number(market.endTime) * 1000 > Date.now() ? 'ACTIVE' : 'ENDED',
                        totalOptionA: market.totalPoolA,
                        totalOptionB: market.totalPoolB
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {featuredMarkets.length > 1 && (
              <div className="flex justify-center mt-8 gap-3">
                {featuredMarkets.map((_: Market, index: number) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentMarketIndex ? 'bg-pog-orange w-6' : 'bg-gray-600'
                    }`}
                    onClick={() => setCurrentMarketIndex(index)}
                  />
                ))}
              </div>
            )}
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
            <p className="cyber-text">Real-time odds based on community predictions</p>
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
