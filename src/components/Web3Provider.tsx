'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect, useWalletClient, useSwitchChain } from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import { baseSepolia } from 'wagmi/chains';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import WalletFallback from './WalletFallback';

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

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected, chain } = useAccount();
  const { connectAsync, isPending } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isWalletAvailable, setIsWalletAvailable] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  // Only run client-side code after mounting
  useEffect(() => {
    setMounted(true);
    
    // Check if ethereum provider is available
    const checkProvider = () => {
      try {
        // Check if ethereum is available in window
        const hasEthereum = typeof window !== 'undefined' && 
                           (window as any).ethereum !== undefined;
        setIsWalletAvailable(hasEthereum);
        
        if (!hasEthereum) {
          console.warn('No Ethereum provider detected. Please install MetaMask or another wallet.');
        }
      } catch (err) {
        console.error('Error checking for Ethereum provider:', err);
        setIsWalletAvailable(false);
      }
    };
    
    checkProvider();
  }, []);

  useEffect(() => {
    const initializeSigner = async () => {
      if (!isWalletAvailable || !mounted) {
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
  }, [walletClient, chain?.id, switchChainAsync, isWalletAvailable, mounted]);

  const connect = async () => {
    if (!isWalletAvailable) {
      setError(new Error('No Ethereum wallet detected. Please install MetaMask or another compatible wallet.'));
      return;
    }
    
    try {
      setError(null);
      await connectAsync({ 
        connector: metaMask(),
        chainId: baseSepolia.id
      });
    } catch (err) {
      console.error('Error connecting to wallet:', err);
      setError(err instanceof Error ? err : new Error('Failed to connect wallet'));
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
    </Web3Context.Provider>
  );
};
