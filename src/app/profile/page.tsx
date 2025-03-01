'use client';

import React from 'react';
import { useWeb3 } from '@/components/Web3Provider';
import { useProfileData } from '@/hooks/useProfileData';
import OverallStats from '@/components/profile/OverallStats';
import RecentActivity from '@/components/profile/RecentActivity';
import SubgraphIndexingMessage from '@/components/SubgraphIndexingMessage';

export default function ProfilePage() {
  const { account, connect } = useWeb3();
  const { userStats, activity, loading, error } = useProfileData(account || undefined);

  if (!account) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="cyber-card text-center">
          <h1 className="cyber-title mb-6">Connect Wallet</h1>
          <p className="cyber-text mb-8">
            Connect your wallet to view your profile and stats.
          </p>
          <button onClick={connect} className="cyber-button">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pog-orange"></div>
      </div>
    );
  }

  if (error) {
    // Check if the error is related to the subgraph still indexing
    if (error.includes("has no field") || error.includes("Cannot query field")) {
      return (
        <div className="container mx-auto px-4 py-8">
          <SubgraphIndexingMessage entityName="User profiles" />
        </div>
      );
    }
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="cyber-card text-center">
          <h1 className="cyber-title text-red-500">Error</h1>
          <p className="cyber-text mt-4">{error}</p>
        </div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="cyber-card text-center">
          <h1 className="cyber-title mb-6">No Activity Yet</h1>
          <p className="cyber-text mb-8">
            You haven't participated in any prediction markets yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <OverallStats stats={userStats} />
        <RecentActivity activity={activity} />
      </div>
    </div>
  );
}
