'use client';

import React from 'react';
import { Search, Filter, SortDesc, Gamepad2 } from 'lucide-react';

interface MarketSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedEsport: string;
  setSelectedEsport: (esport: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  categories: string[];
}

const ESPORTS = ['All', 'CS2', 'Dota 2', 'Valorant', 'League of Legends', 'Marvel Rivals'];
const STATUSES = ['All', 'ACTIVE', 'ENDED', 'RESOLVED'];
const SORT_OPTIONS = [
  { value: 'endTime', label: 'End Time' },
  { value: 'poolSize', label: 'Pool Size' },
  { value: 'newest', label: 'Newest' },
];

export default function MarketSearch({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  selectedEsport,
  setSelectedEsport,
  sortBy,
  setSortBy,
  categories,
}: MarketSearchProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* Search input */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Esport filter */}
        <div className="min-w-[150px]">
          <div className="relative">
            <Gamepad2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedEsport}
              onChange={(e) => setSelectedEsport(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg appearance-none focus:outline-none focus:border-blue-500"
            >
              {ESPORTS.map((esport) => (
                <option key={esport} value={esport}>
                  {esport}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category filter */}
        <div className="min-w-[150px]">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg appearance-none focus:outline-none focus:border-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status filter */}
        <div className="min-w-[150px]">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg appearance-none focus:outline-none focus:border-blue-500"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort options */}
        <div className="min-w-[150px]">
          <div className="relative">
            <SortDesc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg appearance-none focus:outline-none focus:border-blue-500"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active filters */}
      <div className="flex flex-wrap gap-2">
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="px-3 py-1 bg-gray-700 rounded-full text-sm flex items-center gap-2"
          >
            Search: {searchQuery}
            <span className="text-gray-400">×</span>
          </button>
        )}
        {selectedEsport !== 'All' && (
          <button
            onClick={() => setSelectedEsport('All')}
            className="px-3 py-1 bg-gray-700 rounded-full text-sm flex items-center gap-2"
          >
            Esport: {selectedEsport}
            <span className="text-gray-400">×</span>
          </button>
        )}
        {selectedCategory !== 'All' && (
          <button
            onClick={() => setSelectedCategory('All')}
            className="px-3 py-1 bg-gray-700 rounded-full text-sm flex items-center gap-2"
          >
            Category: {selectedCategory}
            <span className="text-gray-400">×</span>
          </button>
        )}
        {selectedStatus !== 'All' && (
          <button
            onClick={() => setSelectedStatus('All')}
            className="px-3 py-1 bg-gray-700 rounded-full text-sm flex items-center gap-2"
          >
            Status: {selectedStatus}
            <span className="text-gray-400">×</span>
          </button>
        )}
      </div>
    </div>
  );
} 