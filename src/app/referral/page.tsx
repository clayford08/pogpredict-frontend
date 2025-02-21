'use client';

import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/components/Web3Provider';
import { useReferral } from '@/hooks/useReferral';

interface ReferralStats {
  totalReferrals: bigint;
  activeReferrals: bigint;
  totalEarnings: bigint;
  monthlyEarnings: bigint;
  referralList: {
    address: string;
    joinedDate: bigint;
    totalVolume: bigint;
    earnings: bigint;
  }[];
}

export default function ReferralPage() {
  const { account, connect } = useWeb3();
  const { getReferralCode, getReferralEarnings, getReferralCount, setReferralCode, hasReferrerSet, setReferrer } = useReferral();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // State for contract data
  const [referralCode, setReferralCodeState] = useState<string | null>(null);
  const [referralEarnings, setReferralEarnings] = useState<bigint | null>(null);
  const [referralCount, setReferralCount] = useState<bigint | null>(null);
  const [hasReferrer, setHasReferrer] = useState<boolean>(false);
  const [newCode, setNewCode] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [tempReferralCode, setTempReferralCode] = useState('');

  // Handle setting referrer
  const handleSetReferrer = async (code: string): Promise<boolean> => {
    try {
      setError('Setting referral code...');
      console.log('Starting referral code setting process...');
      
      // Set referrer using Referral contract
      const receipt = await setReferrer(code);
      console.log('Referral transaction completed:', receipt);
      
      // Wait for the referrer to be set
      setError('Waiting for referral transaction to be confirmed...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verify referrer was set
      const hasRef = await hasReferrerSet(account!);
      console.log('Referrer check result:', hasRef);
      
      if (!hasRef) {
        setError('Failed to set referral code. Please try again.');
        return false;
      }
      
      setHasReferrer(true);
      setReferralCode(code);
      setError('Referral code set successfully.');
      
      // Wait a moment for UI to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error: any) {
      console.error('Error setting referral code:', error);
      setError(error.message || 'Failed to set referral code');
      return false;
    }
  };

  useEffect(() => {
    const fetchReferralData = async () => {
      if (account) {
        try {
          try {
            const code = await getReferralCode(account);
            setReferralCodeState(code);
            setNewCode(code || '');
            if (code) {
              // Generate shareable URL
              setShareUrl(`https://pogpredict.io?ref=${code}`);
            }
          } catch (err) {
            console.error('Error fetching referral code:', err);
          }

          try {
            const earnings = await getReferralEarnings(account);
            setReferralEarnings(earnings);
          } catch (err) {
            console.error('Error fetching referral earnings:', err);
          }

          try {
            const count = await getReferralCount(account);
            setReferralCount(count);
          } catch (err) {
            console.error('Error fetching referral count:', err);
          }

          try {
            const hasRef = await hasReferrerSet(account);
            setHasReferrer(hasRef);
          } catch (err) {
            console.error('Error checking referrer status:', err);
          }
        } catch (error) {
          console.error('Error fetching referral data:', error);
        }
      }
    };

    fetchReferralData();
  }, [account, getReferralCode, getReferralEarnings, getReferralCount, hasReferrerSet]);

  const handleCopy = () => {
    if (referralCode) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpdateCode = async () => {
    if (!account) {
      connect();
      return;
    }

    if (newCode.length < 3) {
      setError('Code must be at least 3 characters');
      return;
    }

    if (!/^[A-Za-z0-9]+$/.test(newCode)) {
      setError('Code can only contain letters and numbers');
      return;
    }

    setIsUpdating(true);
    try {
      await setReferralCode(newCode);
      setReferralCodeState(newCode);
      // Update the share URL immediately after successful code update
      setShareUrl(`https://pogpredict.io?ref=${newCode}`);
      setIsEditing(false);
      setError(null);
    } catch (error) {
      console.error('Error updating referral code:', error);
      setError('Failed to update referral code');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShare = async () => {
    const tweetText = `Join me on @PogPredict, the premier esports prediction market! 🎮\n\nUse my referral code and get started: ${shareUrl}\n\n#PogPredict #Esports #Trading`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
  };

  const generateShareImage = async () => {
    // Create and load Inter font
    const interFont = new FontFace(
      'InterCanvas',
      'url(https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2)'
    );
    
    try {
      const font = await interFont.load();
      document.fonts.add(font);
    } catch (err) {
      console.error('Failed to load Inter font:', err);
    }

    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 1200;
    canvas.height = 630;

    // Create background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, '#0F1115');
    bgGradient.addColorStop(1, '#1A1D24');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add decorative elements
    // Glowing circles
    const drawGlowingCircle = (x: number, y: number, radius: number) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, 'rgba(255, 69, 0, 0.2)');
      gradient.addColorStop(0.5, 'rgba(255, 69, 0, 0.1)');
      gradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    drawGlowingCircle(200, 200, 150);
    drawGlowingCircle(canvas.width - 200, canvas.height - 200, 180);

    // Add geometric patterns
    ctx.strokeStyle = 'rgba(255, 69, 0, 0.1)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * 150);
      ctx.lineTo(canvas.width, i * 100 + 200);
      ctx.stroke();
    }

    // Add border with gradient
    const borderGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    borderGradient.addColorStop(0, '#FF4500');
    borderGradient.addColorStop(0.5, '#FF6A00');
    borderGradient.addColorStop(1, '#FF8C00');
    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Add inner glow
    const innerGlow = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    innerGlow.addColorStop(0, 'rgba(255, 69, 0, 0.1)');
    innerGlow.addColorStop(1, 'rgba(255, 140, 0, 0.1)');
    ctx.fillStyle = innerGlow;
    ctx.fillRect(40, 40, canvas.width - 80, canvas.height - 80);

    // Load and draw the logo
    try {
      const logo = new Image();
      logo.crossOrigin = "anonymous";
      // Use absolute path and log the attempt
      const logoPath = `${window.location.origin}/pog.png`;
      console.log('Attempting to load logo from:', logoPath);
      
      await new Promise<void>((resolve, reject) => {
        logo.onload = () => {
          console.log('Logo loaded successfully');
          resolve();
        };
        logo.onerror = (e) => {
          console.error('Failed to load logo:', e);
          console.error('Logo path attempted:', logoPath);
          console.error('Logo natural size:', logo.naturalWidth, 'x', logo.naturalHeight);
          resolve(); // Continue without logo if it fails to load
        };
        logo.src = logoPath;
      });

      if (logo.complete && logo.naturalHeight !== 0) {
        console.log('Logo is complete and has height, drawing to canvas');
        // Draw logo with glow effect
        const logoSize = 150;
        const logoX = canvas.width / 2 - logoSize / 2;
        const logoY = 50;

        // Add glow effect behind logo
        ctx.shadowColor = 'rgba(255, 69, 0, 0.4)';
        ctx.shadowBlur = 30;
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
        
        // Reset shadow for other elements
        ctx.shadowBlur = 0;
      } else {
        console.warn('Logo loaded but is not complete or has no height');
      }
    } catch (err) {
      console.error('Error handling logo:', err);
      // Continue without logo
    }

    // Add logo text with shadow (adjusted position for new logo size)
    ctx.shadowColor = 'rgba(255, 69, 0, 0.3)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 100px InterCanvas';
    ctx.textAlign = 'center';
    ctx.fillText('PogPredict', canvas.width / 2, 270);

    // Add tagline (adjusted position)
    ctx.shadowBlur = 0;
    ctx.font = 'bold 36px InterCanvas';
    ctx.fillStyle = '#FF4500';
    ctx.fillText('Premier Esports Prediction Market', canvas.width / 2, 320);

    // Add referral section
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    const boxHeight = 120;
    const boxY = canvas.height / 2 + 20;
    ctx.fillRect(canvas.width / 2 - 400, boxY, 800, boxHeight);
    
    // Add referral text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '32px InterCanvas';
    ctx.fillText('Use my referral code to get started:', canvas.width / 2, boxY + 50);
    
    // Add referral code
    ctx.font = 'bold 48px InterCanvas';
    ctx.fillStyle = '#FF4500';
    ctx.fillText(referralCode || '', canvas.width / 2, boxY + 100);

    // Add footer text
    ctx.font = '24px InterCanvas';
    ctx.fillStyle = '#888888';
    ctx.fillText('Join now at pogpredict.io', canvas.width / 2, canvas.height - 60);

    return canvas.toDataURL('image/png');
  };

  const handleDownloadImage = async () => {
    const imageUrl = await generateShareImage();
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'pogpredict-referral.png';
    link.click();
  };

  if (!account) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <div className="cyber-card text-center">
            <h1 className="cyber-title mb-6">Connect Wallet</h1>
            <p className="cyber-text mb-8">
              Connect your wallet to view and manage your referral code
            </p>
            <button onClick={() => connect()} className="cyber-button">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatBigInt = (value: bigint | null): string => {
    if (!value) return '0.00';
    return (Number(value) / 1e18).toFixed(2);
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="cyber-title mb-8 text-center">Referral Program</h1>
        <div className="cyber-card animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="gradient-border p-6 bg-black/30">
              <h2 className="cyber-subtitle mb-4">Your Referral Code</h2>
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-500">
                  {error}
                </div>
              )}
              {isEditing ? (
                <div className="flex items-center space-x-4 relative z-10">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      className="cyber-input w-full font-mono"
                      placeholder="Enter your referral code"
                      maxLength={20}
                      disabled={isUpdating}
                    />
                  </div>
                  <button
                    className="cyber-button bg-green-500"
                    onClick={handleUpdateCode}
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    className="cyber-button bg-black/30"
                    onClick={() => {
                      setNewCode(referralCode || '');
                      setError(null);
                      setIsEditing(false);
                    }}
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 bg-black/30 p-3 rounded border border-pog-orange/20">
                      <code className="text-pog-orange font-mono">{shareUrl || 'No code set'}</code>
                    </div>
                    <button
                      className={`cyber-button ${copied ? 'bg-green-500' : ''}`}
                      onClick={handleCopy}
                      disabled={!referralCode}
                    >
                      {copied ? 'Copied!' : 'Copy URL'}
                    </button>
                    <button
                      className="cyber-button bg-black/30 hover:bg-pog-orange/10"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </button>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      className="cyber-button flex-1 bg-[#1DA1F2] hover:bg-[#1A8CD8]"
                      onClick={handleShare}
                      disabled={!referralCode}
                    >
                      Share on X
                    </button>
                    <button
                      className="cyber-button flex-1 bg-pog-orange hover:bg-pog-orange/80"
                      onClick={handleDownloadImage}
                      disabled={!referralCode}
                    >
                      Download Image
                    </button>
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-400 mt-2">
                Share this link with friends to earn 5% of their trading fees
              </p>
            </div>

            <div className="gradient-border p-6 bg-black/30">
              <h2 className="cyber-subtitle mb-4">Earnings Overview</h2>
              <div>
                <div className="text-sm text-gray-400">Total Earnings</div>
                <div className="text-2xl font-bold text-pog-orange glow-text">
                  {formatBigInt(referralEarnings)} AVAX
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="gradient-border p-6 bg-black/30 text-center hover:scale-[1.02] transition-all duration-300">
              <div className="text-3xl font-bold text-pog-orange glow-text mb-2">
                {referralCount ? Number(referralCount) : 0}
              </div>
              <div className="text-gray-400">Total Referrals</div>
            </div>
            <div className="gradient-border p-6 bg-black/30 text-center hover:scale-[1.02] transition-all duration-300">
              <div className="text-3xl font-bold text-pog-orange glow-text mb-2">
                {referralCount ? Number(referralCount) : 0}
              </div>
              <div className="text-gray-400">Active Users</div>
            </div>
            <div className="gradient-border p-6 bg-black/30 text-center hover:scale-[1.02] transition-all duration-300">
              <div className="text-3xl font-bold text-pog-orange glow-text mb-2">5%</div>
              <div className="text-gray-400">Commission Rate</div>
            </div>
          </div>

          <div className="mt-8 p-6 gradient-border bg-black/30">
            <h3 className="cyber-subtitle mb-4">How It Works</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 hover:text-pog-orange transition-colors">
                <span className="text-pog-orange">•</span>
                <p>Share your unique referral code with friends</p>
              </div>
              <div className="flex items-start space-x-3 hover:text-pog-orange transition-colors">
                <span className="text-pog-orange">•</span>
                <p>When they create markets or trade using your code, you earn 5% of their fees</p>
              </div>
              <div className="flex items-start space-x-3 hover:text-pog-orange transition-colors">
                <span className="text-pog-orange">•</span>
                <p>Earnings are automatically credited to your account</p>
              </div>
              <div className="flex items-start space-x-3 hover:text-pog-orange transition-colors">
                <span className="text-pog-orange">•</span>
                <p>No limit on the number of referrals or earnings</p>
              </div>
            </div>
          </div>

          {/* Add Referrer Section */}
          {!hasReferrer && (
            <div className="bg-gray-800/50 rounded-lg p-6 border border-pog-orange/20 mt-8">
              <h2 className="text-xl font-bold text-white mb-4">Set Your Referrer</h2>
              <div className="space-y-4">
                <p className="text-gray-300">
                  Enter a referral code to set your referrer. This cannot be changed later.
                </p>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder="Enter referral code"
                    className="cyber-input flex-1"
                    value={tempReferralCode}
                    onChange={(e) => setTempReferralCode(e.target.value)}
                    disabled={isUpdating}
                  />
                  <button
                    onClick={async () => {
                      if (!tempReferralCode) return;
                      setIsUpdating(true);
                      try {
                        const success = await handleSetReferrer(tempReferralCode);
                        if (success) {
                          setError('Referral code set successfully!');
                        }
                      } finally {
                        setIsUpdating(false);
                      }
                    }}
                    disabled={isUpdating || !tempReferralCode}
                    className="cyber-button"
                  >
                    {isUpdating ? 'Setting...' : 'Set Referrer'}
                  </button>
                </div>
                <p className="text-sm text-gray-400">
                  Note: Setting a referrer is optional but cannot be changed once set.
                </p>
              </div>
            </div>
          )}

          {/* Referrer Status */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-pog-orange/20 mt-8">
            <h2 className="text-xl font-bold text-white mb-4">Referral Status</h2>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${hasReferrer ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-gray-300">
                {hasReferrer ? 'You have a referrer' : 'You do not have a referrer yet'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
