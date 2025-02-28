'use client';

import React, { useState } from 'react';
import { useContract } from '@/hooks/useContract';
import { useReferral } from '@/hooks/useReferral';
import { ethers } from 'ethers';

interface AdminPanelProps {
  address: string;
}

export default function AdminPanel({ address }: AdminPanelProps) {
  const { getContract } = useContract();
  const { setBaseReferralFeeShare: updateBaseFeeShare, setCustomReferralFeeShare } = useReferral();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Market Resolution
  const [marketId, setMarketId] = useState('');
  const [outcome, setOutcome] = useState<'A' | 'B' | 'REFUND'>('A');
  const [resolutionDetails, setResolutionDetails] = useState('');
  const [endReason, setEndReason] = useState('');

  // Fee Management
  const [newFeePercent, setNewFeePercent] = useState('');
  const [newReferralFeePercent, setNewReferralFeePercent] = useState('');
  const [newFeeRecipient, setNewFeeRecipient] = useState('');
  const [marketCreationFee, setMarketCreationFee] = useState('');
  const [winningFee, setWinningFee] = useState('');
  const [sellFee, setSellFee] = useState('');

  // Position Limits
  const [maxPosition, setMaxPosition] = useState('');
  const [minPosition, setMinPosition] = useState('');
  const [minInitialPool, setMinInitialPool] = useState('');

  // Oracle Management
  const [oracleAddress, setOracleAddress] = useState('');
  const [oracleUpdater, setOracleUpdater] = useState('');
  const [refundWindow, setRefundWindow] = useState('');

  // Referral Management
  const [baseReferralFeeShare, setBaseReferralFeeShare] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [userFeeShare, setUserFeeShare] = useState('');
  const [referralContractAddress, setReferralContractAddress] = useState('');

  // Contract Pausing
  const [isPaused, setIsPaused] = useState(false);
  const [manualResolutionEnabled, setManualResolutionEnabled] = useState(true);

  // Market Resolution Functions
  const resolveMarket = async () => {
    if (!marketId) {
      setError('Please enter a market ID');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const contract = await getContract();
      if (!contract) throw new Error('Contract not initialized');

      const tx = await contract.resolveMarketManually(
        marketId,
        outcome === 'A' ? 1 : outcome === 'B' ? 2 : 0,
        resolutionDetails || 'Manual resolution'
      );

      await tx.wait();
      setSuccess(`Market ${marketId} resolved successfully with outcome ${outcome}`);
      setMarketId('');
      setResolutionDetails('');
    } catch (err: any) {
      console.error('Error resolving market:', err);
      setError(err.message || 'Failed to resolve market');
    } finally {
      setLoading(false);
    }
  };

  const resolveMarketFromOracle = async () => {
    if (!marketId) {
      setError('Please enter a market ID');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const contract = await getContract();
      if (!contract) throw new Error('Contract not initialized');

      const tx = await contract.resolveMarketFromOracle(marketId);
      await tx.wait();
      setSuccess(`Market ${marketId} resolved from oracle`);
      setMarketId('');
    } catch (err: any) {
      console.error('Error resolving market from oracle:', err);
      setError(err.message || 'Failed to resolve market from oracle');
    } finally {
      setLoading(false);
    }
  };

  // Fee Management Functions
  const updateFeePercent = async () => {
    if (!newFeePercent) {
      setError('Please enter a fee percentage');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const contract = await getContract();
      if (!contract) throw new Error('Contract not initialized');

      const tx = await contract.setFeePercent(
        Math.floor(parseFloat(newFeePercent) * 100)
      );

      await tx.wait();
      setSuccess(`Fee percentage updated to ${newFeePercent}%`);
      setNewFeePercent('');
    } catch (err: any) {
      console.error('Error updating fee percentage:', err);
      setError(err.message || 'Failed to update fee percentage');
    } finally {
      setLoading(false);
    }
  };

  const updateMarketCreationFee = async () => {
    if (!marketCreationFee) {
      setError('Please enter a market creation fee');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const contract = await getContract();
      if (!contract) throw new Error('Contract not initialized');

      const tx = await contract.setMarketCreationFee(ethers.parseEther(marketCreationFee));
      await tx.wait();
      setSuccess(`Market creation fee updated to ${marketCreationFee} ETH`);
      setMarketCreationFee('');
    } catch (err: any) {
      console.error('Error updating market creation fee:', err);
      setError(err.message || 'Failed to update market creation fee');
    } finally {
      setLoading(false);
    }
  };

  const updateWinningFee = async () => {
    if (!winningFee) {
      setError('Please enter a winning fee percentage');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const contract = await getContract();
      if (!contract) throw new Error('Contract not initialized');

      const tx = await contract.setWinningFee(Math.floor(parseFloat(winningFee) * 100));
      await tx.wait();
      setSuccess(`Winning fee updated to ${winningFee}%`);
      setWinningFee('');
    } catch (err: any) {
      console.error('Error updating winning fee:', err);
      setError(err.message || 'Failed to update winning fee');
    } finally {
      setLoading(false);
    }
  };

  const updateSellFee = async () => {
    if (!sellFee) {
      setError('Please enter a sell fee percentage');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const contract = await getContract();
      if (!contract) throw new Error('Contract not initialized');

      const tx = await contract.setSellFee(Math.floor(parseFloat(sellFee) * 100));
      await tx.wait();
      setSuccess(`Sell fee updated to ${sellFee}%`);
      setSellFee('');
    } catch (err: any) {
      console.error('Error updating sell fee:', err);
      setError(err.message || 'Failed to update sell fee');
    } finally {
      setLoading(false);
    }
  };

  const updateFeeRecipient = async () => {
    if (!newFeeRecipient || !ethers.isAddress(newFeeRecipient)) {
      setError('Please enter a valid address');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const contract = await getContract();
      if (!contract) throw new Error('Contract not initialized');

      const tx = await contract.setFeeRecipient(newFeeRecipient);
      await tx.wait();
      setSuccess(`Fee recipient updated to ${newFeeRecipient}`);
      setNewFeeRecipient('');
    } catch (err: any) {
      console.error('Error updating fee recipient:', err);
      setError(err.message || 'Failed to update fee recipient');
    } finally {
      setLoading(false);
    }
  };

  // Position Limit Functions
  const updatePositionLimits = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const contract = await getContract();
      if (!contract) throw new Error('Contract not initialized');

      if (maxPosition) {
        const tx1 = await contract.setMaxPosition(ethers.parseEther(maxPosition));
        await tx1.wait();
      }

      if (minPosition) {
        const tx2 = await contract.setMinPosition(ethers.parseEther(minPosition));
        await tx2.wait();
      }

      if (minInitialPool) {
        const tx3 = await contract.setMinInitialPool(ethers.parseEther(minInitialPool));
        await tx3.wait();
      }

      setSuccess('Position limits updated successfully');
      setMaxPosition('');
      setMinPosition('');
      setMinInitialPool('');
    } catch (err: any) {
      console.error('Error updating position limits:', err);
      setError(err.message || 'Failed to update position limits');
    } finally {
      setLoading(false);
    }
  };

  // Oracle Management Functions
  const updateOracle = async () => {
    if (!oracleAddress || !oracleUpdater) {
      setError('Please enter both oracle address and updater');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const contract = await getContract();
      if (!contract) throw new Error('Contract not initialized');

      const tx = await contract.setOracle(oracleAddress, oracleUpdater);
      await tx.wait();
      setSuccess('Oracle settings updated successfully');
      setOracleAddress('');
      setOracleUpdater('');
    } catch (err: any) {
      console.error('Error updating oracle:', err);
      setError(err.message || 'Failed to update oracle');
    } finally {
      setLoading(false);
    }
  };

  const updateRefundWindow = async () => {
    if (!refundWindow) {
      setError('Please enter a refund window duration');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const contract = await getContract();
      if (!contract) throw new Error('Contract not initialized');

      const tx = await contract.setRefundWindow(parseInt(refundWindow) * 86400); // Convert days to seconds
      await tx.wait();
      setSuccess(`Refund window updated to ${refundWindow} days`);
      setRefundWindow('');
    } catch (err: any) {
      console.error('Error updating refund window:', err);
      setError(err.message || 'Failed to update refund window');
    } finally {
      setLoading(false);
    }
  };

  // Referral Management Functions
  const updateBaseReferralFeeShare = async () => {
    if (!baseReferralFeeShare) {
      setError('Please enter base referral fee share');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateBaseFeeShare(parseFloat(baseReferralFeeShare));
      setSuccess(`Base referral fee share updated to ${baseReferralFeeShare}%`);
      setBaseReferralFeeShare('');
    } catch (err: any) {
      console.error('Error updating base referral fee share:', err);
      setError(err.message || 'Failed to update base referral fee share');
    } finally {
      setLoading(false);
    }
  };

  const updateUserReferralFeeShare = async () => {
    if (!userAddress || !userFeeShare) {
      setError('Please enter both user address and fee share');
      return;
    }

    if (!ethers.isAddress(userAddress)) {
      setError('Invalid user address');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await setCustomReferralFeeShare(userAddress, parseFloat(userFeeShare));
      setSuccess(`Custom fee share for ${userAddress} updated to ${userFeeShare}%`);
      setUserAddress('');
      setUserFeeShare('');
    } catch (err: any) {
      console.error('Error updating user referral fee share:', err);
      setError(err.message || 'Failed to update user referral fee share');
    } finally {
      setLoading(false);
    }
  };

  const updateReferralContract = async () => {
    if (!referralContractAddress) {
      setError('Please enter referral contract address');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const contract = await getContract();
      if (!contract) throw new Error('Contract not initialized');

      const tx = await contract.setReferralContract(referralContractAddress);
      await tx.wait();
      setSuccess('Referral contract updated successfully');
      setReferralContractAddress('');
    } catch (err: any) {
      console.error('Error updating referral contract:', err);
      setError(err.message || 'Failed to update referral contract');
    } finally {
      setLoading(false);
    }
  };

  // Contract Control Functions
  const togglePause = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const contract = await getContract();
      if (!contract) throw new Error('Contract not initialized');

      const tx = await (isPaused ? contract.unpause() : contract.pause());
      await tx.wait();
      setIsPaused(!isPaused);
      setSuccess(`Contract ${isPaused ? 'unpaused' : 'paused'} successfully`);
    } catch (err: any) {
      console.error('Error toggling pause state:', err);
      setError(err.message || 'Failed to toggle pause state');
    } finally {
      setLoading(false);
    }
  };

  const toggleManualResolution = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const contract = await getContract();
      if (!contract) throw new Error('Contract not initialized');

      const tx = await contract.toggleManualResolution();
      await tx.wait();
      setManualResolutionEnabled(!manualResolutionEnabled);
      setSuccess(`Manual resolution ${manualResolutionEnabled ? 'disabled' : 'enabled'}`);
    } catch (err: any) {
      console.error('Error toggling manual resolution:', err);
      setError(err.message || 'Failed to toggle manual resolution');
    } finally {
      setLoading(false);
    }
  };

  // Add endMarket function
  const endMarket = async () => {
    if (!marketId || !endReason) {
      setError('Please enter both market ID and end reason');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const contract = await getContract();
      if (!contract) throw new Error('Contract not initialized');

      const tx = await contract.endMarket(marketId, endReason, true); // withRefund set to true
      await tx.wait();
      setSuccess(`Market ${marketId} ended and refunded successfully`);
      setMarketId('');
      setEndReason('');
    } catch (err: any) {
      console.error('Error ending market:', err);
      setError(err.message || 'Failed to end market');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Market Resolution */}
      <div className="cyber-card">
        <h2 className="cyber-subtitle mb-4">Market Resolution</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Market ID</label>
            <input
              type="number"
              value={marketId}
              onChange={(e) => setMarketId(e.target.value)}
              className="cyber-input w-full"
              placeholder="Enter market ID"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">End Reason (for Refund)</label>
            <input
              type="text"
              value={endReason}
              onChange={(e) => setEndReason(e.target.value)}
              className="cyber-input w-full"
              placeholder="Enter reason for ending market"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Outcome</label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value as 'A' | 'B' | 'REFUND')}
              className="cyber-input w-full"
              disabled={loading}
            >
              <option value="A">Option A Wins</option>
              <option value="B">Option B Wins</option>
              <option value="REFUND">Refund</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Resolution Details</label>
            <input
              type="text"
              value={resolutionDetails}
              onChange={(e) => setResolutionDetails(e.target.value)}
              className="cyber-input w-full"
              placeholder="Enter resolution details"
              disabled={loading}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={resolveMarket}
              disabled={loading}
              className="cyber-button flex-1"
            >
              Resolve Manually
            </button>
            <button
              onClick={resolveMarketFromOracle}
              disabled={loading}
              className="cyber-button flex-1"
            >
              Resolve from Oracle
            </button>
            <button
              onClick={endMarket}
              disabled={loading}
              className="cyber-button flex-1 bg-yellow-600"
            >
              End & Refund
            </button>
          </div>
        </div>
      </div>

      {/* Fee Management */}
      <div className="cyber-card">
        <h2 className="cyber-subtitle mb-4">Fee Management</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Market Creation Fee (ETH)</label>
            <input
              type="number"
              value={marketCreationFee}
              onChange={(e) => setMarketCreationFee(e.target.value)}
              className="cyber-input w-full"
              placeholder="Enter market creation fee"
              step="0.1"
              min="0"
              disabled={loading}
            />
            <button
              onClick={updateMarketCreationFee}
              disabled={loading}
              className="cyber-button w-full mt-2"
            >
              Update Market Creation Fee
            </button>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Winning Fee (%)</label>
            <input
              type="number"
              value={winningFee}
              onChange={(e) => setWinningFee(e.target.value)}
              className="cyber-input w-full"
              placeholder="Enter winning fee percentage"
              step="0.1"
              min="0"
              max="50"
              disabled={loading}
            />
            <button
              onClick={updateWinningFee}
              disabled={loading}
              className="cyber-button w-full mt-2"
            >
              Update Winning Fee
            </button>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Sell Fee (%)</label>
            <input
              type="number"
              value={sellFee}
              onChange={(e) => setSellFee(e.target.value)}
              className="cyber-input w-full"
              placeholder="Enter sell fee percentage"
              step="0.1"
              min="0"
              max="50"
              disabled={loading}
            />
            <button
              onClick={updateSellFee}
              disabled={loading}
              className="cyber-button w-full mt-2"
            >
              Update Sell Fee
            </button>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Fee Recipient</label>
            <input
              type="text"
              value={newFeeRecipient}
              onChange={(e) => setNewFeeRecipient(e.target.value)}
              className="cyber-input w-full"
              placeholder="Enter fee recipient address"
              disabled={loading}
            />
            <button
              onClick={updateFeeRecipient}
              disabled={loading}
              className="cyber-button w-full mt-2"
            >
              Update Fee Recipient
            </button>
          </div>
        </div>
      </div>

      {/* Position Limits */}
      <div className="cyber-card">
        <h2 className="cyber-subtitle mb-4">Position Limits</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Max Position (ETH)</label>
            <input
              type="number"
              value={maxPosition}
              onChange={(e) => setMaxPosition(e.target.value)}
              className="cyber-input w-full"
              placeholder="Enter max position"
              step="0.1"
              min="0"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Min Position (ETH)</label>
            <input
              type="number"
              value={minPosition}
              onChange={(e) => setMinPosition(e.target.value)}
              className="cyber-input w-full"
              placeholder="Enter min position"
              step="0.1"
              min="0"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Min Initial Pool (ETH)</label>
            <input
              type="number"
              value={minInitialPool}
              onChange={(e) => setMinInitialPool(e.target.value)}
              className="cyber-input w-full"
              placeholder="Enter min initial pool"
              step="0.1"
              min="0"
              disabled={loading}
            />
          </div>

          <button
            onClick={updatePositionLimits}
            disabled={loading}
            className="cyber-button w-full"
          >
            Update Position Limits
          </button>
        </div>
      </div>

      {/* Oracle Management */}
      <div className="cyber-card">
        <h2 className="cyber-subtitle mb-4">Oracle Management</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Oracle Address</label>
            <input
              type="text"
              value={oracleAddress}
              onChange={(e) => setOracleAddress(e.target.value)}
              className="cyber-input w-full"
              placeholder="Enter oracle contract address"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Oracle Updater</label>
            <input
              type="text"
              value={oracleUpdater}
              onChange={(e) => setOracleUpdater(e.target.value)}
              className="cyber-input w-full"
              placeholder="Enter oracle updater address"
              disabled={loading}
            />
          </div>

          <button
            onClick={updateOracle}
            disabled={loading}
            className="cyber-button w-full"
          >
            Update Oracle Settings
          </button>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Refund Window (Days)</label>
            <input
              type="number"
              value={refundWindow}
              onChange={(e) => setRefundWindow(e.target.value)}
              className="cyber-input w-full"
              placeholder="Enter refund window in days"
              min="1"
              disabled={loading}
            />
            <button
              onClick={updateRefundWindow}
              disabled={loading}
              className="cyber-button w-full mt-2"
            >
              Update Refund Window
            </button>
          </div>
        </div>
      </div>

      {/* Referral Management */}
      <div className="cyber-card">
        <h2 className="cyber-subtitle mb-4">Referral Management</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Base Referral Fee Share (%)</label>
            <input
              type="number"
              value={baseReferralFeeShare}
              onChange={(e) => setBaseReferralFeeShare(e.target.value)}
              className="cyber-input w-full"
              placeholder="Enter base referral fee share percentage"
              step="0.1"
              min="0"
              max="50"
              disabled={loading}
            />
            <button
              onClick={updateBaseReferralFeeShare}
              disabled={loading}
              className="cyber-button w-full mt-2"
            >
              Update Base Fee Share
            </button>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Custom User Fee Share</label>
            <input
              type="text"
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              className="cyber-input w-full mb-2"
              placeholder="Enter user address"
              disabled={loading}
            />
            <input
              type="number"
              value={userFeeShare}
              onChange={(e) => setUserFeeShare(e.target.value)}
              className="cyber-input w-full"
              placeholder="Enter custom fee share percentage"
              step="0.1"
              min="0"
              max="50"
              disabled={loading}
            />
            <button
              onClick={updateUserReferralFeeShare}
              disabled={loading}
              className="cyber-button w-full mt-2"
            >
              Update User Fee Share
            </button>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Referral Contract</label>
            <input
              type="text"
              value={referralContractAddress}
              onChange={(e) => setReferralContractAddress(e.target.value)}
              className="cyber-input w-full"
              placeholder="Enter referral contract address"
              disabled={loading}
            />
            <button
              onClick={updateReferralContract}
              disabled={loading}
              className="cyber-button w-full mt-2"
            >
              Update Referral Contract
            </button>
          </div>
        </div>
      </div>

      {/* Contract Control */}
      <div className="cyber-card">
        <h2 className="cyber-subtitle mb-4">Contract Control</h2>
        <div className="space-y-4">
          <button
            onClick={togglePause}
            disabled={loading}
            className="cyber-button w-full"
          >
            {loading ? 'Processing...' : isPaused ? 'Unpause Contract' : 'Pause Contract'}
          </button>

          <button
            onClick={toggleManualResolution}
            disabled={loading}
            className="cyber-button w-full"
          >
            {loading ? 'Processing...' : manualResolutionEnabled ? 'Disable Manual Resolution' : 'Enable Manual Resolution'}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="cyber-card bg-red-900/20 border-red-500/20">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {success && (
        <div className="cyber-card bg-green-900/20 border-green-500/20">
          <p className="text-green-500">{success}</p>
        </div>
      )}
    </div>
  );
} 