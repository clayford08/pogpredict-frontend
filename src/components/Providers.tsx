'use client';

import { Web3Provider } from '@/components/Web3Provider';
import { ReferralProvider } from '@/components/ReferralProvider';
import { GraphQLProvider } from '@/components/GraphQLProvider';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { metaMask } from 'wagmi/connectors';
import Navbar from '@/components/Navbar';

const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    metaMask()
  ],
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_RPC || 'https://sepolia.base.org')
  },
  ssr: true
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
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
