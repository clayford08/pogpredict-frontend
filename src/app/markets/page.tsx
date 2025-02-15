'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import MarketCard from '@/components/MarketCard';
import MarketSearch from '@/components/MarketSearch';
import { useContract } from '@/hooks/useContract';
import { useWeb3 } from '@/components/Web3Provider';
import { formatEther } from 'ethers';

interface Market {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  category: string;
  logoUrlA: string;
  logoUrlB: string;
  endTime: number;
  outcome: string;
  status: string;
  resolved: boolean;
  totalOptionA: string;
  totalOptionB: string;
}

export default function MarketsPage() {
  const { getMarket, getMarketCount } = useContract();
  const { connect, account } = useWeb3();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('ACTIVE');
  const [sortBy, setSortBy] = useState('endTime');

  // Generate unique categories from market tournaments
  const categories = useMemo(() => {
    const uniqueCategories = new Set(['All']);
    markets.forEach(market => {
      if (market.category) {
        uniqueCategories.add(market.category);
      }
    });
    return Array.from(uniqueCategories);
  }, [markets]);

  // Fetch markets only once when contract methods are available
  useEffect(() => {
    if (!getMarket || !getMarketCount || initialized.current) return;
    initialized.current = true;

    const fetchMarkets = async () => {
      try {
        const count = await getMarketCount();
        if (count === 0) {
          setMarkets([]);
          setLoading(false);
          return;
        }

        const marketPromises = Array.from({ length: count }, (_, i) => 
          getMarket(i)
            .then(market => {
              if (!market) return null;
              const endTimeNum = Number(market.endTime);
              return {
                ...market,
                id: i,
                endTime: endTimeNum,
                status: endTimeNum * 1000 > Date.now() ? 'ACTIVE' : 'ENDED',
                question: market.question.replace(/\s*-\s*Match\s*\d+$/i, '')
              } as Market;
            })
            .catch(() => null)
        );
        
        const results = await Promise.all(marketPromises);
        const validMarkets = results.filter((market): market is Market => market !== null);
        setMarkets(validMarkets);
      } catch (error: unknown) {
        console.error('Error fetching markets:', error);
        setError('Error fetching markets: ' + (error instanceof Error ? error.message : String(error)));
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, [getMarket, getMarketCount]);

  // Filter and sort markets
  const filteredMarkets = useMemo(() => {
    return markets.filter(market => {
      const matchesSearch = searchQuery === '' || 
        market.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.optionA.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.optionB.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || market.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All' || market.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'endTime':
          return a.endTime - b.endTime;
        case 'poolSize': {
          const poolA = parseFloat(formatEther(a.totalOptionA)) + parseFloat(formatEther(a.totalOptionB));
          const poolB = parseFloat(formatEther(b.totalOptionA)) + parseFloat(formatEther(b.totalOptionB));
          return poolB - poolA;
        }
        case 'newest':
          return b.id - a.id;
        default:
          return 0;
      }
    });
  }, [markets, searchQuery, selectedCategory, selectedStatus, sortBy]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pog-orange"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="cyber-card">
          <h1 className="cyber-title text-red-500">Error</h1>
          <p className="cyber-text mt-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="cyber-title text-center mb-8">Markets</h1>
        
        <MarketSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          sortBy={sortBy}
          setSortBy={setSortBy}
          categories={categories}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>

        {filteredMarkets.length === 0 && (
          <div className="cyber-card text-center py-8">
            <p className="text-gray-400">No markets found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedStatus('All');
                setSortBy('endTime');
              }}
              className="cyber-button mt-4"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
