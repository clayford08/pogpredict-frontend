'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect, useWalletClient, useSwitchChain, Connector } from 'wagmi';
import { metaMask, coinbaseWallet } from 'wagmi/connectors';
import { baseSepolia } from 'wagmi/chains';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import WalletFallback from './WalletFallback';
import WalletConnectModal from './WalletConnectModal';

interface Web3ContextType {
  account: string | null;
  signer: JsonRpcSigner | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isConnecting: boolean;
  error: Error | null;
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  signer: null,
  connect: async () => {},
  disconnect: async () => {},
  isConnecting: false,
  error: null,
});

export const useWeb3 = () => useContext(Web3Context);

// Define wallet options
const walletOptions = [
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    connector: coinbaseWallet({ appName: 'PogPredict' }),
    icon: '/wallets/coinbase.svg',
    description: 'Connect using Coinbase Wallet app',
    preferred: true
  },
  {
    id: 'metamask',
    name: 'MetaMask',
    connector: metaMask(),
    icon: '/wallets/metamask.svg',
    description: 'Connect using MetaMask browser extension'
  }
];

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected, chain } = useAccount();
  const { connectAsync, isPending } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isWalletAvailable, setIsWalletAvailable] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Only run client-side code after mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const initializeSigner = async () => {
      if (!mounted || !isConnected) {
        setSigner(null);
        return;
      }
      
      if (walletClient) {
        try {
          // Check if we're on the right chain
          if (chain?.id !== baseSepolia.id) {
            await switchChainAsync({ chainId: baseSepolia.id });
          }

          const provider = new BrowserProvider(walletClient.transport, {
            name: baseSepolia.name,
            chainId: baseSepolia.id
          });
          const signer = await provider.getSigner();
          setSigner(signer);
          setError(null);
        } catch (err) {
          console.error('Error initializing signer:', err);
          setError(err instanceof Error ? err : new Error('Failed to initialize wallet'));
          setSigner(null);
        }
      } else {
        setSigner(null);
      }
    };

    initializeSigner();
  }, [walletClient, chain?.id, switchChainAsync, isConnected, mounted]);

  const connect = async () => {
    setIsWalletModalOpen(true);
  };

  const handleSelectWallet = async (connector: Connector) => {
    try {
      setError(null);
      await connectAsync({ 
        connector,
        chainId: baseSepolia.id
      });
      setIsWalletModalOpen(false);
    } catch (err) {
      console.error('Error connecting to wallet:', err);
      // Close the modal even if there's an error (like user rejection)
      setIsWalletModalOpen(false);
      
      // Only set error if it's not a user rejection
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      if (!errorMessage.includes('user rejected') && !errorMessage.includes('rejected by user')) {
        setError(err instanceof Error ? err : new Error('Failed to connect wallet'));
      }
    }
  };

  const disconnect = async () => {
    try {
      await disconnectAsync();
      setSigner(null);
      setError(null);
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
      setError(err instanceof Error ? err : new Error('Failed to disconnect wallet'));
    }
  };

  // If not mounted yet, render children without wallet functionality
  // This ensures consistent rendering between server and client
  if (!mounted) {
    return (
      <Web3Context.Provider 
        value={{ 
          account: null,
          signer: null,
          connect: async () => {},
          disconnect: async () => {},
          isConnecting: false,
          error: null
        }}
      >
        {children}
      </Web3Context.Provider>
    );
  }

  // If no wallet is available and we're on the client side, show the fallback
  if (mounted && !isWalletAvailable) {
    return <WalletFallback error={error?.message} />;
  }

  return (
    <Web3Context.Provider 
      value={{ 
        account: isConnected ? address as string : null,
        signer,
        connect,
        disconnect,
        isConnecting: isPending,
        error
      }}
    >
      {children}
      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        walletOptions={walletOptions}
        onSelectWallet={handleSelectWallet}
        isConnecting={isPending}
        connectError={error}
      />
    </Web3Context.Provider>
  );
};
