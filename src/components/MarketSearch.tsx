'use client';

import React from 'react';
import { Search, Filter, SortDesc } from 'lucide-react';

interface MarketSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  categories: string[];
}

const statuses = ['All', 'ACTIVE', 'ENDED'];
const sortOptions = [
  { value: 'endTime', label: 'End Time' },
  { value: 'poolSize', label: 'Pool Size' },
  { value: 'newest', label: 'Newest First' },
];

export default function MarketSearch({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  sortBy,
  setSortBy,
  categories,
}: MarketSearchProps) {
  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search Input */}
        <div className="cyber-card flex items-center group relative">
          <Search className="w-5 h-5 mr-2 text-gray-400" />
          <input
            type="text"
            placeholder="Search markets, teams, or tournaments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none text-white"
          />
          <div className="absolute hidden group-hover:block bg-gray-900 text-white p-2 rounded-md text-sm -bottom-12 left-0 right-0 z-10">
            Search by team names, match details, or tournament names
          </div>
        </div>

        {/* Category Filter */}
        <div className="cyber-card flex items-center">
          <Filter className="w-5 h-5 mr-2 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none text-white appearance-none cursor-pointer"
          >
            {categories.map((category) => (
              <option key={category} value={category} className="bg-gray-900">
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="cyber-card flex items-center">
          <Filter className="w-5 h-5 mr-2 text-gray-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none text-white appearance-none cursor-pointer"
          >
            {statuses.map((status) => (
              <option key={status} value={status} className="bg-gray-900">
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div className="cyber-card flex items-center">
          <SortDesc className="w-5 h-5 mr-2 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none text-white appearance-none cursor-pointer"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-gray-900">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters */}
      <div className="flex flex-wrap gap-2">
        {searchQuery && (
          <span className="cyber-pill">
            Search: {searchQuery}
            <button
              onClick={() => setSearchQuery('')}
              className="ml-2 text-gray-400 hover:text-white"
            >
              ×
            </button>
          </span>
        )}
        {selectedCategory !== 'All' && (
          <span className="cyber-pill">
            Tournament: {selectedCategory}
            <button
              onClick={() => setSelectedCategory('All')}
              className="ml-2 text-gray-400 hover:text-white"
            >
              ×
            </button>
          </span>
        )}
        {selectedStatus !== 'All' && (
          <span className="cyber-pill">
            Status: {selectedStatus}
            <button
              onClick={() => setSelectedStatus('All')}
              className="ml-2 text-gray-400 hover:text-white"
            >
              ×
            </button>
          </span>
        )}
      </div>
    </div>
  );
} 