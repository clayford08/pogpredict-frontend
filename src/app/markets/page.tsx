'use client';

import React, { useState, useMemo } from 'react';
import MarketCard from '@/components/MarketCard';
import MarketSearch from '@/components/MarketSearch';
import { useQuery } from '@apollo/client';
import { GET_MARKETS } from '@/graphql/queries';
import SubgraphIndexingMessage from '@/components/SubgraphIndexingMessage';

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
  outcome: string | null;
  resolvedBy: string | null;
  resolutionDetails: string | null;
  resolutionTimestamp: string | null;
}

interface MarketCardProps {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  category: string;
  logoUrlA: string;
  logoUrlB: string;
  endTime: number;
  status: string;
  totalOptionA: string;
  totalOptionB: string;
}

export default function MarketsPage() {
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('ACTIVE');
  const [selectedEsport, setSelectedEsport] = useState('All');
  const [sortBy, setSortBy] = useState('endTime');

  // Fetch markets using GraphQL
  const { data, loading, error } = useQuery(GET_MARKETS, {
    variables: {
      first: 100,
      skip: 0,
      orderBy: sortBy,
      orderDirection: 'asc'
    },
    pollInterval: 30000 // Poll every 30 seconds
  });

  // Generate unique categories from market tournaments
  const categories = useMemo(() => {
    if (!data?.markets) return ['All'];
    const uniqueCategories = new Set(['All']);
    data.markets.forEach((market: Market) => {
      if (market.category) {
        uniqueCategories.add(market.category);
      }
    });
    return Array.from(uniqueCategories);
  }, [data?.markets]);

  // Filter and sort markets
  const filteredMarkets = useMemo(() => {
    if (!data?.markets) return [];
    
    return data.markets.filter((market: Market) => {
      const endTimeNum = Number(market.endTime) * 1000;
      const isResolved = market.outcome !== null;
      const status = isResolved ? 'RESOLVED' : endTimeNum > Date.now() ? 'ACTIVE' : 'ENDED';

      const matchesSearch = searchQuery === '' || 
        market.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.optionA.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.optionB.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || market.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All' || status === selectedStatus;
      const matchesEsport = selectedEsport === 'All' || market.category.startsWith(selectedEsport);

      return matchesSearch && matchesCategory && matchesStatus && matchesEsport;
    }).sort((a: Market, b: Market) => {
      switch (sortBy) {
        case 'endTime':
          return Number(a.endTime) - Number(b.endTime);
        case 'poolSize': {
          const poolA = Number(a.totalPoolA) + Number(a.totalPoolB);
          const poolB = Number(b.totalPoolA) + Number(b.totalPoolB);
          return poolB - poolA;
        }
        case 'newest':
          return Number(b.createdAt) - Number(a.createdAt);
        default:
          return 0;
      }
    });
  }, [data?.markets, searchQuery, selectedCategory, selectedStatus, selectedEsport, sortBy]);

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
    // Check if the error is related to the subgraph still indexing
    if (error.message.includes("has no field") || error.message.includes("Cannot query field")) {
      return (
        <div className="container mx-auto px-4 py-8">
          <SubgraphIndexingMessage entityName="Markets" />
        </div>
      );
    }
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="cyber-card">
          <h1 className="cyber-title text-red-500">Error</h1>
          <p className="cyber-text mt-4">{error.message}</p>
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
          selectedEsport={selectedEsport}
          setSelectedEsport={setSelectedEsport}
          sortBy={sortBy}
          setSortBy={setSortBy}
          categories={categories}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMarkets.map((market: Market) => (
            <MarketCard 
              key={market.id} 
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
                setSelectedEsport('All');
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
