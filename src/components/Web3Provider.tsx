'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { AVALANCHE_TESTNET } from '../config/networks';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Web3ContextType {
  account: string | null;
  provider: ethers.Provider | null;
  signer: ethers.Signer | null;
  connect: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  provider: null,
  signer: null,
  connect: async () => {},
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const setupProvider = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum, {
        name: AVALANCHE_TESTNET.name,
        chainId: AVALANCHE_TESTNET.id
      });
      
      // Request network switch if needed
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${AVALANCHE_TESTNET.id.toString(16)}` }],
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${AVALANCHE_TESTNET.id.toString(16)}`,
                  chainName: AVALANCHE_TESTNET.name,
                  nativeCurrency: AVALANCHE_TESTNET.nativeCurrency,
                  rpcUrls: [AVALANCHE_TESTNET.rpcUrls.default],
                  blockExplorerUrls: [AVALANCHE_TESTNET.blockExplorers.default.url],
                },
              ],
            });
          } catch (addError) {
            console.error('Error adding chain:', addError);
          }
        }
      }

      return provider;
    }
    return null;
  };

  const connect = async () => {
    try {
      const provider = await setupProvider();
      if (!provider) {
        console.log('Please install MetaMask!');
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        const signer = await provider.getSigner();
        setAccount(accounts[0]);
        setProvider(provider);
        setSigner(signer);
      }
    } catch (err) {
      console.error('Error connecting to MetaMask', err);
    }
  };

  useEffect(() => {
    // Check if already connected
    if (typeof window.ethereum !== 'undefined') {
      setupProvider().then(provider => {
        if (provider) {
          window.ethereum.request({ method: 'eth_accounts' })
            .then(async (accounts: any) => {
              if (accounts && accounts.length > 0) {
                const signer = await provider.getSigner();
                setAccount(accounts[0]);
                setProvider(provider);
                setSigner(signer);
              }
            })
            .catch(console.error);

          // Listen for account changes
          window.ethereum.on('accountsChanged', async (accounts: any) => {
            if (accounts && accounts.length > 0) {
              const signer = await provider.getSigner();
              setAccount(accounts[0]);
              setProvider(provider);
              setSigner(signer);
            } else {
              setAccount(null);
              setProvider(null);
              setSigner(null);
            }
          });

          // Listen for chain changes
          window.ethereum.on('chainChanged', () => {
            window.location.reload();
          });
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  return (
    <Web3Context.Provider value={{ account, provider, signer, connect }}>
      {children}
    </Web3Context.Provider>
  );
};
