'use client';

import React from 'react';
import { useWeb3 } from '@/components/Web3Provider';
import { useUserProfile } from '@/hooks/useUserProfile';
import OverallStats from '@/components/profile/OverallStats';
import MonthlyStats from '@/components/profile/MonthlyStats';
import RecentActivity from '@/components/profile/RecentActivity';

export default function ProfilePage() {
  const { account, connect } = useWeb3();
  const { stats, activity, loading, error } = useUserProfile(account || undefined);

  if (!account) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <div className="cyber-card text-center">
            <h1 className="cyber-title mb-6">Connect Wallet</h1>
            <p className="cyber-text mb-8">
              Connect your wallet to view your profile and trading history
            </p>
            <button onClick={() => connect()} className="cyber-button">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pog-orange"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <div className="cyber-card text-center">
            <h1 className="cyber-title text-red-500 mb-6">Error</h1>
            <p className="cyber-text mb-8">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="cyber-card mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="cyber-title">Profile</h1>
              <p className="text-sm text-gray-400 font-mono mt-2">
                {account.slice(0, 6)}...{account.slice(-4)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Current Streak</div>
              <div className="text-xl font-bold text-pog-orange">
                {stats.currentStreak} Markets
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Best: {stats.bestStreak} Markets
              </div>
            </div>
          </div>
        </div>

        {/* Stats Sections */}
        <OverallStats stats={stats} />
        <MonthlyStats stats={stats} />
        <RecentActivity activities={activity} />
      </div>
    </div>
  );
} 