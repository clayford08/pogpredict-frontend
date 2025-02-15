import { useCallback } from 'react';
import { Contract, JsonRpcProvider, BrowserProvider } from 'ethers';
import { useWeb3 } from '@/components/Web3Provider';
import PogPredict2ABI from '@/abi/PogPredict2.json';
import { AVALANCHE_TESTNET, CONTRACT_ADDRESSES } from '../config/networks';

// Fallback RPC URLs for Avalanche Testnet
const RPC_URLS = [
  AVALANCHE_TESTNET.rpcUrls.default.http[0],
  'https://avalanche-fuji-c-chain-rpc.publicnode.com',
  'https://avalanche-fuji.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
];

interface ContractReturn {
  contract: Contract | null;
  provider: JsonRpcProvider | null;
}

export const usePogPredict = () => {
  const { signer } = useWeb3();

  const getContract = useCallback(async (): Promise<ContractReturn> => {
    if (!window.ethereum) return { contract: null, provider: null };

    try {
      // Try to get RPC URL from config, fallback to default if not available
      const rpcUrl = RPC_URLS[0];

      // Create provider with explicit network configuration
      const provider = new JsonRpcProvider(rpcUrl, {
        chainId: AVALANCHE_TESTNET.id,
        name: AVALANCHE_TESTNET.name
      });

      const contractAddress = CONTRACT_ADDRESSES.PogPredict;
      if (!contractAddress) {
        throw new Error('PogPredict contract address not configured');
      }

      // Create a new browser provider and signer
      const browserProvider = new BrowserProvider(window.ethereum);
      const newSigner = await browserProvider.getSigner();
      
      // Create contract with signer
      const contract = new Contract(
        contractAddress,
        PogPredict2ABI.abi,
        newSigner
      );

      return { contract, provider };
    } catch (err) {
      console.error('Error creating contract:', err);
      
      // Try fallback RPC URLs if the first one fails
      for (let i = 1; i < RPC_URLS.length; i++) {
        try {
          const provider = new JsonRpcProvider(RPC_URLS[i], {
            chainId: AVALANCHE_TESTNET.id,
            name: AVALANCHE_TESTNET.name
          });

          const contractAddress = CONTRACT_ADDRESSES.PogPredict;
          if (!contractAddress) {
            throw new Error('PogPredict contract address not configured');
          }

          // Create a new browser provider and signer
          const browserProvider = new BrowserProvider(window.ethereum);
          const newSigner = await browserProvider.getSigner();
          
          // Create contract with signer
          const contract = new Contract(
            contractAddress,
            PogPredict2ABI.abi,
            newSigner
          );

          return { contract, provider };
        } catch (fallbackErr) {
          console.error(`Fallback RPC ${i} failed:`, fallbackErr);
        }
      }
      
      return { contract: null, provider: null };
    }
  }, []);

  return {
    getContract,
  };
};
