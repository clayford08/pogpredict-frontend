'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MarketActivity } from '@/types/profile';
import { formatEther } from '@/lib/utils';
import { useContract } from '@/hooks/useContract';

interface MarketInfo {
  optionA: string;
  optionB: string;
}

interface RecentActivityProps {
  activity: MarketActivity[];
}

export default function RecentActivity({ activity }: RecentActivityProps) {
  const { getMarket } = useContract();
  const [marketDetails, setMarketDetails] = useState<{ [marketId: string]: MarketInfo }>({});

  useEffect(() => {
    const fetchMarketDetails = async () => {
      const details: { [marketId: string]: MarketInfo } = {};
      for (const item of activity) {
        if (!details[item.marketId]) {
          const market = await getMarket(parseInt(item.marketId.toString()));
          if (market) {
            details[item.marketId] = {
              optionA: market.optionA,
              optionB: market.optionB
            };
          }
        }
      }
      setMarketDetails(details);
    };

    fetchMarketDetails();
  }, [activity, getMarket]);

  if (activity.length === 0) {
    return (
      <div className="cyber-card">
        <h2 className="cyber-subtitle mb-4">Recent Activity</h2>
        <p className="text-gray-400">No recent activity available.</p>
      </div>
    );
  }

  return (
    <div className="cyber-card">
      <h2 className="cyber-subtitle mb-4">Recent Activity</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-pog-orange/20">
              <th className="pb-4 font-semibold text-pog-orange">Market</th>
              <th className="pb-4 font-semibold text-pog-orange">Type</th>
              <th className="pb-4 font-semibold text-pog-orange">Position</th>
              <th className="pb-4 font-semibold text-pog-orange">Amount</th>
              <th className="pb-4 font-semibold text-pog-orange">Time</th>
            </tr>
          </thead>
          <tbody>
            {activity.map((item, index) => {
              const market = marketDetails[item.marketId];
              const marketQuestion = market ? `${market.optionA} vs ${market.optionB}` : `Market #${item.marketId}`;
              const position = market && item.isOptionA !== undefined 
                ? (item.isOptionA ? market.optionA : market.optionB)
                : '-';

              return (
                <tr
                  key={`${item.txHash || item.timestamp}-${index}`}
                  className="border-b border-pog-orange/10 hover:bg-pog-orange/5 transition-all duration-300"
                >
                  <td className="py-4">
                    <Link 
                      href={`/markets/${item.marketId}`}
                      className="text-pog-orange hover:text-pog-orange/80 transition-colors"
                    >
                      {marketQuestion}
                    </Link>
                  </td>
                  <td className="py-4 capitalize">{item.type}</td>
                  <td className="py-4">{position}</td>
                  <td className="py-4">{item.amount} ETH</td>
                  <td className="py-4">
                    {new Date(item.timestamp * 1000).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
