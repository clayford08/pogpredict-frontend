'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatEther, formatPercent, formatTimeLeft } from '@/lib/utils';

interface Market {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  endTime: number;
  totalOptionA: string;
  totalOptionB: string;
  status: string;
  category: string;
  logoUrlA: string;
  logoUrlB: string;
}

interface MarketCardProps {
  market: Market;
}

export default function MarketCard({ market }: MarketCardProps) {
  // Safely parse pool values with fallbacks to 0
  const poolA = parseFloat(formatEther(market.totalOptionA || '0')) || 0;
  const poolB = parseFloat(formatEther(market.totalOptionB || '0')) || 0;
  const totalPool = poolA + poolB;
  
  // Calculate probabilities with protection against division by zero
  const probabilityA = totalPool === 0 ? 50 : (poolA / totalPool) * 100;
  const probabilityB = totalPool === 0 ? 50 : (poolB / totalPool) * 100;
  const isAHigher = poolA >= poolB;

  // Format the question to just "Team A vs Team B"
  const formattedQuestion = `${market.optionA} vs ${market.optionB}`;

  // Calculate total pool with safe fallbacks
  const totalPoolBigInt = BigInt(market.totalOptionA || '0') + BigInt(market.totalOptionB || '0');

  return (
    <Link href={`/markets/${market.id}`}>
      <div className="cyber-card hover:scale-[1.02] transition-all duration-300 h-80 flex flex-col justify-between relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: 'url(/cs2-bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'top',
            backgroundRepeat: 'no-repeat',
          }}
        />
        
        {/* Content with increased contrast for readability */}
        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                market.status === 'ACTIVE' ? 'bg-green-500/20 text-green-500' : 
                market.status === 'ENDED' ? 'bg-red-500/20 text-red-500' :
                market.status === 'REFUNDED' ? 'bg-yellow-500/20 text-yellow-500' :
                market.status === 'RESOLVED' ? 'bg-blue-500/20 text-blue-500' :
                'bg-gray-500/20 text-gray-500'
              }`}>
                {market.status}
              </span>
              <span className="text-xs font-medium px-2 py-1 rounded bg-blue-500/20 text-blue-500">
                {market.category}
              </span>
            </div>
            <span className="text-xs text-gray-400">{formatTimeLeft(market.endTime)}</span>
          </div>
          
          <h3 className="text-lg font-semibold mb-4">{formattedQuestion}</h3>
          
          <div className="space-y-3">
            <div className="px-2 space-y-1">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  {market.logoUrlA && (
                    <div className="relative w-6 h-6 rounded-full overflow-hidden bg-white/5">
                      <Image
                        src={market.logoUrlA}
                        alt={market.optionA}
                        fill
                        sizes="24px"
                        className="object-contain p-1"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                      />
                    </div>
                  )}
                  <span className="font-medium">{market.optionA}</span>
                </div>
                <span className={`font-bold ${isAHigher ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercent(probabilityA)}
                </span>
              </div>
              <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${isAHigher ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-red-500 to-red-400'} animate-pulse-slow`}
                  style={{ width: `${probabilityA}%` }}
                />
              </div>
            </div>
            
            <div className="px-2 space-y-1">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  {market.logoUrlB && (
                    <div className="relative w-6 h-6 rounded-full overflow-hidden bg-white/5">
                      <Image
                        src={market.logoUrlB}
                        alt={market.optionB}
                        fill
                        sizes="24px"
                        className="object-contain p-1"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                      />
                    </div>
                  )}
                  <span className="font-medium">{market.optionB}</span>
                </div>
                <span className={`font-bold ${!isAHigher ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercent(probabilityB)}
                </span>
              </div>
              <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${!isAHigher ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-red-500 to-red-400'} animate-pulse-slow`}
                  style={{ width: `${probabilityB}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-300 font-medium relative z-10">
          Total Pool: {formatEther(totalPoolBigInt.toString())} ETH
        </div>
      </div>
    </Link>
  );
}
