import { formatUnits } from 'viem';
import { ethers } from 'ethers';

export function formatEther(value: string | bigint | null | undefined): string {
  if (!value) return '0';
  return ethers.formatEther(value);
}

export function parseEther(value: string): bigint {
  return ethers.parseEther(value);
}

export function formatPercent(value: number, decimals: number = 1): string {
  try {
    return `${value.toFixed(decimals)}%`;
  } catch (error) {
    console.error('Error formatting percent:', error);
    return '0.0%';
  }
}

export function formatTimeLeft(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = timestamp - now;

  if (diff <= 0) {
    return 'Ended';
  }

  const days = Math.floor(diff / (24 * 60 * 60));
  const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((diff % (60 * 60)) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function getWalletAddress(address: string | undefined): `0x${string}` {
  const defaultAddress = '0x0000000000000000000000000000000000000000' as const;
  if (!address?.startsWith('0x')) return defaultAddress;
  return address.toLowerCase() as `0x${string}`;
}

export function isDeployerAddress(address: string | null): boolean {
  if (!address) return false;
  return address.toLowerCase() === process.env.NEXT_PUBLIC_DEPLOYER_ADDRESS?.toLowerCase();
}

export function formatAVAX(value: string | bigint): string {
  if (!value) return '0.00';
  
  // If the value is already in ether format (contains a decimal point)
  if (typeof value === 'string' && value.includes('.')) {
    return Number(value).toFixed(2);
  }
  
  // Otherwise, convert from wei to ether first
  const etherValue = formatEther(value);
  return Number(etherValue).toFixed(2);
}

export function formatETH(value: string | bigint): string {
  if (!value) return '0.00';
  
  // If the value is already in ether format (contains a decimal point)
  if (typeof value === 'string' && value.includes('.')) {
    return Number(value).toFixed(2);
  }
  
  // Otherwise, convert from wei to ether first
  const etherValue = formatEther(value);
  return Number(etherValue).toFixed(2);
}
