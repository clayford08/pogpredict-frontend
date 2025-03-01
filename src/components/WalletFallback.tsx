'use client';

import React from 'react';
import ClientOnly from './ClientOnly';

interface WalletFallbackProps {
  error?: string;
}

const WalletFallback: React.FC<WalletFallbackProps> = ({ error }) => {
  return (
    <ClientOnly fallback={
      <div className="cyber-card text-center p-6 max-w-lg mx-auto my-8">
        <h2 className="text-xl font-bold text-pog-orange mb-4">Loading...</h2>
      </div>
    }>
      <div className="cyber-card text-center p-6 max-w-lg mx-auto my-8">
        <h2 className="text-xl font-bold text-pog-orange mb-4">Wallet Connection Required</h2>
        
        {error && (
          <div className="bg-red-900/20 border border-red-500/20 p-4 rounded-lg mb-4 text-red-400">
            {error}
          </div>
        )}
        
        <p className="mb-6 text-gray-300">
          To use PogPredict, you need a Web3 wallet like MetaMask. Please install a wallet extension or use a wallet-enabled browser.
        </p>
        
        <div className="space-y-4">
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="cyber-button bg-pog-orange block w-full"
          >
            Install MetaMask
          </a>
          
          <a 
            href="https://ethereum.org/en/wallets/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-pog-orange hover:underline"
          >
            Learn about other wallets
          </a>
        </div>
        
        <div className="mt-8 text-sm text-gray-400">
          <p>After installing a wallet, please refresh this page.</p>
        </div>
      </div>
    </ClientOnly>
  );
};

export default WalletFallback; 