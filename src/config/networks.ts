import { type Chain } from 'viem';

export const BASE_SEPOLIA: Chain = {
  id: 84532,
  name: 'Base Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_BASE_RPC || 'https://sepolia.base.org'],
      webSocket: [process.env.NEXT_PUBLIC_BASE_WS || 'wss://sepolia.base.org']
    },
    public: {
      http: [process.env.NEXT_PUBLIC_BASE_RPC || 'https://sepolia.base.org'],
      webSocket: [process.env.NEXT_PUBLIC_BASE_WS || 'wss://sepolia.base.org']
    }
  },
  blockExplorers: {
    default: {
      name: 'BaseScan',
      url: process.env.NEXT_PUBLIC_BLOCK_EXPLORER || 'https://sepolia.basescan.org'
    }
  },
  testnet: true
};

export const CONTRACT_ADDRESSES = {
  CS2Oracle: process.env.NEXT_PUBLIC_CS2_ORACLE_ADDRESS || '0x0000000000000000000000000000000000000000',
  Referral: process.env.NEXT_PUBLIC_REFERRAL_ADDRESS || '0x0000000000000000000000000000000000000000',
  PogPredict: process.env.NEXT_PUBLIC_POGPREDICT_ADDRESS || '0x0000000000000000000000000000000000000000'
} as const;

export const chains = [BASE_SEPOLIA];
export const defaultChain = BASE_SEPOLIA; 