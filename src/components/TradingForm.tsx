'use client';

import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/components/Web3Provider';
import { useContract } from '@/hooks/useContract';
import { useReferral } from '@/hooks/useReferral';
import { usePlaceBet } from '@/hooks/usePlaceBet';
import { formatEther, parseEther } from '@/lib/utils';

interface Market {
  id: number;
  optionA: string;
  optionB: string;
  poolA: string;
  poolB: string;
  status: string;
}

interface TradingFormProps {
  market: Market;
  onTransactionComplete?: () => void;
}

const TradingForm: React.FC<TradingFormProps> = ({ market, onTransactionComplete }) => {
  const { account, connect } = useWeb3();
  const { getPriceImpact } = useContract();
  const { placeBet } = usePlaceBet();
  const { setReferrer, isValidReferrer } = useReferral();
  const [selectedOption, setSelectedOption] = useState<'A' | 'B'>('A');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [priceImpact, setPriceImpact] = useState<string | null>(null);
  const [hasExistingReferrer, setHasExistingReferrer] = useState(false);

  // Check if user has referrer
  useEffect(() => {
    const checkReferrer = async () => {
      if (account) {
        const hasRef = await isValidReferrer(account);
        setHasExistingReferrer(hasRef);
      }
    };
    checkReferrer();
  }, [account, isValidReferrer]);

  // Calculate price impact when amount changes
  useEffect(() => {
    const updatePriceImpact = async () => {
      if (!amount || isNaN(parseFloat(amount))) {
        setPriceImpact(null);
        return;
      }

      try {
        const amountWei = parseEther(amount);
        const isOptionA = selectedOption === 'A';
        const impact = await getPriceImpact(market.id, amountWei.toString(), isOptionA);
        setPriceImpact(impact ? formatEther(impact) : null);
      } catch (err) {
        console.error('Error calculating price impact:', err);
        setPriceImpact(null);
      }
    };

    updatePriceImpact();
  }, [amount, selectedOption, market.id, getPriceImpact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      connect();
      return;
    }

    if (!amount) {
      setError('Please enter an amount');
      return;
    }

    try {
      setError(null);
      setLoading(true);

      // If referral code is provided, set it first
      if (referralCode && !hasExistingReferrer) {
        try {
          await setReferrer(referralCode);
        } catch (error) {
          console.error('Error setting referral code:', error);
          setError('Invalid referral code');
          return;
        }
      }

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error('Invalid amount');
      }

      const amountWei = parseEther(amount);
      const isOptionA = selectedOption === 'A';

      const tx = await placeBet({
        marketId: market.id.toString(),
        isOptionA,
        amount: amountWei.toString()
      });
      
      setSuccess(`Successfully placed bet on option ${selectedOption}!`);

      // Clear form
      setAmount('');
      setReferralCode('');
      setPriceImpact(null);
      
      // Refresh market data
      onTransactionComplete?.();
    } catch (err) {
      console.error('Error placing bet:', err);
      setError(err instanceof Error ? err.message : 'Failed to place bet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cyber-card">
      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-500">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-500">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Select Option
          </label>
          <div className="grid grid-cols-2 gap-4 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pog-orange/5 to-transparent rounded-lg pointer-events-none"></div>
            <button
              type="button"
              className={`p-4 rounded ${
                selectedOption === 'A'
                  ? 'bg-gradient-to-r from-pog-orange to-pog-accent text-white shadow-lg shadow-pog-orange/20 border-2 border-pog-orange'
                  : 'bg-pog-gray/20 text-gray-400 hover:bg-pog-gray/30 border-2 border-transparent'
              }`}
              onClick={() => setSelectedOption('A')}
            >
              <div className="font-bold">{market.optionA}</div>
              <div className="text-sm cyber-text">
                Pool: {formatEther(market.poolA)} AVAX
              </div>
            </button>
            <button
              type="button"
              className={`p-4 rounded ${
                selectedOption === 'B'
                  ? 'bg-gradient-to-r from-cyber-blue to-neon-purple text-white shadow-lg shadow-cyber-blue/20 border-2 border-cyber-blue'
                  : 'bg-pog-gray/20 text-gray-400 hover:bg-pog-gray/30 border-2 border-transparent'
              }`}
              onClick={() => setSelectedOption('B')}
            >
              <div className="font-bold">{market.optionB}</div>
              <div className="text-sm cyber-text">
                Pool: {formatEther(market.poolB)} AVAX
              </div>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Bet Amount (AVAX)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="cyber-input"
            placeholder="0.0"
            step="0.01"
          />
        </div>

        {amount && priceImpact && (
          <div className="gradient-border p-4 bg-black/30">
            <div className="text-sm text-gray-400">Price Impact</div>
            <div className="text-xl font-bold">{Number(priceImpact).toFixed(2)}%</div>
            <div className="text-sm text-gray-400 mt-1">
              Fee: 3% ({(parseFloat(amount) * 0.03).toFixed(4)} AVAX)
            </div>
          </div>
        )}

        {/* Optional Referral Code */}
        {!hasExistingReferrer && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Referral Code (Optional)
            </label>
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="cyber-input"
              placeholder="Enter referral code"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`
            cyber-button w-full
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            transition-all duration-200 relative overflow-hidden
          `}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
          {!account
            ? 'Connect Wallet'
            : loading 
              ? 'Placing Bet...' 
              : `Place Bet on ${selectedOption === 'A' ? market.optionA : market.optionB}`}
        </button>
      </form>

      <div className="mt-6 text-sm text-gray-400 space-y-2 gradient-border p-4 bg-black/30">
        <p>• 3% trading fee (1.5% to referrers, 1.5% to platform)</p>
        <p>• Cannot bet on both options simultaneously</p>
      </div>
    </div>
  );
};

export default TradingForm;
