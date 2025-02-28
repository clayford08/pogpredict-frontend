import ReferralArtifact from '../../artifacts/contracts/Referral.sol/Referral.json';
import PogPredictArtifact from '../../artifacts/contracts/PogPredict.sol/PogPredict.json';

export const AVALANCHE_TESTNET = {
  id: 43113,
  name: 'Avalanche Testnet',
  network: 'avalanche-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: process.env.NEXT_PUBLIC_AVALANCHE_RPC || 'https://api.avax-test.network/ext/bc/C/rpc',
  },
  blockExplorers: {
    default: { 
      name: 'SnowTrace', 
      url: process.env.NEXT_PUBLIC_BLOCK_EXPLORER || 'https://testnet.snowtrace.io' 
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

// Contract addresses on Avalanche Fuji Testnet
export const POGPREDICT_ADDRESS = process.env.NEXT_PUBLIC_POGPREDICT_ADDRESS || '0x0000000000000000000000000000000000000000';
export const REFERRAL_ADDRESS = process.env.NEXT_PUBLIC_REFERRAL_ADDRESS || '0x0000000000000000000000000000000000000000'; 