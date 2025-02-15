'use client';

import React, { useEffect, useState } from 'react';
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
import { useContract } from '@/hooks/useContract';
import { formatEther } from '@/lib/utils';
import { database } from '@/lib/firebase';
import { ref, get, set, query, orderByChild, limitToLast, Database } from 'firebase/database';

interface PricePoint {
  timestamp: number;
  priceA: number;
  priceB: number;
}

interface MarketChartProps {
  marketId: number;
  optionA?: string;
  optionB?: string;
}

const MAX_HISTORY_POINTS = 100; // Store up to 100 points (50 minutes of history)

const MarketChart: React.FC<MarketChartProps> = ({ marketId, optionA = 'Option A', optionB = 'Option B' }) => {
  const { getMarket } = useContract();
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load initial price history from Firebase
  useEffect(() => {
    const loadPriceHistory = async () => {
      try {
        const historyRef = ref(database, `price-history/market-${marketId}`);
        const historyQuery = query(
          historyRef,
          orderByChild('timestamp'),
          limitToLast(MAX_HISTORY_POINTS)
        );
        
        const snapshot = await get(historyQuery);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const historyArray = Object.values(data) as PricePoint[];
          historyArray.sort((a, b) => a.timestamp - b.timestamp);
          
          const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
          const recentHistory = historyArray.filter(point => point.timestamp > oneDayAgo);
          
          setPriceHistory(recentHistory);
        }
      } catch (error) {
        console.error('Error loading price history:', error);
        setError('Failed to load price history');
      }
    };

    loadPriceHistory();
  }, [marketId]);

  // Update price data and save to Firebase
  useEffect(() => {
    const fetchAndUpdatePrice = async () => {
      try {
        const market = await getMarket(marketId);
        if (!market) return;

        const totalOptionA = BigInt(market.totalOptionA || '0');
        const totalOptionB = BigInt(market.totalOptionB || '0');
        const totalPool = totalOptionA + totalOptionB;
        
        if (totalPool === 0n) return; // Skip if no liquidity

        const priceA = Number(totalOptionA) / Number(totalPool);
        const priceB = Number(totalOptionB) / Number(totalPool);

        // Validate prices before saving
        if (isNaN(priceA) || isNaN(priceB)) {
          console.error('Invalid prices calculated:', { priceA, priceB, totalOptionA: totalOptionA.toString(), totalOptionB: totalOptionB.toString() });
          return;
        }

        const newPoint = {
          timestamp: Date.now(),
          priceA,
          priceB
        };

        // Save new point to Firebase
        const pointRef = ref(
          database,
          `price-history/market-${marketId}/${newPoint.timestamp}`
        );
        await set(pointRef, newPoint);

        // Update local state
        setPriceHistory(prev => {
          const newHistory = [...prev, newPoint];
          return newHistory.length > MAX_HISTORY_POINTS 
            ? newHistory.slice(-MAX_HISTORY_POINTS) 
            : newHistory;
        });

        // Clean up old data
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const oldDataRef = query(
          ref(database, `price-history/market-${marketId}`),
          orderByChild('timestamp')
        );
        const snapshot = await get(oldDataRef);
        if (snapshot.exists()) {
          const updates: { [key: string]: null } = {};
          snapshot.forEach((child) => {
            if (child.val().timestamp < oneDayAgo) {
              updates[child.key!] = null;
            }
          });
          if (Object.keys(updates).length > 0) {
            await set(ref(database, `price-history/market-${marketId}`), updates);
          }
        }
      } catch (error) {
        console.error('Error updating price data:', error);
        setError('Failed to update price data');
      }
    };

    // Fetch immediately and then every 30 seconds
    fetchAndUpdatePrice();
    const interval = setInterval(fetchAndUpdatePrice, 30000);

    return () => clearInterval(interval);
  }, [marketId, getMarket]);

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
            tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
            stroke="#9CA3AF"
          />
          <YAxis
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            domain={[0, 1]}
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
              return [`${(value * 100).toFixed(1)}%`, label];
            }}
            labelFormatter={(label: number) => new Date(label).toLocaleString()}
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
