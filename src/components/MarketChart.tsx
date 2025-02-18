'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useMarketPriceHistory } from '@/hooks/useMarketPriceHistory';

interface MarketChartProps {
  marketId: number;
  optionA?: string;
  optionB?: string;
}

const MarketChart: React.FC<MarketChartProps> = ({ marketId, optionA = 'Option A', optionB = 'Option B' }) => {
  const { priceHistory, loading, error } = useMarketPriceHistory(marketId.toString());

  if (loading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-black/20 rounded-lg border border-pog-orange/20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pog-orange"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-black/20 rounded-lg border border-pog-orange/20">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] bg-black/20 rounded-lg border border-pog-orange/20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={priceHistory}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(timestamp) => new Date(timestamp * 1000).toLocaleTimeString()}
            stroke="#9CA3AF"
          />
          <YAxis
            tickFormatter={(value) => `${value.toFixed(0)}%`}
            domain={[0, 100]}
            stroke="#9CA3AF"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '0.375rem',
            }}
            formatter={(value: number, name: string) => {
              const label = name === 'priceA' ? optionA : optionB;
              return [`${value.toFixed(1)}%`, label];
            }}
            labelFormatter={(label: number) => new Date(label * 1000).toLocaleString()}
          />
          <Legend
            formatter={(value: string) => value === 'priceA' ? optionA : optionB}
          />
          <Line
            type="monotone"
            dataKey="priceA"
            name="priceA"
            stroke="#ff4500"
            dot={false}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="priceB"
            name="priceB"
            stroke="#60A5FA"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MarketChart;
