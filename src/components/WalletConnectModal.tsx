'use client';

import React from 'react';
import { Connector } from 'wagmi';
import Image from 'next/image';

interface WalletOption {
  id: string;
  name: string;
  connector: any;
  icon: string;
  description: string;
  preferred?: boolean;
}

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletOptions: WalletOption[];
  onSelectWallet: (connector: Connector) => void;
  isConnecting: boolean;
  connectError: Error | null;
}

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onClose,
  walletOptions,
  onSelectWallet,
  isConnecting,
  connectError
}) => {
  if (!isOpen) return null;

  // Sort wallet options to put preferred ones first
  const sortedOptions = [...walletOptions].sort((a, b) => {
    if (a.preferred && !b.preferred) return -1;
    if (!a.preferred && b.preferred) return 1;
    return 0;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="cyber-card max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <h2 className="text-xl font-bold text-pog-orange mb-6">Connect Your Wallet</h2>
        
        {connectError && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-500">
            {connectError.message}
          </div>
        )}

        <div className="space-y-3">
          {sortedOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelectWallet(option.connector)}
              disabled={isConnecting}
              className={`w-full flex items-center p-4 rounded-lg border transition-all duration-200 ${
                option.preferred 
                  ? 'border-pog-orange bg-pog-orange/10 hover:bg-pog-orange/20' 
                  : 'border-gray-700 bg-gray-800/50 hover:bg-gray-700/50'
              }`}
            >
              <div className="w-10 h-10 relative mr-4 flex-shrink-0 bg-white/10 rounded-full p-2">
                <Image
                  src={option.icon}
                  alt={option.name}
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold flex items-center">
                  {option.name}
                  {option.preferred && (
                    <span className="ml-2 text-xs bg-pog-orange text-white px-2 py-0.5 rounded-full">
                      Preferred
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-400">{option.description}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>New to Ethereum wallets? <a href="https://ethereum.org/en/wallets/" target="_blank" rel="noopener noreferrer" className="text-pog-orange hover:underline">Learn more</a></p>
        </div>
      </div>
    </div>
  );
};

export default WalletConnectModal; 