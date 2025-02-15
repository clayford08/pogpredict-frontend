import { type Chain } from 'viem';

export const AVALANCHE_TESTNET: Chain = {
  id: 43113,
  name: 'Avalanche Fuji',
  nativeCurrency: {
    decimals: 18,
    name: 'Avalanche',
    symbol: 'AVAX',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_AVALANCHE_RPC || 'https://api.avax-test.network/ext/bc/C/rpc'],
      webSocket: [process.env.NEXT_PUBLIC_AVALANCHE_WS || 'wss://api.avax-test.network/ext/bc/C/ws']
    },
    public: {
      http: [process.env.NEXT_PUBLIC_AVALANCHE_RPC || 'https://api.avax-test.network/ext/bc/C/rpc'],
      webSocket: [process.env.NEXT_PUBLIC_AVALANCHE_WS || 'wss://api.avax-test.network/ext/bc/C/ws']
    }
  },
  blockExplorers: {
    default: {
      name: 'SnowTrace',
      url: process.env.NEXT_PUBLIC_BLOCK_EXPLORER || 'https://testnet.snowtrace.io'
    }
  },
  testnet: true
};

export const CONTRACT_ADDRESSES = {
  CS2Oracle: process.env.NEXT_PUBLIC_CS2_ORACLE_ADDRESS || '0x0000000000000000000000000000000000000000',
  Referral: process.env.NEXT_PUBLIC_REFERRAL_ADDRESS || '0x0000000000000000000000000000000000000000',
  PogPredict: process.env.NEXT_PUBLIC_POGPREDICT_ADDRESS || '0x0000000000000000000000000000000000000000'
} as const;

export const chains = [AVALANCHE_TESTNET];
export const defaultChain = AVALANCHE_TESTNET; 