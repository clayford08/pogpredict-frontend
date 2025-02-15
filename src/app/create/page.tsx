'use client';

import React, { useEffect, useState } from 'react';
import { useWeb3 } from '@/components/Web3Provider';
import { useContract } from '@/hooks/useContract';
import { ethers } from 'ethers';

export default function CreateMarketPage() {
  const { account, connect } = useWeb3();
  const { getContract } = useContract();
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [question, setQuestion] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [category, setCategory] = useState('');
  const [endTime, setEndTime] = useState('');
  const [virtualA, setVirtualA] = useState('');
  const [virtualB, setVirtualB] = useState('');
  const [logoUrlA, setLogoUrlA] = useState('');
  const [logoUrlB, setLogoUrlB] = useState('');
  const [oracleMode, setOracleMode] = useState('manual');
  const [oracleAddress, setOracleAddress] = useState('');
  const [oracleData, setOracleData] = useState('');

  useEffect(() => {
    const checkOwnership = async () => {
      if (!account) {
        setLoading(false);
        return;
      }

      try {
        const contract = await getContract();
        if (!contract) {
          setLoading(false);
          return;
        }

        const owner = await contract.owner();
        setIsOwner(owner.toLowerCase() === account.toLowerCase());
      } catch (err) {
        console.error('Error checking ownership:', err);
        setError('Failed to verify ownership');
      } finally {
        setLoading(false);
      }
    };

    checkOwnership();
  }, [account, getContract]);

  const handleCreateMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const contract = await getContract();
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      // Convert endTime from datetime-local to Unix timestamp
      const localDate = new Date(endTime);
      const endTimeUnix = Math.floor(localDate.getTime() / 1000);
      const now = Math.floor(Date.now() / 1000);

      console.log('Debug time values:');
      console.log('Raw endTime input:', endTime);
      console.log('Current time (local):', new Date().toLocaleString());
      console.log('Current time (ISO):', new Date().toISOString());
      console.log('Selected end time (local):', localDate.toLocaleString());
      console.log('Selected end time (UTC):', localDate.toUTCString());
      console.log('Selected end time (ISO):', localDate.toISOString());
      console.log('Now (unix):', now);
      console.log('End time (unix):', endTimeUnix);
      console.log('Time difference (hours):', (endTimeUnix - now) / 3600);

      // Validate end time
      if (endTimeUnix <= now) {
        throw new Error('End time must be in the future');
      }

      // Calculate duration in seconds
      const duration = endTimeUnix - now;
      
      // Convert ETH amounts to Wei
      const virtualAWei = ethers.parseEther(virtualA);
      const virtualBWei = ethers.parseEther(virtualB);
      const creationFee = ethers.parseEther('0.1');
      const totalValue = creationFee + virtualAWei + virtualBWei;

      // Create market
      const tx = await contract.createMarket(
        question,
        optionA,
        optionB,
        category,
        duration,  // Pass duration instead of endTime
        logoUrlA,
        logoUrlB,
        0, // No oracle match ID for manual markets
        { value: totalValue }
      );

      await tx.wait();
      alert('Market created successfully!');
      
      // Reset form
      setQuestion('');
      setOptionA('');
      setOptionB('');
      setCategory('');
      setEndTime('');
      setVirtualA('');
      setVirtualB('');
      setLogoUrlA('');
      setLogoUrlB('');
    } catch (err: any) {
      console.error('Error creating market:', err);
      alert(`Failed to create market: ${err.message || 'Unknown error'}`);
    }
  };

  if (!account) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <div className="cyber-card text-center">
            <h1 className="cyber-title mb-6">Connect Wallet</h1>
            <p className="cyber-text mb-8">
              Connect your wallet to create a new market
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

  if (!isOwner) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <div className="cyber-card text-center">
            <h1 className="cyber-title text-red-500">Access Denied</h1>
            <p className="cyber-text mt-4">
              Only the contract owner can create new markets
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="cyber-card">
          <h1 className="cyber-title mb-6">Create Market</h1>
          <form onSubmit={handleCreateMarket} className="space-y-6">
            <div>
              <label className="cyber-label">Question</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., Will BTC be above $100k by end of 2024?"
                required
                className="cyber-input w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="cyber-label">Option A</label>
                <input
                  type="text"
                  value={optionA}
                  onChange={(e) => setOptionA(e.target.value)}
                  placeholder="e.g., Yes"
                  required
                  className="cyber-input w-full"
                />
              </div>
              <div>
                <label className="cyber-label">Option B</label>
                <input
                  type="text"
                  value={optionB}
                  onChange={(e) => setOptionB(e.target.value)}
                  placeholder="e.g., No"
                  required
                  className="cyber-input w-full"
                />
              </div>
            </div>

            <div>
              <label className="cyber-label">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Crypto"
                required
                className="cyber-input w-full"
              />
            </div>

            <div>
              <label className="cyber-label">End Time</label>
              <p className="text-xs text-gray-400 mb-1">
                Current time: {new Date().toLocaleString()} ({Intl.DateTimeFormat().resolvedOptions().timeZone})
              </p>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => {
                  console.log('Selected time:', e.target.value);
                  // Store the raw datetime-local value
                  setEndTime(e.target.value);
                }}
                step="60"
                required
                className="cyber-input w-full"
              />
              <p className="text-sm text-gray-400 mt-1">
                Market end time must be in the future
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="cyber-label">Initial Liquidity A (ETH)</label>
                <input
                  type="number"
                  value={virtualA}
                  onChange={(e) => setVirtualA(e.target.value)}
                  placeholder="e.g., 1.0"
                  required
                  min="0"
                  step="0.01"
                  className="cyber-input w-full"
                />
              </div>
              <div>
                <label className="cyber-label">Initial Liquidity B (ETH)</label>
                <input
                  type="number"
                  value={virtualB}
                  onChange={(e) => setVirtualB(e.target.value)}
                  placeholder="e.g., 1.0"
                  required
                  min="0"
                  step="0.01"
                  className="cyber-input w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="cyber-label">Logo URL A (optional)</label>
                <input
                  type="url"
                  value={logoUrlA}
                  onChange={(e) => setLogoUrlA(e.target.value)}
                  placeholder="e.g., https://example.com/logo-a.png"
                  className="cyber-input w-full"
                />
              </div>
              <div>
                <label className="cyber-label">Logo URL B (optional)</label>
                <input
                  type="url"
                  value={logoUrlB}
                  onChange={(e) => setLogoUrlB(e.target.value)}
                  placeholder="e.g., https://example.com/logo-b.png"
                  className="cyber-input w-full"
                />
              </div>
            </div>

            <div>
              <label className="cyber-label">Oracle Mode</label>
              <select
                value={oracleMode}
                onChange={(e) => setOracleMode(e.target.value)}
                className="cyber-input w-full"
              >
                <option value="manual">Manual Resolution</option>
                <option value="oracle">Oracle Resolution</option>
              </select>
            </div>

            {oracleMode === 'oracle' && (
              <>
                <div>
                  <label className="cyber-label">Oracle Address</label>
                  <input
                    type="text"
                    value={oracleAddress}
                    onChange={(e) => setOracleAddress(e.target.value)}
                    placeholder="e.g., 0x..."
                    required
                    className="cyber-input w-full"
                  />
                </div>
                <div>
                  <label className="cyber-label">Oracle Data</label>
                  <input
                    type="text"
                    value={oracleData}
                    onChange={(e) => setOracleData(e.target.value)}
                    placeholder="e.g., 0x..."
                    required
                    className="cyber-input w-full"
                  />
                </div>
              </>
            )}

            <button type="submit" className="cyber-button w-full">
              Create Market
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
