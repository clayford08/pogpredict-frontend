'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useContract } from '@/hooks/useContract';
import AdminPanel from '@/components/AdminPanel';

export default function AdminPage() {
  const { address } = useAccount();
  const { getContract } = useContract();
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOwnership = async () => {
      if (!address) {
        setIsOwner(false);
        setLoading(false);
        return;
      }

      try {
        const contract = await getContract();
        if (!contract) {
          setIsOwner(false);
          setLoading(false);
          return;
        }

        const owner = await contract.owner();
        setIsOwner(owner.toLowerCase() === address.toLowerCase());
      } catch (error) {
        console.error('Error checking ownership:', error);
        setIsOwner(false);
      } finally {
        setLoading(false);
      }
    };

    checkOwnership();
  }, [address, getContract]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700 rounded w-1/4"></div>
            <div className="h-32 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="cyber-card">
            <p className="text-red-400">Please connect your wallet to access the admin panel.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="cyber-card">
            <p className="text-red-400">Only the contract owner can access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <AdminPanel address={address} />
      </div>
    </div>
  );
}
