'use client';

import { Web3Provider } from '@/components/Web3Provider';
import { ReferralProvider } from '@/components/ReferralProvider';
import { GraphQLProvider } from '@/components/GraphQLProvider';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { metaMask, coinbaseWallet } from 'wagmi/connectors';
import Navbar from '@/components/Navbar';
import { useEffect, useState } from 'react';
import { createStorage } from '@wagmi/core';

// Create a client-side only config to avoid SSR issues with window.ethereum
function createWagmiConfig() {
  // Safe check for window object (for SSR)
  if (typeof window === 'undefined') {
    return createConfig({
      chains: [baseSepolia],
      connectors: [],
      transports: {
        [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_RPC || 'https://sepolia.base.org')
      },
      ssr: true
    });
  }

  // Create storage for persisting connection
  const storage = createStorage({
    storage: window.localStorage,
  });

  return createConfig({
    chains: [baseSepolia],
    connectors: [
      metaMask(),
      coinbaseWallet({ 
        appName: 'PogPredict',
      })
    ],
    transports: {
      [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_RPC || 'https://sepolia.base.org')
    },
    ssr: true,
    // Add persistence
    storage: storage,
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [wagmiConfig] = useState(() => createWagmiConfig());

  // Only show UI after component has mounted to prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and initial client render, render a minimal version
  // that matches what the server would render
  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <div className="flex justify-center items-center min-h-screen">
            {/* Empty div to match structure but no text content */}
          </div>
        </main>
        <footer className="border-t border-pog-orange/20 py-6 mt-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <div className="text-2xl font-bold bg-gradient-to-r from-pog-orange to-pog-accent bg-clip-text text-transparent">
                  PogPredict
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  The premier prediction market for esports enthusiasts
                </p>
              </div>
              <div className="flex space-x-6">
                <a 
                  href="https://x.com/PogPredict" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-pog-orange transition-colors"
                >
                  Twitter
                </a>
                <a 
                  href="https://discord.gg/TmNqweVxqc" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-pog-orange transition-colors"
                >
                  Discord
                </a>
                <a 
                  href="https://x.com/PogPredict/status/1882458383548318208" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-pog-orange transition-colors"
                >
                  Docs
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // After mounting, render the full UI with client-side features
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Web3Provider>
          <ReferralProvider>
            <GraphQLProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">
                  {children}
                </main>
                <footer className="border-t border-pog-orange/20 py-6 mt-12">
                  <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                      <div className="text-center md:text-left mb-4 md:mb-0">
                        <div className="text-2xl font-bold bg-gradient-to-r from-pog-orange to-pog-accent bg-clip-text text-transparent">
                          PogPredict
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          The premier prediction market for esports enthusiasts
                        </p>
                      </div>
                      <div className="flex space-x-6">
                        <a 
                          href="https://x.com/PogPredict" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-pog-orange transition-colors"
                        >
                          Twitter
                        </a>
                        <a 
                          href="https://discord.gg/TmNqweVxqc" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-pog-orange transition-colors"
                        >
                          Discord
                        </a>
                        <a 
                          href="https://x.com/PogPredict/status/1882458383548318208" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-pog-orange transition-colors"
                        >
                          Docs
                        </a>
                      </div>
                    </div>
                  </div>
                </footer>
              </div>
            </GraphQLProvider>
          </ReferralProvider>
        </Web3Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
