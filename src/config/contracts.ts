import ReferralArtifact from '../../artifacts/contracts/Referral.sol/Referral.json';
import PogPredictArtifact from '../../artifacts/contracts/PogPredict.sol/PogPredict.json';

export const BASE_SEPOLIA = {
  id: 84532,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: process.env.NEXT_PUBLIC_BASE_RPC || 'https://sepolia.base.org',
  },
  blockExplorers: {
    default: { 
      name: 'BaseScan', 
      url: process.env.NEXT_PUBLIC_BLOCK_EXPLORER || 'https://sepolia.basescan.org' 
    },
  },
  testnet: true,
  contracts: {
    CS2Oracle: process.env.NEXT_PUBLIC_CS2_ORACLE_ADDRESS || '0x0000000000000000000000000000000000000000',
    Referral: process.env.NEXT_PUBLIC_REFERRAL_ADDRESS || '0x0000000000000000000000000000000000000000',
    PogPredict: process.env.NEXT_PUBLIC_POGPREDICT_ADDRESS || '0x0000000000000000000000000000000000000000'
  }
};

// Contract addresses and ABIs
export const contracts = {
  PogPredict: {
    address: process.env.NEXT_PUBLIC_POGPREDICT_ADDRESS || '0x0000000000000000000000000000000000000000',
    abi: PogPredictArtifact.abi
  },
  Referral: {
    address: process.env.NEXT_PUBLIC_REFERRAL_ADDRESS || '0x0000000000000000000000000000000000000000',
    abi: ReferralArtifact.abi
  }
};

// Contract addresses on Base Sepolia
export const POGPREDICT_ADDRESS = process.env.NEXT_PUBLIC_POGPREDICT_ADDRESS || '0x0000000000000000000000000000000000000000';
export const REFERRAL_ADDRESS = process.env.NEXT_PUBLIC_REFERRAL_ADDRESS || '0x0000000000000000000000000000000000000000'; 